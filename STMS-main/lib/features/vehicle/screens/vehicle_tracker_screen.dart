import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/tracker_service.dart';
import '../../../core/providers/app_providers.dart';
import 'dart:async';

class VehicleTrackerScreen extends ConsumerStatefulWidget {
  const VehicleTrackerScreen({super.key});

  @override
  ConsumerState<VehicleTrackerScreen> createState() => _VehicleTrackerScreenState();
}

class _VehicleTrackerScreenState extends ConsumerState<VehicleTrackerScreen> {
  final MapController _mapController = MapController();
  SensorData? _sensorData;
  Timer? _timer;
  bool _isLoading = true;

  // Mocked vehicle location (in a real app, this would come from the backend)
  final LatLng _vehicleLocation = const LatLng(30.0444, 31.2357); 

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchData();
    });
    // Auto-refresh every 10 seconds
    _timer = Timer.periodic(const Duration(seconds: 10), (timer) => _fetchData());
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _fetchData() async {
    try {
      // Trigger fetch if not already loaded
      final vehicles = await ref.read(vehiclesFutureProvider.future);
      
      if (vehicles.isEmpty) {
        if (mounted) setState(() => _isLoading = false);
        return;
      }

      final defaultVehicle = vehicles.firstWhere((v) => v.isDefault, orElse: () => vehicles.first);
      final data = await TrackerService.getVehicleEnvironment(defaultVehicle.id);
      
      if (mounted) {
        setState(() {
          _sensorData = data;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // 1. Background Map
          Positioned.fill(
            bottom: MediaQuery.of(context).size.height * 0.4,
            child: FlutterMap(
              mapController: _mapController,
              options: MapOptions(
                initialCenter: _vehicleLocation,
                initialZoom: 15.0,
              ),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.smart_traffic.app',
                  tileBuilder: (context, tileWidget, tile) => ColorFiltered(
                    colorFilter: const ColorFilter.matrix([
                      -1, 0, 0, 0, 255,
                      0, -1, 0, 0, 255,
                      0, 0, -1, 0, 255,
                      0, 0, 0, 1, 0
                    ]),
                    child: tileWidget,
                  ),
                ),
                MarkerLayer(
                  markers: [
                    Marker(
                      point: _vehicleLocation,
                      width: 80,
                      height: 80,
                      child: _buildVehicleMarker(),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // 2. Overlay Header
          Positioned(
            top: 50,
            left: 20,
            right: 20,
            child: _buildHeader(),
          ),

          // 3. Bottom Dashboard
          Align(
            alignment: Alignment.bottomCenter,
            child: _buildDashboard(),
          ),
        ],
      ),
    );
  }

  Widget _buildVehicleMarker() {
    return Container(
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: AppColors.accent.withValues(alpha: 0.4),
            blurRadius: 20,
            spreadRadius: 10,
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(4),
            decoration: const BoxDecoration(
              color: AppColors.background,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.directions_car_rounded, color: AppColors.accent, size: 30),
          ),
          const Icon(Icons.arrow_drop_down, color: AppColors.accent, size: 20),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.background.withValues(alpha: 0.8),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.5),
            blurRadius: 10,
          ),
        ],
      ),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () => Navigator.pop(context),
          ),
          const SizedBox(width: 8),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'SMART TRACKER',
                  style: TextStyle(
                    color: AppColors.accent,
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 2,
                  ),
                ),
                Text(
                  'Lancer GLX 2023',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.success.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.success.withValues(alpha: 0.5)),
            ),
            child: const Row(
              children: [
                Icon(Icons.wifi, color: AppColors.success, size: 14),
                SizedBox(width: 4),
                Text('LIVE', style: TextStyle(color: AppColors.success, fontSize: 10, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDashboard() {
    return Container(
      height: MediaQuery.of(context).size.height * 0.45,
      width: double.infinity,
      decoration: const BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.vertical(top: Radius.circular(40)),
        boxShadow: [
          BoxShadow(
            color: Colors.black,
            blurRadius: 40,
            spreadRadius: 10,
          ),
        ],
      ),
      child: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.accent),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(30),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Vehicle Status',
                        style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        _sensorData != null ? 'Updated just now' : 'No Data',
                        style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                      ),
                    ],
                  ),
                  const SizedBox(height: 25),
                  
                  // Sensor Grid
                  Row(
                    children: [
                      Expanded(
                        child: _buildSensorCard(
                          'Temperature',
                          '${_sensorData?.temperature.toStringAsFixed(1) ?? "--"}°C',
                          Icons.thermostat_rounded,
                          Colors.orange,
                        ),
                      ),
                      const SizedBox(width: 15),
                      Expanded(
                        child: _buildSensorCard(
                          'Humidity',
                          '${_sensorData?.humidity.toStringAsFixed(0) ?? "--"}%',
                          Icons.water_drop_rounded,
                          Colors.blue,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 15),
                  _buildAirQualityCard(),
                  
                  const SizedBox(height: 25),
                  const Text(
                    'Quick Control',
                    style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 15),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildControlItem(Icons.lock_open_rounded, 'Unlock', false),
                      _buildControlItem(Icons.flashlight_on_rounded, 'Flash', true),
                      _buildControlItem(Icons.volume_up_rounded, 'Horn', false),
                      _buildControlItem(Icons.ac_unit_rounded, 'Climate', true),
                    ],
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildSensorCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(25),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 12),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900)),
          const SizedBox(height: 4),
          Text(title, style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
        ],
      ),
    );
  }

  Widget _buildAirQualityCard() {
    final double aqi = _sensorData?.airQuality ?? 0;
    Color aqiColor = AppColors.success;
    String aqiStatus = "Excellent";
    
    if (aqi > 50) { aqiColor = Colors.orange; aqiStatus = "Fair"; }
    if (aqi > 100) { aqiColor = Colors.red; aqiStatus = "Poor"; }

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(25),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: aqiColor.withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.air_rounded, color: aqiColor, size: 30),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Air Quality Index (AQI)', style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Text(aqi.toStringAsFixed(0), style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900)),
                    const SizedBox(width: 10),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: aqiColor,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(aqiStatus, style: const TextStyle(color: Colors.black, fontSize: 10, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Icon(Icons.chevron_right, color: AppColors.textMuted),
        ],
      ),
    );
  }

  Widget _buildControlItem(IconData icon, String label, bool isActive) {
    return Column(
      children: [
        Container(
          width: 60,
          height: 60,
          decoration: BoxDecoration(
            color: isActive ? AppColors.accent : AppColors.surface,
            shape: BoxShape.circle,
            border: Border.all(color: isActive ? AppColors.accent : AppColors.border),
          ),
          child: Icon(icon, color: isActive ? Colors.black : Colors.white54, size: 26),
        ),
        const SizedBox(height: 8),
        Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
      ],
    );
  }
}
