import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import '../../../core/services/emergency_service.dart';
// تأكد من صحة اسم الملف هنا (استخدم الأندر سكور أفضل في التسمية)
import 'fuel tracking(20).dart'; 

class EmergencyFuelScreen19 extends StatefulWidget {
  const EmergencyFuelScreen19({super.key});

  @override
  State<EmergencyFuelScreen19> createState() => _EmergencyFuelScreen19State();
}

class _EmergencyFuelScreen19State extends State<EmergencyFuelScreen19> {
  final Color neonGreen = const Color(0xFFCCFF00);
  final Color darkCard = const Color(0xFF111111);
  
  String _currentAddress = "Locating...";
  double _lat = 0.0; // الإحداثيات الحقيقية للمستخدم
  double _lng = 0.0;
  int _selectedFuelPrice = 22; // بنزين 92 بـ 22 جنيه
  String _selectedFuelName = "92";
  double _fuelAmount = 10.0;
  final int _deliveryFee = 50;

  @override
  void initState() {
    super.initState();
    _determinePosition();
  }

  Future<void> _determinePosition() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      if (mounted) setState(() => _currentAddress = "Location Services Disabled");
      return;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        if (mounted) setState(() => _currentAddress = "Permission Denied");
        return;
      }
    }

    try {
      Position position = await Geolocator.getCurrentPosition();
      // ✅ حفظ الإحداثيات الحقيقية
      _lat = position.latitude;
      _lng = position.longitude;
      List<Placemark> placemarks = await placemarkFromCoordinates(position.latitude, position.longitude);
      if (placemarks.isNotEmpty) {
        Placemark p = placemarks[0];
        if (mounted) {
          setState(() {
            _currentAddress = "${p.street}, ${p.locality}";
          });
        }
      }
    } catch (e) {
      if (mounted) setState(() => _currentAddress = "Position Found (Unknown Address)");
    }
  }

  @override
  Widget build(BuildContext context) {
    // حساب الحسابات هنا جوه الـ build عشان تتحدث مع كل حركة في السلايدر
    int fuelTotal = (_fuelAmount * _selectedFuelPrice).toInt();
    int grandTotal = fuelTotal + _deliveryFee;

    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 10),
              _buildBackButton(),
              const SizedBox(height: 25),
              const Text("Emergency Fuel", style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
              const Text("Fuel delivered to your location", style: TextStyle(color: Colors.white54, fontSize: 14)),
              const SizedBox(height: 30),

              _buildLocationCard(),

              const SizedBox(height: 30),
              const Text("Select Fuel Type", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              const SizedBox(height: 15),

              Row(
                children: [
                  _fuelTypeCard("92", 22),
                  const SizedBox(width: 15),
                  _fuelTypeCard("95", 24),
                ],
              ),

              const SizedBox(height: 30),
              const Text("Amount (Liters)", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              const SizedBox(height: 15),

              _buildAmountSlider(),

              const SizedBox(height: 30),

              _buildSummaryCard(fuelTotal, grandTotal),

              const SizedBox(height: 40),

              // بنبعت الـ grandTotal كـ parameter عشان نتفادى إيرور الـ Scope
              _buildRequestButton(grandTotal),
              
              const SizedBox(height: 15),
              const Center(child: Text("Average arrival time: 15-20 minutes", style: TextStyle(color: Colors.white38, fontSize: 12))),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBackButton() {
    return GestureDetector(
      onTap: () => Navigator.pop(context),
      child: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.arrow_back_ios, color: Colors.white, size: 16),
          SizedBox(width: 5),
          Text("Back", style: TextStyle(color: Colors.white, fontSize: 16)),
        ],
      ),
    );
  }

  Widget _buildLocationCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(25),
      decoration: BoxDecoration(color: darkCard, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.white10)),
      child: Column(
        children: [
          Icon(Icons.local_gas_station_rounded, color: neonGreen, size: 50),
          const SizedBox(height: 15),
          const Text("Current Location", style: TextStyle(color: Colors.white38, fontSize: 12)),
          const SizedBox(height: 5),
          Text(_currentAddress, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold), textAlign: TextAlign.center),
        ],
      ),
    );
  }

  Widget _fuelTypeCard(String name, int price) {
    bool isSelected = _selectedFuelName == name;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() {
          _selectedFuelName = name;
          _selectedFuelPrice = price;
        }),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 15),
          decoration: BoxDecoration(
            color: darkCard,
            borderRadius: BorderRadius.circular(15),
            border: Border.all(color: isSelected ? neonGreen : Colors.white10, width: 2),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(name, style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
              const SizedBox(height: 5),
              Text("$price EGP/L", style: const TextStyle(color: Colors.white38, fontSize: 14)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAmountSlider() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: darkCard, borderRadius: BorderRadius.circular(20)),
      child: Column(
        children: [
          SliderTheme(
            data: SliderTheme.of(context).copyWith(
              activeTrackColor: neonGreen,
              inactiveTrackColor: Colors.white10,
              thumbColor: neonGreen,
              overlayColor: neonGreen.withValues(alpha:0.2),
            ),
            child: Slider(
              value: _fuelAmount,
              min: 5,
              max: 30,
              divisions: 25,
              onChanged: (val) => setState(() => _fuelAmount = val),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text("5L", style: TextStyle(color: Colors.white38, fontSize: 10)),
                Text("${_fuelAmount.toInt()}L", style: TextStyle(color: neonGreen, fontSize: 28, fontWeight: FontWeight.w900)),
                const Text("30L", style: TextStyle(color: Colors.white38, fontSize: 10)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryCard(int fuelTotal, int grandTotal) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: darkCard, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.white10)),
      child: Column(
        children: [
          _summaryRow("Fuel (${_fuelAmount.toInt()}L × $_selectedFuelPrice EGP)", "$fuelTotal EGP"),
          const SizedBox(height: 12),
          _summaryRow("Delivery Fee", "$_deliveryFee EGP"),
          const Padding(padding: EdgeInsets.symmetric(vertical: 15), child: Divider(color: Colors.white10)),
          _summaryRow("Total", "$grandTotal EGP", isTotal: true),
        ],
      ),
    );
  }

  Widget _summaryRow(String label, String value, {bool isTotal = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(color: isTotal ? Colors.white : Colors.white54, fontSize: isTotal ? 18 : 14, fontWeight: isTotal ? FontWeight.bold : FontWeight.normal)),
        Text(value, style: TextStyle(color: isTotal ? neonGreen : Colors.white, fontSize: isTotal ? 22 : 14, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildRequestButton(int total) {
    return SizedBox(
      width: double.infinity,
      height: 60,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: neonGreen,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
        ),
        onPressed: () async {
          // 1. Show loading
          showDialog(
            context: context,
            barrierDismissible: false,
            builder: (context) => const Center(child: CircularProgressIndicator(color: Color(0xFFCCFF00))),
          );

          // 2. Call API — بنبعت الإحداثيات الحقيقية للمستخدم
          final result = await EmergencyService.requestSos(
            serviceType: 5, // FuelDelivery
            lat: _lat,
            lng: _lng,
            notes: "Fuel Request: $_selectedFuelName, Amount: ${_fuelAmount.toInt()}L",
          );

          // 3. Hide loading
          if (mounted) Navigator.pop(context);

          if (result['success']) {
            if (mounted) {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => FuelTracking20(
                    fuelType: _selectedFuelName,
                    amount: _fuelAmount.toInt().toString(),
                    totalPrice: "$total EGP",
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
        child: const Text("Request Fuel Delivery", style: TextStyle(color: Colors.black, fontSize: 18, fontWeight: FontWeight.bold)),
      ),
    );
  }
}