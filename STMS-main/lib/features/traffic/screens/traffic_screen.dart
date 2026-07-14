// lib/features/traffic/screens/traffic_screen.dart
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/shared_widgets.dart';
import '../../../core/services/traffic_service.dart';
import 'package:intl/intl.dart';

class TrafficScreen extends ConsumerStatefulWidget {
  const TrafficScreen({super.key});

  @override
  ConsumerState<TrafficScreen> createState() => _TrafficScreenState();
}

class _TrafficScreenState extends ConsumerState<TrafficScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseCtrl;
  late Animation<double> _pulse;
  
  List<dynamic> _incidents = [];
  bool _isLoading = true;
  String _selectedFilter = 'All';
  final _filters = ['All', 'Accidents', 'Congestion', 'Road Work'];

  // Map and Location variables
  final MapController _mapController = MapController();
  LatLng? _currentLocation;
  String _currentAddress = 'Detecting location...';
  String _currentCity = 'Egypt';
  bool _hasLocationPermission = false;

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    _pulse = Tween<double>(begin: 0.4, end: 1.0).animate(
      CurvedAnimation(parent: _pulseCtrl, curve: Curves.easeInOut),
    );
    
    _initLocationAndData();
  }

  Future<void> _initLocationAndData() async {
    await _getUserLocation();
    await _loadIncidents();
  }

  Future<void> _getUserLocation() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      setState(() => _currentAddress = 'Location services disabled');
      return;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        setState(() => _currentAddress = 'Location permission denied');
        return;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      setState(() => _currentAddress = 'Location permissions permanently denied');
      return;
    }

    _hasLocationPermission = true;

    try {
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      
      setState(() {
        _currentLocation = LatLng(position.latitude, position.longitude);
      });
      
      // Try to get address from coordinates
      try {
        List<Placemark> placemarks = await placemarkFromCoordinates(
          position.latitude,
          position.longitude,
        );
        if (placemarks.isNotEmpty) {
          Placemark place = placemarks[0];
          setState(() {
            _currentAddress = '${place.street ?? place.subLocality ?? place.locality}';
            if (_currentAddress.isEmpty || _currentAddress.trim().isEmpty) {
               _currentAddress = 'Unknown Street';
            }
            _currentCity = '${place.locality ?? place.administrativeArea}, ${place.country}';
          });
        }
      } catch (e) {
        setState(() => _currentAddress = 'Address unavailable');
      }
    } catch (e) {
      setState(() => _currentAddress = 'Failed to get location');
    }
  }

  Future<void> _loadIncidents() async {
    setState(() => _isLoading = true);
    List<dynamic> data;
    if (_selectedFilter == 'All') {
       data = await TrafficService.getIncidents();
    } else {
       data = await TrafficService.getIncidentsByLocation(_selectedFilter);
    }
    
    // In a real app, incidents from the backend would have lat/lng.
    // For now, if we have a current location, we will assign mock coordinates 
    // to these incidents so they show up dynamically around the user's location.
    if (_currentLocation != null && data.isNotEmpty) {
      final random = Random();
      for (var inc in data) {
        // Offset by roughly max 2km (0.018 degrees approx)
        double latOffset = (random.nextDouble() - 0.5) * 0.036;
        double lngOffset = (random.nextDouble() - 0.5) * 0.036;
        inc['_lat'] = _currentLocation!.latitude + latOffset;
        inc['_lng'] = _currentLocation!.longitude + lngOffset;
      }
    }

    setState(() {
      _incidents = data;
      _isLoading = false;
    });
  }

  @override
  void dispose() {
    _pulseCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(child: _buildHeader()),
            SliverToBoxAdapter(child: _buildMapPlaceholder()),
            SliverToBoxAdapter(child: _buildQuickStats()),
            SliverToBoxAdapter(child: _buildFilters()),
            SliverToBoxAdapter(child: _buildIncidentList()),
            const SliverToBoxAdapter(child: SizedBox(height: 24)),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Traffic Monitor',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: AppColors.white,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    AnimatedBuilder(
                      animation: _pulse,
                      builder: (_, __) => Opacity(
                        opacity: _pulse.value,
                        child: Container(
                          width: 7,
                          height: 7,
                          decoration: const BoxDecoration(
                            color: AppColors.success,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        'Live · $_currentCity',
                        style: const TextStyle(
                            color: AppColors.textSecondary, fontSize: 12),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: _initLocationAndData,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  _isLoading 
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.accent))
                    : const Icon(Icons.my_location_rounded, color: AppColors.accent, size: 16),
                  const SizedBox(width: 5),
                  const Text('Locate Me',
                      style: TextStyle(
                          color: AppColors.accent,
                          fontSize: 12,
                          fontWeight: FontWeight.w600)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMapPlaceholder() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
      child: Container(
        height: 250,
        decoration: BoxDecoration(
          color: const Color(0xFF0D1117),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.accent.withValues(alpha: 0.3)),
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: _currentLocation == null 
            ? _buildLoadingMap()
            : _buildRealMap(),
        ),
      ),
    );
  }

  Widget _buildLoadingMap() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(color: AppColors.accent),
          const SizedBox(height: 16),
          Text(
            _hasLocationPermission ? 'Detecting location...' : 'Waiting for permission...',
            style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
          ),
        ],
      ),
    );
  }

  Widget _buildRealMap() {
    return Stack(
      children: [
        FlutterMap(
          mapController: _mapController,
          options: MapOptions(
            initialCenter: _currentLocation!,
            initialZoom: 14.0,
            maxZoom: 18.0,
            minZoom: 5.0,
            interactionOptions: const InteractionOptions(
              flags: InteractiveFlag.all,
            ),
          ),
          children: [
            // Google Maps Traffic layer + standard dark style
            // Note: lyrs=m,traffic shows roads with traffic lines
            TileLayer(
              urlTemplate: "https://mt1.google.com/vt/lyrs=m,traffic&hl=en&x={x}&y={y}&z={z}",
              userAgentPackageName: 'com.autocare.app',
              // We can apply a dark mode color filter to standard map tiles
              tileBuilder: (context, tileWidget, tile) {
                return ColorFiltered(
                  colorFilter: const ColorFilter.matrix([
                    -1,  0,  0, 0, 255,
                     0, -1,  0, 0, 255,
                     0,  0, -1, 0, 255,
                     0,  0,  0, 1,   0,
                  ]),
                  child: tileWidget,
                );
              },
            ),
            
            // Markers Layer for incidents and current location
            MarkerLayer(
              markers: [
                // Current Location Marker
                Marker(
                  point: _currentLocation!,
                  width: 50,
                  height: 50,
                  child: AnimatedBuilder(
                    animation: _pulse,
                    builder: (_, child) => Stack(
                      alignment: Alignment.center,
                      children: [
                        Container(
                          width: 40 * _pulse.value,
                          height: 40 * _pulse.value,
                          decoration: BoxDecoration(
                            color: AppColors.accent.withValues(alpha: 0.3),
                            shape: BoxShape.circle,
                          ),
                        ),
                        child!,
                      ],
                    ),
                    child: Container(
                      width: 16,
                      height: 16,
                      decoration: BoxDecoration(
                        color: AppColors.accent,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.black, width: 2),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.accent.withValues(alpha: 0.6),
                            blurRadius: 8,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                
                // Incident Markers
                ..._incidents.where((inc) => inc['_lat'] != null && inc['_lng'] != null).map((inc) {
                  final severity = (inc['severity'] as String?)?.toLowerCase() ?? 'low';
                  Color pinColor;
                  if (severity == 'high') pinColor = AppColors.error;
                  else if (severity == 'medium') pinColor = const Color(0xFFFF9800);
                  else pinColor = AppColors.accent;

                  return Marker(
                    point: LatLng(inc['_lat'], inc['_lng']),
                    width: 30,
                    height: 30,
                    child: GestureDetector(
                      onTap: () {
                        // Could show a bottom sheet with incident details
                      },
                      child: Column(
                        children: [
                          Container(
                            width: 16,
                            height: 16,
                            decoration: BoxDecoration(
                              color: pinColor,
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 2),
                              boxShadow: [
                                BoxShadow(color: pinColor.withValues(alpha: 0.5), blurRadius: 6),
                              ],
                            ),
                          ),
                          Container(
                            width: 2,
                            height: 8,
                            color: pinColor,
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ],
            ),
          ],
        ),

        // Overlay address label
        Positioned(
          bottom: 12,
          left: 12,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.85),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.location_on_rounded, color: AppColors.accent, size: 14),
                const SizedBox(width: 6),
                Text(
                  _currentAddress.length > 25 ? '${_currentAddress.substring(0, 25)}...' : _currentAddress,
                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w500),
                ),
              ],
            ),
          ),
        ),
        
        // Legend
        Positioned(
          bottom: 12,
          right: 12,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.85),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                _LegendItem(color: AppColors.error, label: 'High Traffic'),
                const SizedBox(height: 4),
                _LegendItem(color: const Color(0xFFFF9800), label: 'Medium'),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildQuickStats() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
      child: Row(
        children: [
          _StatChip(
            icon: Icons.warning_amber_rounded,
            label: 'Incidents',
            value: '${_incidents.length}',
            color: AppColors.error,
          ),
          const SizedBox(width: 10),
          _StatChip(
            icon: Icons.timer_rounded,
            label: 'Avg Delay',
            value: '+14 min',
            color: const Color(0xFFFF9800),
          ),
          const SizedBox(width: 10),
          _StatChip(
            icon: Icons.route_rounded,
            label: 'Open Routes',
            value: '12',
            color: AppColors.accent,
          ),
        ],
      ),
    );
  }

  Widget _buildFilters() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 0, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(title: 'Live Incidents'),
          const SizedBox(height: 12),
          SizedBox(
            height: 34,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _filters.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, i) {
                final f = _filters[i];
                final isSelected = f == _selectedFilter;
                return GestureDetector(
                  onTap: () {
                    setState(() => _selectedFilter = f);
                    _loadIncidents();
                  },
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? AppColors.accent
                          : AppColors.surface,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: isSelected
                            ? AppColors.accent
                            : AppColors.border,
                      ),
                    ),
                    child: Text(
                      f,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: isSelected
                            ? AppColors.background
                            : AppColors.textSecondary,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIncidentList() {
    if (_isLoading) {
      return const Padding(
        padding: EdgeInsets.only(top: 40),
        child: Center(child: CircularProgressIndicator(color: AppColors.accent)),
      );
    }

    if (_incidents.isEmpty) {
      return Padding(
        padding: const EdgeInsets.only(top: 40),
        child: Center(
          child: Column(
            children: [
              Icon(Icons.check_circle_outline_rounded, color: AppColors.success.withValues(alpha: 0.5), size: 48),
              const SizedBox(height: 12),
              const Text('No incidents reported', style: TextStyle(color: AppColors.textSecondary)),
            ],
          ),
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 14, 20, 0),
      child: Column(
        children: _incidents.map((inc) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: _IncidentTile(
              title: inc['type'] ?? 'Incident',
              location: inc['location'] ?? 'Unknown location',
              severity: (inc['severity'] as String?)?.toLowerCase() ?? 'low',
              delay: inc['description'] ?? 'No delay reported',
              time: _formatTime(inc['createdAt']),
            ),
          );
        }).toList(),
      ),
    );
  }

  String _formatTime(String? dateStr) {
    if (dateStr == null) return 'Just now';
    try {
      final date = DateTime.parse(dateStr);
      final diff = DateTime.now().difference(date);
      if (diff.inMinutes < 60) return '${diff.inMinutes} min ago';
      if (diff.inHours < 24) return '${diff.inHours} hours ago';
      return DateFormat('MMM dd').format(date);
    } catch (e) {
      return 'Recent';
    }
  }
}

class _IncidentTile extends StatelessWidget {
  final String title;
  final String location;
  final String severity;
  final String delay;
  final String time;

  const _IncidentTile({
    required this.title,
    required this.location,
    required this.severity,
    required this.delay,
    required this.time,
  });

  Color get color {
    switch (severity) {
      case 'high':
        return AppColors.error;
      case 'medium':
        return const Color(0xFFFF9800);
      default:
        return AppColors.accent;
    }
  }

  IconData get icon {
    if (title.contains('Accident')) return Icons.car_crash_rounded;
    if (title.contains('Congestion')) return Icons.traffic_rounded;
    if (title.contains('Work')) return Icons.construction_rounded;
    return Icons.warning_amber_rounded;
  }

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Row(
        children: [
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.white,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  location,
                  style: const TextStyle(
                      color: AppColors.textSecondary, fontSize: 12),
                ),
                const SizedBox(height: 4),
                Text(
                  time,
                  style: const TextStyle(
                      color: AppColors.textMuted, fontSize: 10),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(6),
                  border:
                      Border.all(color: color.withValues(alpha: 0.3)),
                ),
                child: Text(
                  delay.length > 10 ? delay.substring(0, 7) + '...' : delay,
                  style: TextStyle(
                    color: color,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                severity.toUpperCase(),
                style: TextStyle(
                  color: color.withValues(alpha: 0.7),
                  fontSize: 9,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatChip(
      {required this.icon,
      required this.label,
      required this.value,
      required this.color});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 18),
            const SizedBox(height: 5),
            Text(value,
                style: TextStyle(
                    color: color,
                    fontSize: 14,
                    fontWeight: FontWeight.w800)),
            const SizedBox(height: 2),
            Text(label,
                style: const TextStyle(
                    color: AppColors.textMuted, fontSize: 9)),
          ],
        ),
      ),
    );
  }
}

class _LegendItem extends StatelessWidget {
  final Color color;
  final String label;
  const _LegendItem({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
            width: 8,
            height: 8,
            decoration:
                BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 5),
        Text(label,
            style: const TextStyle(color: Colors.white, fontSize: 10)),
      ],
    );
  }
}

