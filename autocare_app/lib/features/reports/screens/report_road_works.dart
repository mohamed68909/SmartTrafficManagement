import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'package:dotted_border/dotted_border.dart';
import 'dart:io';
import '../../../core/services/traffic_service.dart';
import '../../../core/theme/app_theme.dart';

class ReportRoadWorksScreen extends StatefulWidget {
  const ReportRoadWorksScreen({super.key});

  @override
  State<ReportRoadWorksScreen> createState() => _ReportRoadWorksScreenState();
}

class _ReportRoadWorksScreenState extends State<ReportRoadWorksScreen> {
  final Color neonGreen = const Color(0xFFCCFF00);
  final Color darkCardBg = const Color(0xFF161616);
  
  File? _image; 
  String _address = "Locating your position...";
  bool _isLoadingLocation = true;
  bool _isSubmitting = false;
  final TextEditingController _detailsController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _determinePosition(); 
  }

  @override
  void dispose() {
    _detailsController.dispose();
    super.dispose();
  }

  Future<void> _submitReport() async {
    if (_isLoadingLocation) return;
    
    setState(() => _isSubmitting = true);
    
    final result = await TrafficService.reportIncident(
      title: 'Road Works',
      description: _detailsController.text.isEmpty ? 'Road works reported at $_address' : _detailsController.text,
      location: _address,
      isVerified: _image != null,
    );

    setState(() => _isSubmitting = false);

    if (result['success']) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AppColors.success,
            content: const Text('Report submitted! You earned 50 points.', style: TextStyle(color: Colors.white)),
          ),
        );
        Navigator.pop(context);
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(result['message'] ?? 'Failed to submit report')),
        );
      }
    }
  }

  Future<void> _determinePosition() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      setState(() => _address = "Location services disabled");
      return;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        setState(() => _address = "Location permission denied");
        return;
      }
    }

    try {
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high
      );
      
      try {
        List<Placemark> placemarks = await placemarkFromCoordinates(
          position.latitude, position.longitude
        );
        
        if (placemarks.isNotEmpty) {
          Placemark place = placemarks[0];
          setState(() {
            _address = "${place.street}, ${place.locality}, ${place.administrativeArea}";
            _isLoadingLocation = false;
          });
          return;
        }
      } catch (e) {
        debugPrint("Geocoding failed: $e");
      }

      // Fallback to coordinates
      setState(() {
        _address = "Lat: ${position.latitude.toStringAsFixed(4)}, Lng: ${position.longitude.toStringAsFixed(4)}";
        _isLoadingLocation = false;
      });

    } catch (e) {
      setState(() {
        _address = "Failed to get location";
        _isLoadingLocation = false;
      });
    }
  }

  Future<void> _pickImage(ImageSource source) async {
    final pickedFile = await ImagePicker().pickImage(source: source);
    if (pickedFile != null) {
      setState(() => _image = File(pickedFile.path));
    }
  }

  void _showPickerOptions() {
    showModalBottomSheet(
      context: context,
      backgroundColor: darkCardBg,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(25)),
      ),
      builder: (context) => SafeArea(
        child: Wrap(
          children: [
            const Padding(
              padding: EdgeInsets.all(20),
              child: Text("Choose Photo Source", style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            ),
            ListTile(
              leading: Icon(Icons.camera_alt, color: neonGreen),
              title: const Text('Camera', style: TextStyle(color: Colors.white)),
              onTap: () {
                _pickImage(ImageSource.camera);
                Navigator.pop(context);
              },
            ),
            ListTile(
              leading: Icon(Icons.photo_library, color: neonGreen),
              title: const Text('Gallery', style: TextStyle(color: Colors.white)),
              onTap: () {
                _pickImage(ImageSource.gallery);
                Navigator.pop(context);
              },
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 25),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text("Report Road Works", style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
            const Text("Provide additional details about the hazard", style: TextStyle(color: Colors.white54, fontSize: 14)),
            const SizedBox(height: 30),

            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: darkCardBg, borderRadius: BorderRadius.circular(20)),
              child: Row(
                children: [
                  Icon(Icons.location_on, color: neonGreen, size: 28),
                  const SizedBox(width: 15),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text("Current Location", style: TextStyle(color: neonGreen, fontWeight: FontWeight.bold, fontSize: 16)),
                        const SizedBox(height: 5),
                        Text(_address, style: const TextStyle(color: Colors.white, fontSize: 15)),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 30),
            const Text("Details (Optional)", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            TextField(
              controller: _detailsController,
              maxLines: 4,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: "Add more information about the road works...",
                hintStyle: const TextStyle(color: Colors.white24),
                filled: true,
                fillColor: darkCardBg,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(15), borderSide: BorderSide.none),
              ),
            ),

            const SizedBox(height: 30),
            const Text("Photo (Optional)", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),

            InkWell(
              onTap: _showPickerOptions,
              child: DottedBorder(
                color: Colors.white24,
                dashPattern: const [8, 4],
                borderType: BorderType.RRect,
                radius: const Radius.circular(20),
                child: Container(
                  width: double.infinity,
                  height: 160,
                  decoration: BoxDecoration(borderRadius: BorderRadius.circular(20)),
                  child: _image == null 
                    ? const Column(
                        mainAxisAlignment: MainAxisAlignment.center, 
                        children: [
                          Icon(Icons.camera_alt_outlined, color: Colors.white38, size: 40),
                          SizedBox(height: 10),
                          Text("Add Photo", style: TextStyle(color: Colors.white38, fontSize: 16)),
                          Text("Take a photo of the repairs", style: TextStyle(color: Colors.white24, fontSize: 12)),
                        ]
                      )
                    : ClipRRect(
                        borderRadius: BorderRadius.circular(20),
                        child: Image.file(_image!, fit: BoxFit.cover),
                      ),
                ),
              ),
            ),

            const SizedBox(height: 40),
            ElevatedButton(
              onPressed: (_isLoadingLocation || _isSubmitting) ? null : _submitReport,
              style: ElevatedButton.styleFrom(
                backgroundColor: neonGreen, 
                minimumSize: const Size(double.infinity, 65),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
              ),
              child: _isSubmitting 
                ? const CircularProgressIndicator(color: Colors.black)
                : Text(
                    _isLoadingLocation ? "Locating..." : "Submit Report",
                    style: const TextStyle(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 18),
                  ),
            ),
            const SizedBox(height: 20),
            Center(
                child: RichText(
                  text: TextSpan(
                    style: const TextStyle(color: Colors.white54, fontSize: 14),
                    children: [
                      const TextSpan(text: "You'll earn "),
                      TextSpan(text: "50 points", style: TextStyle(color: neonGreen, fontWeight: FontWeight.bold)),
                      const TextSpan(text: " for this report"),
                    ],
                  ),
                ),
              ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}
