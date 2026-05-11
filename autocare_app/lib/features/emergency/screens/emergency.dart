import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:geolocator/geolocator.dart';

import 'winch_service.dart';
import 'emergency_fuel.dart';
import '../../../../core/services/emergency_service.dart';

class EmergencyScreen extends StatefulWidget {
  const EmergencyScreen({super.key});

  @override
  State<EmergencyScreen> createState() => _EmergencyScreenState();
}

class _EmergencyScreenState extends State<EmergencyScreen> {
  final Color neonGreen = const Color(0xFFCCFF00);
  final Color darkCard = const Color(0xFF121212);

  Future<void> _makeCall(String phoneNumber) async {
    final String cleanNumber = phoneNumber.replaceAll(' ', '');
    final Uri launchUri = Uri(scheme: 'tel', path: cleanNumber);

    try {
      await launchUrl(
        launchUri,
        mode: LaunchMode.externalApplication,
      );
    } catch (e) {
      debugPrint("Could not launch $cleanNumber: $e");
    }
  }

  Future<Position> _getCurrentLocation() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) throw Exception('Location services are disabled.');

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) throw Exception('Location permissions are denied');
    }
    if (permission == LocationPermission.deniedForever) throw Exception('Location permissions are permanently denied.');

    return await Geolocator.getCurrentPosition();
  }

  Future<void> _requestService(int serviceType, String serviceName) async {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Requesting $serviceName...")));
    try {
      Position position = await _getCurrentLocation();
      final result = await EmergencyService.requestSos(
        serviceType: serviceType,
        lat: position.latitude,
        lng: position.longitude,
      );
      if (result['success']) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text("$serviceName requested successfully! Help is on the way."),
            backgroundColor: Colors.green,
          ));
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text("Failed to request $serviceName: ${result['message']}"),
            backgroundColor: Colors.red,
          ));
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text("Location Error: $e"),
          backgroundColor: Colors.red,
        ));
      }
    }
  }

  void _showSOSOptions() async {
    // Call the API in the background with real GPS
    try {
      Position position = await _getCurrentLocation();
      EmergencyService.requestSos(
        serviceType: 3, // 3 = Emergency
        lat: position.latitude,
        lng: position.longitude,
      ).then((result) {
        if (!result['success']) {
          debugPrint("Failed to send SOS to backend: ${result['message']}");
        } else {
          debugPrint("SOS Sent successfully to backend!");
        }
      });
    } catch (e) {
      debugPrint("SOS Location Error: $e");
    }

    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1A1A1A),
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(25))),
      builder: (context) => Container(
        padding: const EdgeInsets.all(25),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text("Emergency Call",
                style: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            _sosTile(
                title: "Ambulance",
                number: "123",
                icon: Icons.medical_services,
                color: Colors.red),
            _sosTile(
                title: "Police",
                number: "122",
                icon: Icons.local_police,
                color: Colors.blue),
            _sosTile(
                title: "Fire",
                number: "180",
                icon: Icons.fire_truck,
                color: Colors.orange),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }

  Widget _sosTile(
      {required String title,
      required String number,
      required IconData icon,
      required Color color}) {
    return ListTile(
      leading: Icon(icon, color: color),
      title: Text(title, style: const TextStyle(color: Colors.white)),
      trailing: Text(number,
          style: TextStyle(color: neonGreen, fontWeight: FontWeight.bold)),
      onTap: () {
        Navigator.pop(context);
        _makeCall(number);
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 25),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),
              const Text("Emergency Assistance",
                  style: TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.bold)),
              const Text("24/7 roadside help",
                  style: TextStyle(color: Colors.white54, fontSize: 16)),
              Center(
                child: GestureDetector(
                  onTap: _showSOSOptions,
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 40),
                    width: 250,
                    height: 250,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.red.shade700,
                      boxShadow: [
                        BoxShadow(
                            color: Colors.red.withValues(alpha:0.5),
                            blurRadius: 40,
                            spreadRadius: 10),
                      ],
                    ),
                    child: const Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text("SOS",
                            style: TextStyle(
                                color: Colors.white,
                                fontSize: 60,
                                fontWeight: FontWeight.w900)),
                        Text("Emergency Call",
                            style: TextStyle(
                                color: Colors.white70,
                                fontSize: 16,
                                fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ),
              ),
              const Center(
                  child: Text("Press for immediate emergency dispatch",
                      style: TextStyle(color: Colors.white54, fontSize: 14))),
              const SizedBox(height: 40),
              const Text("Quick Services",
                  style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold)),
              const SizedBox(height: 20),
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 2,
                crossAxisSpacing: 15,
                mainAxisSpacing: 15,
                childAspectRatio: 1.1,
                children: [
                  _serviceCard(
                      "Winch", "Towing service", Icons.local_shipping_outlined,
                      () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (context) => const WinchServiceScreen()),
                    );
                  }),

                  _serviceCard(
                      "Fuel", "Fuel delivery", Icons.local_gas_station_outlined,
                      () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (context) => const EmergencyFuelScreen19()),
                    );
                  }),

                  _serviceCard("Mechanic", "Live support", Icons.build_outlined,
                      () => _requestService(1, "Mechanic")),
                  _serviceCard("Jumpstart", "Battery boost",
                      Icons.bolt_outlined, () => _requestService(3, "Jumpstart")),
                ],
              ),
              const SizedBox(height: 30),
              InkWell(
                onTap: () => _makeCall("+201025789366"),
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                      color: darkCard,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.white10)),
                  child: Row(
                    children: [
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text("Emergency Hotline",
                                style: TextStyle(color: Colors.white54)),
                            SizedBox(height: 5),
                            Text("+20 102 578 9366",
                                style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                      CircleAvatar(
                          backgroundColor: neonGreen,
                          child: const Icon(Icons.phone, color: Colors.black)),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _serviceCard(
      String title, String sub, IconData icon, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        decoration: BoxDecoration(
            color: darkCard, borderRadius: BorderRadius.circular(20)),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                  color: neonGreen.withValues(alpha:0.1), shape: BoxShape.circle),
              child: Icon(icon, color: neonGreen, size: 30),
            ),
            const SizedBox(height: 10),
            Text(title,
                style: const TextStyle(
                    color: Colors.white, fontWeight: FontWeight.bold)),
            Text(sub,
                style: const TextStyle(color: Colors.white38, fontSize: 12)),
          ],
        ),
      ),
    );
  }
}
