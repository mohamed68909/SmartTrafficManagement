import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'dart:math' as math; // ضروري للبيانات العشوائية
import '../../../core/services/emergency_service.dart';
import 'emergency tracking(18).dart'; // تأكد أن اسم الملف صحيح عندك

// موديل بيانات الخدمة
class WinchService {
  final String id;
  final String title;
  final String type;
  final double rating;
  final double distance;
  final int price;
  final String eta;

  WinchService({
    required this.id, 
    required this.title, 
    required this.type, 
    required this.rating, 
    required this.distance, 
    required this.price, 
    required this.eta
  });
}

class WinchServiceScreen extends StatefulWidget {
  const WinchServiceScreen({super.key});

  @override
  State<WinchServiceScreen> createState() => _WinchServiceScreenState();
}

class _WinchServiceScreenState extends State<WinchServiceScreen> {
  // الألوان الخاصة بمشروعك
  final Color accentColor = const Color(0xFFCCFF00);
  final Color darkBackground = const Color(0xFF0A0A0A);
  final Color cardBackground = const Color(0xFF1A1A1A);

  String _currentAddress = "Locating your position...";
  int selectedIndex = 0;

  // قائمة أنواع الأوناش المتوفرة
  final List<WinchService> services = [
    WinchService(id: '1', title: 'Professional Flatbed', type: 'Flatbed Truck', rating: 4.8, distance: 2.3, price: 300, eta: '8 mins'),
    WinchService(id: '2', title: 'Heavy Duty Winch', type: 'Tow Truck', rating: 4.9, distance: 4.1, price: 500, eta: '15 mins'),
    WinchService(id: '3', title: 'Standard Tow', type: 'Light Tow', rating: 4.6, distance: 3.5, price: 250, eta: '12 mins'),
    WinchService(id: '4', title: 'Rapid Recovery', type: 'Motorcycle Tow', rating: 4.7, distance: 1.8, price: 200, eta: '6 mins'),
    WinchService(id: '5', title: 'Super Lift Winch', type: 'Crane Truck', rating: 5.0, distance: 7.5, price: 850, eta: '25 mins'),
  ];

  @override
  void initState() {
    super.initState();
    _determinePosition(); // جلب الموقع فور فتح الصفحة
  }

  // دالة تحديد الموقع الفعلي
  Future<void> _determinePosition() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      if (mounted) setState(() => _currentAddress = "Location services disabled");
      return;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        if (mounted) setState(() => _currentAddress = "Permission denied");
        return;
      }
    }

    try {
      Position position = await Geolocator.getCurrentPosition();
      List<Placemark> placemarks = await placemarkFromCoordinates(position.latitude, position.longitude);
      if (placemarks.isNotEmpty) {
        Placemark place = placemarks[0];
        if (mounted) {
          setState(() {
            _currentAddress = "${place.street}, ${place.locality}";
          });
        }
      }
    } catch (e) {
      if (mounted) setState(() => _currentAddress = "Position found, but address failed");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: darkBackground,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // زر العودة
              TextButton.icon(
                onPressed: () => Navigator.pop(context), 
                icon: const Icon(Icons.arrow_back_ios, color: Colors.white, size: 16), 
                label: const Text("Back", style: TextStyle(color: Colors.white))
              ),
              const SizedBox(height: 20),
              const Text("Select Winch Service", style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)),
              const SizedBox(height: 10),
              
              // عرض العنوان الفعلي
              Row(
                children: [
                  Icon(Icons.location_on_outlined, color: accentColor, size: 18), 
                  const SizedBox(width: 8), 
                  Expanded(
                    child: Text(
                      _currentAddress, 
                      style: const TextStyle(color: Colors.grey),
                      overflow: TextOverflow.ellipsis,
                    )
                  )
                ]
              ),
              
              const SizedBox(height: 30),
              
              // قائمة الأوناش
              Expanded(
                child: ListView.separated(
                  itemCount: services.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 16),
                  itemBuilder: (context, index) => ServiceCard(
                    service: services[index], 
                    isSelected: selectedIndex == index, 
                    accentColor: accentColor, 
                    cardBackground: cardBackground, 
                    onTap: () => setState(() => selectedIndex = index)
                  ),
                ),
              ),
              
              const SizedBox(height: 20),
              
              // زر الطلب الديناميكي
              SizedBox(
                width: double.infinity, 
                height: 60, 
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: accentColor, 
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                    elevation: 10,
                    shadowColor: accentColor.withValues(alpha:0.3),
                  ), 
                  onPressed: () async {
                    // 1. Show loading
                    showDialog(
                      context: context,
                      barrierDismissible: false,
                      builder: (context) => const Center(child: CircularProgressIndicator(color: Color(0xFFCCFF00))),
                    );

                    // 2. Call API
                    final result = await EmergencyService.requestSos(
                      serviceType: 4, // Towing
                      lat: 30.0444,
                      lng: 31.2357,
                      notes: "Winch Request: ${services[selectedIndex].title} (${services[selectedIndex].type})",
                    );

                    // 3. Hide loading
                    if (mounted) Navigator.pop(context);

                    if (result['success']) {
                      // بيانات عشوائية للسائق والـ ID
                      final List<String> drivers = ["Ahmed Hassan", "Mohamed Ziad", "Sayed Ali", "Mahmoud Nasr", "Ibrahim Gad"];
                      final String randomDriver = (drivers..shuffle()).first;
                      final String randomTruckId = "#TR${1000 + (math.Random().nextInt(9000))}";

                      if (mounted) {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => EmergencyTracking18(
                              driverName: randomDriver,
                              winchType: services[selectedIndex].title,
                              rating: services[selectedIndex].rating,
                              price: "${services[selectedIndex].price} EGP",
                              eta: services[selectedIndex].eta,
                              distanceText: "${services[selectedIndex].distance} km",
                              distanceKm: services[selectedIndex].distance,
                              truckId: randomTruckId,
                            ),
                          ),
                        );
                      }
                    } else {
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text("Error: ${result['message']}")),
                        );
                      }
                    }
                  }, 
                  child: Text(
                    "Request ${services[selectedIndex].title}", 
                    style: const TextStyle(color: Colors.black, fontSize: 18, fontWeight: FontWeight.bold)
                  )
                )
              ),
              const SizedBox(height: 15),
              const Center(child: Text("Payment on arrival • Cancel anytime", style: TextStyle(color: Colors.grey, fontSize: 12))),
            ],
          ),
        ),
      ),
    );
  }
}

// ويدجت الكارت الخاص بكل خدمة
class ServiceCard extends StatelessWidget {
  final WinchService service;
  final bool isSelected;
  final Color accentColor;
  final Color cardBackground;
  final VoidCallback onTap;

  const ServiceCard({
    super.key, 
    required this.service, 
    required this.isSelected, 
    required this.accentColor, 
    required this.cardBackground, 
    required this.onTap
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: cardBackground, 
          borderRadius: BorderRadius.circular(20), 
          border: Border.all(color: isSelected ? accentColor : Colors.transparent, width: 2), 
          boxShadow: isSelected ? [BoxShadow(color: accentColor.withValues(alpha:0.2), blurRadius: 10)] : []
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12), 
              decoration: BoxDecoration(color: Colors.grey.withValues(alpha:0.1), borderRadius: BorderRadius.circular(12)), 
              child: Icon(Icons.local_shipping, color: accentColor, size: 30)
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start, 
                children: [
                  Text(service.title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)), 
                  Text(service.type, style: const TextStyle(color: Colors.grey, fontSize: 12)), 
                  const SizedBox(height: 4), 
                  Row(children: [
                    Icon(Icons.star, color: Colors.amber, size: 14), 
                    Text(" ${service.rating}  •  ${service.distance} km away", style: const TextStyle(color: Colors.grey, fontSize: 12))
                  ])
                ]
              )
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end, 
              children: [
                Text("${service.price} EGP", style: TextStyle(color: accentColor, fontWeight: FontWeight.bold, fontSize: 16)), 
                Text(service.eta, style: const TextStyle(color: Colors.white70, fontSize: 12))
              ]
            )
          ],
        ),
      ),
    );
  }
}