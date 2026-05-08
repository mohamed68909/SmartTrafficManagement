import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'dart:async';
import 'dart:math' as math;

class NavigationScreen9 extends StatefulWidget {
  final List<LatLng> routePoints;
  final String distance;
  final String duration;
  final LatLng destination;

  const NavigationScreen9({
    super.key,
    required this.routePoints,
    required this.distance,
    required this.duration,
    required this.destination,
  });

  @override
  State<NavigationScreen9> createState() => _NavigationScreen9State();
}

class _NavigationScreen9State extends State<NavigationScreen9> {
  final MapController _mapController = MapController();
  
  // متغيرات تتبع الموقع والاتجاه
  LatLng _liveLocation = const LatLng(31.2598, 32.2882);
  double _liveHeading = 0.0;
  StreamSubscription<Position>? _positionStream;

  @override
  void initState() {
    super.initState();
    _startNavigationTracking();
  }

  // دالة التتبع اللحظي أثناء الملاحة
  void _startNavigationTracking() {
    const locationSettings = LocationSettings(
      accuracy: LocationAccuracy.bestForNavigation,
      distanceFilter: 0, // تحديث فوري مع كل حركة
    );

    _positionStream = Geolocator.getPositionStream(locationSettings: locationSettings)
        .listen((Position position) {
      if (mounted) {
        setState(() {
          _liveLocation = LatLng(position.latitude, position.longitude);
          _liveHeading = position.heading;
        });
        // تحريك الكاميرا تلقائياً مع السهم عشان يفضل في نص الشاشة
        _mapController.move(_liveLocation, 17.0);
      }
    });
  }

  @override
  void dispose() {
    _positionStream?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final Color neonGreen = const Color(0xFFCCFF00);

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // 1. الخريطة مع حل مشكلة الـ Access Blocked
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: widget.routePoints.first,
              initialZoom: 17.0,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.smart_traffic.ziad.nav', // تعريف التطبيق للسيرفر
                tileBuilder: (context, tileWidget, tile) {
                  return ColorFiltered(
                    colorFilter: const ColorFilter.matrix([
                      -1,  0,  0, 0, 255,
                       0, -1,  0, 0, 255,
                       0,  0, -1, 0, 255,
                       0,  0,  0, 1, 0,
                    ]),
                    child: tileWidget,
                  );
                },
              ),
              PolylineLayer(
                polylines: [
                  Polyline(
                    points: widget.routePoints,
                    color: neonGreen,
                    strokeWidth: 6.0,
                    borderStrokeWidth: 3.0,
                    borderColor: neonGreen.withValues(alpha:0.3),
                  ),
                ],
              ),
              MarkerLayer(
                markers: [
                  // --- السهم اللحظي المتفاعل ---
                  Marker(
                    point: _liveLocation,
                    width: 70,
                    height: 70,
                    child: Transform.rotate(
                      angle: (_liveHeading * (math.pi / 180)), // يلف مع اتجاهك الحقيقي
                      child: const Icon(Icons.navigation, color: Colors.blueAccent, size: 45),
                    ),
                  ),
                  // علامة الهدف (العلم)
                  Marker(
                    point: widget.destination,
                    child: Icon(Icons.flag_circle, color: neonGreen, size: 45),
                  ),
                ],
              ),
            ],
          ),

          // 2. الشريط العلوي (الوقت المتبقي)
          SafeArea(
            child: Align(
              alignment: Alignment.topCenter,
              child: _buildTopBanner(neonGreen),
            ),
          ),

          // 3. الكارت السفلي (المسافة وزر الخروج)
          Align(
            alignment: Alignment.bottomCenter,
            child: _buildBottomCard(),
          ),
        ],
      ),
    );
  }

  Widget _buildTopBanner(Color neon) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      padding: const EdgeInsets.symmetric(vertical: 15),
      width: double.infinity,
      decoration: BoxDecoration(
        color: neon,
        borderRadius: BorderRadius.circular(15),
        boxShadow: [BoxShadow(color: neon.withValues(alpha:0.4), blurRadius: 20)],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text("Estimated Arrival", style: TextStyle(color: Colors.black54, fontWeight: FontWeight.bold)),
          Text(widget.duration, style: const TextStyle(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 30)),
        ],
      ),
    );
  }

  Widget _buildBottomCard() {
    return Container(
      margin: const EdgeInsets.all(25),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF0A0A0A),
        borderRadius: BorderRadius.circular(25),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text("DISTANCE", style: TextStyle(color: Colors.white70, fontSize: 20, fontWeight: FontWeight.bold)),
          Text(widget.distance, style: const TextStyle(color: Colors.white, fontSize: 40, fontWeight: FontWeight.w900)),
          const SizedBox(height: 15),
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.redAccent,
              minimumSize: const Size(double.infinity, 50),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
            ),
            child: const Text("Exit Navigation", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          )
        ],
      ),
    );
  }
}