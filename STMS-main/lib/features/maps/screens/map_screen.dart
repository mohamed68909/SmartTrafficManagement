import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:math' as math;
import 'dart:async';

import '../../emergency/screens/winch_service.dart';
import 'search_screen.dart';
import '../../reports/screens/report_hazard.dart';
import 'navigation_screen.dart';
import '../../emergency/screens/emergency.dart';
import '../../store/screens/store_screen.dart';
import '../../profile/screens/profile_screen.dart';

// Type alias for MapScreen9
typedef MapScreen9 = MapScreen;

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final MapController _mapController = MapController();
  final Color neonGreen = const Color(0xFFCCFF00);

  int _currentIndex = 0;
  LatLng _currentLocation = const LatLng(31.2598, 32.2882);
  List<LatLng> _routePoints = [];
  bool _isLoading = true;
  LatLng? _destination;
  double _currentHeading = 0.0;
  StreamSubscription<Position>? _positionStream;

  String _realDistance = "0 km";
  String _realDuration = "0 mins";

  @override
  void initState() {
    super.initState();
    _startLiveTracking();
  }

  void _startLiveTracking() async {
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }

    const locationSettings = LocationSettings(
      accuracy: LocationAccuracy.bestForNavigation,
      distanceFilter: 0,
    );

    _positionStream =
        Geolocator.getPositionStream(locationSettings: locationSettings)
            .listen((Position position) {
      if (mounted) {
        setState(() {
          _currentLocation = LatLng(position.latitude, position.longitude);
          _currentHeading = position.heading;
          _isLoading = false;
        });
      }
    });
  }

  Future<void> _getRoute(LatLng destination) async {
    setState(() => _routePoints = []);
    final url =
        'https://router.project-osrm.org/route/v1/driving/${_currentLocation.longitude},${_currentLocation.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson';

    try {
      final response = await http.get(Uri.parse(url));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final List coords = data['routes'][0]['geometry']['coordinates'];
        final double distM = data['routes'][0]['distance'].toDouble();
        final double durS = data['routes'][0]['duration'].toDouble();

        if (mounted) {
          setState(() {
            _routePoints = coords.map((c) => LatLng(c[1], c[0])).toList();
            _realDistance = "${(distM / 1000).toStringAsFixed(1)} km";
            _realDuration = "${(durS / 60).round()} mins";
          });
          _mapController.move(destination, 13.0);
        }
      }
    } catch (e) {
      debugPrint("Error: $e");
    }
  }

  @override
  void dispose() {
    _positionStream?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: _buildBody(),
      bottomNavigationBar: BottomNavigationBar(
        backgroundColor: const Color(0xFF0A0A0A),
        selectedItemColor: neonGreen,
        unselectedItemColor: Colors.white38,
        type: BottomNavigationBarType.fixed,
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.map_rounded), label: "Map"),
          BottomNavigationBarItem(
              icon: Icon(Icons.shopping_bag_outlined), label: "Store"),
          BottomNavigationBarItem(
              icon: Icon(Icons.build_outlined), label: "Services"),
          BottomNavigationBarItem(
              icon: Icon(Icons.person_outline), label: "Profile"),
        ],
      ),
    );
  }

  Widget _buildBody() {
    switch (_currentIndex) {
      case 0:
        return _buildMapStack();
      case 1:
        return const StoreScreen();
      case 2:
        return const EmergencyScreen();
      case 3:
        return const ProfileScreen();
      default:
        return _buildMapStack();
    }
  }

  Widget _buildMapStack() {
    return Stack(
      children: [
        _isLoading
            ? const Center(
                child: CircularProgressIndicator(color: Color(0xFFCCFF00)))
            : FlutterMap(
                mapController: _mapController,
                options: MapOptions(
                    initialCenter: _currentLocation,
                    initialZoom: 15.0,
                    keepAlive: true),
                children: [
                  TileLayer(
                    urlTemplate:
                        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                    userAgentPackageName: 'com.smart_traffic.app',
                    tileBuilder: (context, tileWidget, tile) => ColorFiltered(
                      colorFilter: const ColorFilter.matrix([
                        -1,
                        0,
                        0,
                        0,
                        255,
                        0,
                        -1,
                        0,
                        0,
                        255,
                        0,
                        0,
                        -1,
                        0,
                        255,
                        0,
                        0,
                        0,
                        1,
                        0
                      ]),
                      child: tileWidget,
                    ),
                  ),
                  if (_routePoints.isNotEmpty)
                    PolylineLayer(polylines: [
                      Polyline(
                          points: _routePoints,
                          color: neonGreen,
                          strokeWidth: 5.0,
                          borderStrokeWidth: 2,
                          borderColor: neonGreen.withValues(alpha:0.2)),
                    ]),
                  MarkerLayer(markers: [
                    Marker(
                      point: _currentLocation,
                      width: 60,
                      height: 60,
                      child: Transform.rotate(
                          angle: (_currentHeading * (math.pi / 180)),
                          child: const Icon(Icons.navigation,
                              color: Colors.blueAccent, size: 35)),
                    ),
                    if (_destination != null)
                      Marker(
                          point: _destination!,
                          child:
                              _buildGlowPoint(Icons.flag_rounded, neonGreen)),
                  ]),
                ],
              ),
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            child: Column(children: [
              _buildSearchBar(),
              const SizedBox(height: 12),
              _buildLocationInfoCard()
            ]),
          ),
        ),
        Positioned(
          right: 20,
          bottom: 250,
          child: FloatingActionButton(
            mini: true,
            backgroundColor: const Color(0xFF1A1A1A),
            onPressed: () => _mapController.move(_currentLocation, 15.0),
            child: Icon(Icons.my_location, color: neonGreen),
          ),
        ),
        Positioned(
            bottom: 0, left: 0, right: 0, child: _buildQuickActionsMenu()),
      ],
    );
  }

  Widget _buildSearchBar() {
    return GestureDetector(
      onTap: () async {
        final LatLng? result = await Navigator.push(context,
            MaterialPageRoute(builder: (context) => const SearchScreen()));
        if (result != null) {
          setState(() => _destination = result);
          _getRoute(result);
        }
      },
      child: Container(
        padding: const EdgeInsets.all(15),
        decoration: BoxDecoration(
            color: const Color(0xFF1A1A1A),
            borderRadius: BorderRadius.circular(15),
            border: Border.all(color: Colors.white10)),
        child: const Row(children: [
          Icon(Icons.search, color: Colors.white54),
          SizedBox(width: 10),
          Text("Where to?",
              style: TextStyle(color: Colors.white38, fontSize: 16))
        ]),
      ),
    );
  }

  Widget _buildLocationInfoCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
          color: const Color(0xFF111111).withValues(alpha:0.9),
          borderRadius: BorderRadius.circular(15),
          border: Border.all(color: Colors.white10)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Current Status",
              style: TextStyle(color: Colors.white54, fontSize: 11)),
          const SizedBox(height: 4),
          Text(_isLoading ? "Locating..." : "Live Navigation",
              style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 16)),
          Text(
              _destination == null
                  ? "Select a destination"
                  : "Dist: $_realDistance | Time: $_realDuration",
              style: TextStyle(color: neonGreen, fontSize: 12)),
        ],
      ),
    );
  }

  Widget _buildGlowPoint(IconData icon, Color color) {
    return Container(
      decoration: BoxDecoration(shape: BoxShape.circle, boxShadow: [
        BoxShadow(
            color: color.withValues(alpha:0.5), blurRadius: 20, spreadRadius: 5)
      ]),
      child: Icon(icon, color: color, size: 30),
    );
  }

  Widget _buildQuickActionsMenu() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 10, 20, 20),
      decoration: const BoxDecoration(
          color: Color(0xFF0A0A0A),
          borderRadius: BorderRadius.vertical(top: Radius.circular(30))),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                  color: Colors.white24,
                  borderRadius: BorderRadius.circular(2))),
          const SizedBox(height: 15),
          const Align(
              alignment: Alignment.centerLeft,
              child: Text("Quick Actions",
                  style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold))),
          const SizedBox(height: 15),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _actionCard(
                  "Report",
                  Icons.warning_amber_rounded,
                  Colors.orange,
                  () => Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (context) => const ReportHazardScreen()))),
              _actionCard("Winch", Icons.local_shipping_outlined, neonGreen,
                  () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const WinchServiceScreen()),
                );
              }),
              _actionCard("Navigate", Icons.directions_rounded, Colors.cyan,
                  () {
                if (_destination != null) {
                  Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (context) => NavigationScreen9(
                              routePoints: _routePoints,
                              destination: _destination!,
                              distance: _realDistance,
                              duration: _realDuration)));
                }
              }),
            ],
          ),
        ],
      ),
    );
  }

  Widget _actionCard(
      String title, IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 100,
        padding: const EdgeInsets.all(15),
        decoration: BoxDecoration(
            color: const Color(0xFF161616),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.white.withValues(alpha:0.05))),
        child: Column(children: [
          Icon(icon, color: color, size: 30),
          const SizedBox(height: 10),
          Text(title,
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.bold))
        ]),
      ),
    );
  }
}
