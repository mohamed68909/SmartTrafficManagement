import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';
import 'dart:math' as math;

class FuelTracking20 extends StatefulWidget {
  final String fuelType;
  final String amount;
  final String totalPrice;

  const FuelTracking20({
    super.key,
    required this.fuelType,
    required this.amount,
    required this.totalPrice,
  });

  @override
  State<FuelTracking20> createState() => _FuelTracking20State();
}

class _FuelTracking20State extends State<FuelTracking20> {
  final MapController _mapController = MapController();
  final Color neonGreen = const Color(0xFFCCFF00);
  
  LatLng? _userLocation;
  List<LatLng> _supportVehicles = [];
  LatLng? _nearestVehicle;
  List<LatLng> _routePoints = [];
  bool _isLoading = true;
  String _eta = "Calculating...";

  @override
  void initState() {
    super.initState();
    _initFuelTracking();
  }

  Future<void> _initFuelTracking() async {
    try {
      Position position = await Geolocator.getCurrentPosition();
      _userLocation = LatLng(position.latitude, position.longitude);

      _generateRandomVehicles();
      _findNearestVehicle();
      await _getRoute();

      if (mounted) setState(() => _isLoading = false);
    } catch (e) {
      debugPrint("Location error: $e");
    }
  }

  void _generateRandomVehicles() {
    final random = math.Random();
    _supportVehicles.clear();
    for (int i = 0; i < 15; i++) {
      double latOffset = (random.nextDouble() - 0.5) * 0.04;
      double lngOffset = (random.nextDouble() - 0.5) * 0.04;
      _supportVehicles.add(LatLng(
        _userLocation!.latitude + latOffset,
        _userLocation!.longitude + lngOffset,
      ));
    }
  }

  void _findNearestVehicle() {
    double minDistance = double.infinity;
    for (var vehicle in _supportVehicles) {
      double distance = Geolocator.distanceBetween(
        _userLocation!.latitude, _userLocation!.longitude,
        vehicle.latitude, vehicle.longitude
      );
      if (distance < minDistance) {
        minDistance = distance;
        _nearestVehicle = vehicle;
      }
    }
    _eta = "${(minDistance / 1000 * 3).round() + 5} mins";
  }

  Future<void> _getRoute() async {
    if (_nearestVehicle == null) return;
    final url = 'http://router.project-osrm.org/route/v1/driving/'
        '${_nearestVehicle!.longitude},${_nearestVehicle!.latitude};'
        '${_userLocation!.longitude},${_userLocation!.latitude}'
        '?overview=full&geometries=geojson';

    try {
      final response = await http.get(Uri.parse(url));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final List coords = data['routes'][0]['geometry']['coordinates'];
        if (mounted) {
          setState(() {
            _routePoints = coords.map((c) => LatLng(c[1], c[0])).toList();
          });
        }
      }
    } catch (e) {
      debugPrint("Routing Error: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          _isLoading 
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFCCFF00)))
          : FlutterMap(
              mapController: _mapController,
              options: MapOptions(
                initialCenter: _userLocation!, 
                initialZoom: 14.0,
              ),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  // حل مشكلة الـ Access Blocked: إضافة User Agent فريد
                  userAgentPackageName: 'com.smart_traffic.app.fuel_tracking', 
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
                if (_routePoints.isNotEmpty)
                  PolylineLayer(
                    polylines: [
                      Polyline(points: _routePoints, color: neonGreen, strokeWidth: 4.0, isDotted: true),
                    ],
                  ),
                MarkerLayer(
                  markers: [
                    Marker(
                      point: _userLocation!, 
                      width: 50, 
                      height: 50, 
                      child: const Icon(Icons.person_pin_circle, color: Colors.blueAccent, size: 40)
                    ),
                    ..._supportVehicles.map((pos) => Marker(
                      point: pos,
                      width: 40, height: 40,
                      child: Icon(Icons.local_gas_station, 
                        color: pos == _nearestVehicle ? neonGreen : Colors.white38, 
                        size: pos == _nearestVehicle ? 30 : 20),
                    )),
                  ],
                ),
              ],
            ),

          // كارت الوقت في الأعلى
          SafeArea(
            child: Align(
              alignment: Alignment.topCenter,
              child: Container(
                margin: const EdgeInsets.all(20),
                padding: const EdgeInsets.all(15),
                decoration: BoxDecoration(
                  color: neonGreen, 
                  borderRadius: BorderRadius.circular(15),
                  boxShadow: [BoxShadow(color: Colors.black.withValues(alpha:0.3), blurRadius: 10)]
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text("Nearest Support Arriving In", style: TextStyle(color: Colors.black54, fontWeight: FontWeight.bold, fontSize: 12)),
                    Text(_eta, style: const TextStyle(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 28)),
                  ],
                ),
              ),
            ),
          ),

          // تفاصيل الطلب في الأسفل
          Align(alignment: Alignment.bottomCenter, child: _buildOrderSummary()),
        ],
      ),
    );
  }

  Widget _buildOrderSummary() {
    return Container(
      margin: const EdgeInsets.all(20),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF0D0D0D), 
        borderRadius: BorderRadius.circular(25), 
        border: Border.all(color: Colors.white10),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha:0.5), blurRadius: 20)]
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(10), 
                decoration: BoxDecoration(color: neonGreen.withValues(alpha:0.1), shape: BoxShape.circle), 
                child: Icon(Icons.local_gas_station, color: neonGreen, size: 24)
              ),
              const SizedBox(width: 12),
              // حل مشكلة الـ Overflow: استخدام Expanded هنا
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text(
                      "Fuel Delivery Active", 
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                      overflow: TextOverflow.ellipsis,
                    ),
                    Text(
                      "${widget.amount}L of Benzin ${widget.fuelType}", 
                      style: const TextStyle(color: Colors.white54, fontSize: 12),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              // السعر في اليمين مع FittedBox لضمان عدم الانضغاط
              FittedBox(
                child: Text(
                  widget.totalPrice, 
                  style: TextStyle(color: neonGreen, fontWeight: FontWeight.bold, fontSize: 18)
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            height: 55,
            child: ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.redAccent, 
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                elevation: 0
              ),
              child: const Text("Cancel Order", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
            ),
          ),
        ],
      ),
    );
  }
}