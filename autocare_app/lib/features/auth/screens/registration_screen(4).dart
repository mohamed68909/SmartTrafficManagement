import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'package:intl/intl.dart';
import '../../vehicle/screens/vehicle_info_screen(5).dart';
import '../../../core/services/auth_service.dart';

class RegistrationScreen extends StatefulWidget {
  const RegistrationScreen({super.key});

  @override
  State<RegistrationScreen> createState() => _RegistrationScreenState();
}

class _RegistrationScreenState extends State<RegistrationScreen> {
  final _formKey = GlobalKey<FormState>();
  
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmController = TextEditingController();
  final TextEditingController _firstNameController = TextEditingController();
  final TextEditingController _lastNameController = TextEditingController();
  final TextEditingController _phoneNumberController = TextEditingController();
  final TextEditingController _dateController = TextEditingController();
  bool _isLoading      = false;
  bool _obscurePass    = true;
  bool _obscureConfirm = true;

  final Map<String, File?> _uploadedImages = {
    'driver_front': null,
    'driver_back': null,
    'car_front': null,
    'car_back': null,
    'nat_front': null,
    'nat_back': null,
  };

  final Color neonGreen = const Color(0xFFCCFF00);

  Future<void> _pickImage(String key) async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);
    
    if (image != null) {
      setState(() {
        _uploadedImages[key] = File(image.path);
      });
    }
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now().subtract(const Duration(days: 6570)),
      firstDate: DateTime(1950),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.dark(
              primary: neonGreen,
              onPrimary: Colors.black,
              surface: const Color(0xFF1A1A1A),
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() {
        _dateController.text = DateFormat('dd / MM / yyyy').format(picked);
      });
    }
  }

  // ─── Helper: Upload one image file, return URL or null ───────────────────
  Future<String?> _uploadImage(String key) async {
    final file = _uploadedImages[key];
    if (file == null) return null;
    return await AuthService.uploadFile(file.path, folder: 'documents');
  }

  // ─── Main Register Flow ───────────────────────────────────────────────────
  void _handleRegister() async {
    if (!_formKey.currentState!.validate()) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please complete all fields correctly')),
      );
      return;
    }

    if (_passwordController.text != _confirmController.text) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Passwords do not match')),
      );
      return;
    }

    setState(() => _isLoading = true);

    // ── Step 1: Create the account ───────────────────────────────────────────
    final registerResult = await AuthService.register(
      firstName:   _firstNameController.text.trim(),
      lastName:    _lastNameController.text.trim(),
      email:       _emailController.text.trim(),
      password:    _passwordController.text.trim(),
      phoneNumber: _phoneNumberController.text.trim().isEmpty ? '01000000000' : _phoneNumberController.text.trim(),
    );

    if (!mounted) return;

    if (!registerResult['success']) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(registerResult['message'] ?? 'Registration failed')),
      );
      return;
    }

    // ── Step 2: Upload document images ───────────────────────────────────────
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Uploading documents...')),
    );

    final idFrontUrl      = await _uploadImage('nat_front');
    final idBackUrl       = await _uploadImage('nat_back');
    final licenseFrontUrl = await _uploadImage('driver_front');
    final licenseBackUrl  = await _uploadImage('driver_back');
    final carFrontUrl     = await _uploadImage('car_front');
    final carBackUrl      = await _uploadImage('car_back');

    if (!mounted) return;

    // ── Step 3: Submit verification + vehicle info ────────────────────────────
    final verifyResult = await AuthService.verifyDocuments(
      idFrontUrl:         idFrontUrl,
      idBackUrl:          idBackUrl,
      licenseFrontUrl:    licenseFrontUrl,
      licenseBackUrl:     licenseBackUrl,
      carFrontUrl:        carFrontUrl,
      carBackUrl:         carBackUrl,
      vehicleMake:        '',
      vehicleModel:       '',
      vehiclePlateNumber: '',
      vehicleColor:       '',
      vehicleYear:        DateTime.now().year,
    );

    if (!mounted) return;
    setState(() => _isLoading = false);

    if (verifyResult['success'] || registerResult['success']) {
      // Navigate even if verify partially fails — user can complete later
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => const VehicleInfoScreen(isRegistration: true),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(verifyResult['message'] ?? 'Document upload failed')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      
      appBar: AppBar(
  backgroundColor: Colors.black,
  elevation: 0,
  leading: IconButton(
    icon: Icon(Icons.arrow_back, color: neonGreen),
    onPressed: () {
      Navigator.pop(context);
    },
  ),
  // ------------------
  title: const Text(
    "USER REGISTRATION", 
    style: TextStyle(
      color: Colors.white, 
      fontWeight: FontWeight.bold, 
      letterSpacing: 1.5, 
      fontSize: 18
    )
  ),
  centerTitle: true,
),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // --- SECTION: CREDENTIALS ---
              _buildSectionHeader("CREDENTIALS"),
              _buildTextField(
                label: "EMAIL ADDRESS", 
                hint: "user@smart-traffic.sys",
                controller: _emailController,
                validator: (value) {
                  if (value == null || !value.contains('@') || !value.contains('.')) {
                    return 'Please enter a valid email';
                  }
                  return null;
                },
              ),
              _buildTextField(
                label: "PHONE NUMBER", 
                hint: "+20 100 000 0000",
                controller: _phoneNumberController,
                keyboardType: TextInputType.phone,
              ),
              Row(
                children: [
                  Expanded(
                    child: _buildTextField(
                      label: "PASSWORD",
                      hint: "••••••••",
                      isPassword: _obscurePass,
                      controller: _passwordController,
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscurePass ? Icons.visibility_off : Icons.visibility,
                          color: Colors.white38, size: 20,
                        ),
                        onPressed: () => setState(() => _obscurePass = !_obscurePass),
                      ),
                    ),
                  ),
                  const SizedBox(width: 15),
                  Expanded(
                    child: _buildTextField(
                      label: "CONFIRM",
                      hint: "••••••••",
                      isPassword: _obscureConfirm,
                      controller: _confirmController,
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscureConfirm ? Icons.visibility_off : Icons.visibility,
                          color: Colors.white38, size: 20,
                        ),
                        onPressed: () => setState(() => _obscureConfirm = !_obscureConfirm),
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 25),
              // --- SECTION: PERSONAL INFORMATION ---
              _buildSectionHeader("PERSONAL INFORMATION"),
              Row(
                children: [
                  Expanded(child: _buildTextField(label: "FIRST NAME", hint: "John", controller: _firstNameController)),
                  const SizedBox(width: 15),
                  Expanded(child: _buildTextField(label: "LAST NAME", hint: "Doe", controller: _lastNameController)),
                ],
              ),
              _buildTextField(
                label: "DATE OF BIRTH",
                hint: "DD / MM / YYYY",
                controller: _dateController,
                readOnly: true,
                onTap: () => _selectDate(context),
                suffixIcon: Icon(Icons.calendar_month, color: neonGreen),
              ),

              const SizedBox(height: 25),
              // --- SECTION: VERIFICATION ---
              _buildSectionHeader("VERIFICATION"),
              _buildTextField(label: "DRIVER'S LICENSE NUMBER", hint: "DL-XXXX-XXXX"),

              const SizedBox(height: 15),
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 3,
                crossAxisSpacing: 10,
                mainAxisSpacing: 20,
                childAspectRatio: 0.8,
                children: [
                  _buildImageSlot("driver_front", "FRONT", "DRIVER'S ID"),
                  _buildImageSlot("driver_back",  "BACK",  "DRIVER'S ID"),
                  _buildImageSlot("car_front",    "FRONT", "CAR REG"),
                  _buildImageSlot("car_back",     "BACK",  "CAR REG"),
                  _buildImageSlot("nat_front",    "FRONT", "NAT'L ID"),
                  _buildImageSlot("nat_back",     "BACK",  "NAT'L ID"),
                ],
              ),

              const SizedBox(height: 30),
              
              ElevatedButton(
                onPressed: _isLoading ? null : _handleRegister,
                style: ElevatedButton.styleFrom(
                  backgroundColor: neonGreen,
                  disabledBackgroundColor: neonGreen.withValues(alpha: 0.5),
                  minimumSize: const Size(double.infinity, 60),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.black)
                    : const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text("COMPLETE REGISTRATION", 
                      style: TextStyle(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 16)),
                    SizedBox(width: 10),
                    Icon(Icons.chevron_right, color: Colors.black, size: 30),
                  ],
                ),
              ),
              
              const SizedBox(height: 20),
              const Center(
                child: Text('BY CLICKING "COMPLETE", YOU AGREE TO THE SMART TRAFFIC DATA POLICY',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.white38, fontSize: 9)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // --- UI HELPERS (Helpers must be inside the State class) ---

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 15),
      child: Row(
        children: [
          Container(width: 25, height: 3, color: neonGreen),
          const SizedBox(width: 10),
          Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, letterSpacing: 1.5, fontSize: 14)),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required String label,
    required String hint,
    bool isPassword = false,
    TextEditingController? controller,
    bool readOnly = false,
    VoidCallback? onTap,
    Widget? suffixIcon,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 15),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          TextFormField(
            controller: controller,
            obscureText: isPassword,
            readOnly: readOnly,
            onTap: onTap,
            validator: validator,
            keyboardType: keyboardType,
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: const TextStyle(color: Colors.white24, fontSize: 13),
              fillColor: const Color(0xFF121212),
              filled: true,
              suffixIcon: suffixIcon,
              contentPadding: const EdgeInsets.symmetric(horizontal: 15, vertical: 15),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Colors.white10)),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: neonGreen)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildImageSlot(String key, String side, String docType) {
    bool hasImage = _uploadedImages[key] != null;
    return GestureDetector(
      onTap: () => _pickImage(key),
      child: Column(
        children: [
          Expanded(
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                color: const Color(0xFF121212),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: neonGreen, width: 1, style: BorderStyle.solid),
              ),
              child: hasImage 
                ? ClipRRect(borderRadius: BorderRadius.circular(8), child: Image.file(_uploadedImages[key]!, fit: BoxFit.cover))
                : Icon(Icons.add_a_photo, color: neonGreen, size: 28),
            ),
          ),
          const SizedBox(height: 5),
          Text(side, style: TextStyle(color: neonGreen, fontSize: 10, fontWeight: FontWeight.bold)),
          Text(docType, style: const TextStyle(color: Colors.white38, fontSize: 8)),
        ],
      ),
    );
  }
}
