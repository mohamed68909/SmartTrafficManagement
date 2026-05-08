import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart'; // مكتبة الاتصال
import 'dart:convert';
import 'dart:async';

class EmergencyTracking18 extends StatefulWidget {
  final String driverName;
  final String winchType;
  final double rating;
  final String price;
  final String eta;
  final String distanceText;
  final double distanceKm;
  final String truckId;

  const EmergencyTracking18({
    super.key,
    required this.driverName,
    required this.winchType,
    required this.rating,
    required this.price,
    required this.eta,
    required this.distanceText,
    required this.distanceKm,
    required this.truckId,
  });

  @override
  State<EmergencyTracking18> createState() => _EmergencyTracking18State();
}

class _EmergencyTracking18State extends State<EmergencyTracking18> {
  final MapController _mapController = MapController();
  final Color neonGreen = const Color(0xFFCCFF00);
  
  LatLng _userLocation = const LatLng(31.2598, 32.2882); 
  LatLng _winchLocation = const LatLng(31.2650, 32.3050); 
  List<LatLng> _routePoints = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _initTracking();
  }

  // دالة الاتصال التلقائي بالرقم المطلوب
  Future<void> _makePhoneCall() async {
    final Uri launchUri = Uri(
      scheme: 'tel',
      path: '01050500189',
    );
    if (await canLaunchUrl(launchUri)) {
      await launchUrl(launchUri);
    } else {
      debugPrint("Could not launch call");
    }
  }

  Future<void> _initTracking() async {
    Position position = await Geolocator.getCurrentPosition();
    double offset = widget.distanceKm / 111.0; 
    
    setState(() {
      _userLocation = LatLng(position.latitude, position.longitude);
      _winchLocation = LatLng(
        position.latitude + (offset * 0.7), 
        position.longitude + (offset * 0.7)
      );
    });

    await _getRoute();
    if (mounted) setState(() => _isLoading = false);
  }

  Future<void> _getRoute() async {
    final url = 'http://router.project-osrm.org/route/v1/driving/'
        '${_winchLocation.longitude},${_winchLocation.latitude};'
        '${_userLocation.longitude},${_userLocation.latitude}'
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
      debugPrint("Error: $e");
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
                initialCenter: _userLocation,
                initialZoom: 14.0,
              ),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.smart_traffic.ziad.tracking',
                  tileBuilder: (context, tileWidget, tile) {
                    return ColorFiltered(
                      colorFilter: const ColorFilter.matrix([-1,0,0,0,255, 0,-1,0,0,255, 0,0,-1,0,255, 0,0,0,1,0]),
                      child: tileWidget,
                    );
                  },
                ),
                if (_routePoints.isNotEmpty)
                  PolylineLayer(
                    polylines: [
                      Polyline(
                        points: _routePoints,
                        color: neonGreen,
                        strokeWidth: 4.0,
                        isDotted: true,
                      ),
                    ],
                  ),
                MarkerLayer(
                  markers: [
                    Marker(point: _userLocation, child: _buildMarker(Colors.cyanAccent)),
                    Marker(point: _winchLocation, width: 55, height: 55, child: Icon(Icons.local_shipping, color: neonGreen, size: 35)),
                  ],
                ),
              ],
            ),

          SafeArea(
            child: Align(
              alignment: Alignment.topCenter,
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                padding: const EdgeInsets.symmetric(vertical: 15),
                width: double.infinity,
                decoration: BoxDecoration(color: neonGreen, borderRadius: BorderRadius.circular(15)),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text("Estimated Arrival", style: TextStyle(color: Colors.black54, fontWeight: FontWeight.bold, fontSize: 12)),
                    Text(widget.eta, style: const TextStyle(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 32)),
                  ],
                ),
              ),
            ),
          ),

          Align(alignment: Alignment.bottomCenter, child: _buildDriverCard()),
        ],
      ),
    );
  }

  Widget _buildDriverCard() {
    return Container(
      margin: const EdgeInsets.all(20),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: const Color(0xFF0D0D0D), borderRadius: BorderRadius.circular(25), border: Border.all(color: Colors.white10)),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              CircleAvatar(radius: 28, backgroundColor: neonGreen, child: Text(widget.driverName[0], style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 20))),
              const SizedBox(width: 15),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(widget.driverName, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 20)),
                  Row(children: [const Icon(Icons.star, color: Colors.amber, size: 14), Text(" ${widget.rating} • ${widget.winchType}", style: const TextStyle(color: Colors.white54, fontSize: 12))]),
                ],
              ),
            ],
          ),
          const SizedBox(height: 20),
          
          // زرار الاتصال المحدث (Full Width)
          SizedBox(
            width: double.infinity,
            height: 55,
            child: ElevatedButton.icon(
              onPressed: _makePhoneCall, // نداء دالة الاتصال
              icon: const Icon(Icons.phone, color: Colors.black, size: 22),
              label: const Text("Call Driver Now", style: TextStyle(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 18)),
              style: ElevatedButton.styleFrom(
                backgroundColor: neonGreen,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                elevation: 10,
                shadowColor: neonGreen.withValues(alpha:0.4),
              ),
            ),
          ),
          
          const SizedBox(height: 25),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _infoItem("Distance", widget.distanceText),
              _infoItem("Cost", widget.price),
              _infoItem("Truck ID", widget.truckId),
            ],
          ),
        ],
      ),
    );
  }

  Widget _infoItem(String label, String value) {
    return Column(children: [Text(label, style: const TextStyle(color: Colors.white38, fontSize: 11)), const SizedBox(height: 5), Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14))]);
  }

  Widget _buildMarker(Color color) {
    return Container(decoration: BoxDecoration(shape: BoxShape.circle, boxShadow: [BoxShadow(color: color.withValues(alpha:0.4), blurRadius: 15, spreadRadius: 5)]), child: Icon(Icons.location_on, color: color, size: 30));
  }
}