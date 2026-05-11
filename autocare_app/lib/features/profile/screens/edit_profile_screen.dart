// lib/features/profile/screens/edit_profile_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/shared_widgets.dart';
import '../../../../core/providers/app_providers.dart';
import '../../../../core/services/auth_service.dart';
import '../../vehicle/screens/vehicle_info_screen.dart';
import 'package:image_picker/image_picker.dart';

class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _firstNameCtrl;
  late TextEditingController _lastNameCtrl;
  late TextEditingController _emailCtrl;
  late TextEditingController _phoneCtrl;
  late TextEditingController _cityCtrl;
  bool _isSaving = false;
  bool _isInitialized = false;

  @override
  void initState() {
    super.initState();
    _firstNameCtrl = TextEditingController();
    _lastNameCtrl = TextEditingController();
    _emailCtrl = TextEditingController();
    _phoneCtrl = TextEditingController();
    _cityCtrl = TextEditingController(text: 'Cairo, Egypt');
  }

  void _initFields(Map<String, dynamic>? user) {
    if (_isInitialized || user == null) return;
    _firstNameCtrl.text = user['firstName'] ?? '';
    _lastNameCtrl.text = user['lastName'] ?? '';
    _emailCtrl.text = user['email'] ?? '';
    _phoneCtrl.text = user['phoneNumber'] ?? '';
    _isInitialized = true;
  }

  @override
  void dispose() {
    _firstNameCtrl.dispose();
    _lastNameCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    _cityCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final profileAsync = ref.watch(profileFutureProvider);
    
    // Initialize fields if data is available
    if (profileAsync.hasValue) {
      _initFields(profileAsync.value);
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: buildAppBar(context, title: 'Edit Profile', showBack: true),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Avatar
              Center(
                child: Stack(
                  alignment: Alignment.bottomRight,
                  children: [
                    Container(
                      width: 90,
                      height: 90,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF2A2A00), AppColors.accent],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.accent.withValues(alpha:0.3),
                            blurRadius: 20,
                          ),
                        ],
                      ),
                      child: const Center(
                        child: Text('YA',
                            style: TextStyle(
                                color: AppColors.background,
                                fontSize: 28,
                                fontWeight: FontWeight.w900)),
                      ),
                    ),
                    GestureDetector(
                      onTap: () async {
                        final ImagePicker picker = ImagePicker();
                        final XFile? image = await picker.pickImage(source: ImageSource.gallery);
                        if (image != null && mounted) {
                          setState(() => _isSaving = true);
                          try {
                            final photoUrl = await AuthService.uploadFile(image.path, folder: 'profiles');
                            if (photoUrl != null) {
                              final result = await AuthService.updateProfile({'profilePicture': photoUrl});
                              if (result['success'] && mounted) {
                                ref.invalidate(profileFutureProvider);
                                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Profile picture updated successfully!')));
                              }
                            }
                          } finally {
                            if (mounted) setState(() => _isSaving = false);
                          }
                        }
                      },
                      child: Container(
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(
                          color: AppColors.accent,
                          shape: BoxShape.circle,
                          border: Border.all(
                              color: AppColors.background, width: 2),
                        ),
                        child: const Icon(Icons.camera_alt_rounded,
                            size: 13, color: AppColors.background),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              const Center(
                child: Text('Tap to change photo',
                    style: TextStyle(
                        color: AppColors.accent,
                        fontSize: 12,
                        fontWeight: FontWeight.w500)),
              ),
              const SizedBox(height: 28),

              // Form fields
              _SectionLabel('Personal Info'),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _Field(
                      label: 'First Name',
                      controller: _firstNameCtrl,
                      icon: Icons.person_outline_rounded,
                      validator: (v) =>
                          v == null || v.isEmpty ? 'Required' : null,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _Field(
                      label: 'Last Name',
                      controller: _lastNameCtrl,
                      icon: Icons.person_outline_rounded,
                      validator: (v) =>
                          v == null || v.isEmpty ? 'Required' : null,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              _Field(
                label: 'Email Address',
                controller: _emailCtrl,
                icon: Icons.email_outlined,
                keyboardType: TextInputType.emailAddress,
                validator: (v) =>
                    v == null || !v.contains('@') ? 'Invalid email' : null,
              ),
              const SizedBox(height: 12),
              _Field(
                label: 'Phone Number',
                controller: _phoneCtrl,
                icon: Icons.phone_outlined,
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 12),
              _Field(
                label: 'City',
                controller: _cityCtrl,
                icon: Icons.location_city_rounded,
              ),
              const SizedBox(height: 24),

              _SectionLabel('Vehicle Info'),
              const SizedBox(height: 12),
              ref.watch(vehiclesFutureProvider).when(
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (err, stack) => const Text('Error loading vehicle info', style: TextStyle(color: Colors.red)),
                data: (vehicles) {
                  if (vehicles.isEmpty) {
                    return AppCard(
                      child: const Center(
                        child: Padding(
                          padding: EdgeInsets.all(16.0),
                          child: Text('No vehicle added yet', style: TextStyle(color: AppColors.textMuted)),
                        ),
                      ),
                    );
                  }
                  final vehicle = vehicles.firstWhere((v) => v.isDefault, orElse: () => vehicles.first);
                  return AppCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.directions_car_rounded,
                                color: AppColors.accent, size: 18),
                            const SizedBox(width: 8),
                            const Text('My Vehicle',
                                style: TextStyle(
                                    color: AppColors.white,
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600)),
                            const Spacer(),
                            TextButton(
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => VehicleInfoScreen(
                                      isRegistration: false,
                                      existingVehicle: vehicle,
                                    ),
                                  ),
                                ).then((_) {
                                  // Refresh vehicle data when returning
                                  ref.invalidate(vehiclesFutureProvider);
                                });
                              },
                              child: const Text('Change',
                                  style: TextStyle(
                                      color: AppColors.accent,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600)),
                            ),
                          ],
                        ),
                        const NeonDivider(),
                        const SizedBox(height: 10),
                        _VehicleRow('Make', vehicle.make),
                        const SizedBox(height: 6),
                        _VehicleRow('Model', vehicle.model),
                        const SizedBox(height: 6),
                        _VehicleRow('Year', vehicle.year.toString()),
                        const SizedBox(height: 6),
                        _VehicleRow('License Plate', vehicle.plateNumber),
                        const SizedBox(height: 6),
                        _VehicleRow('Type', vehicle.type),
                      ],
                    ),
                  );
                },
              ),
              const SizedBox(height: 24),

              _SectionLabel('Preferences'),
              const SizedBox(height: 12),
              _ToggleRow(
                  label: 'Push Notifications',
                  subtitle: 'Receive alerts for orders and offers',
                  value: true,
                  onChanged: (_) {}),
              const SizedBox(height: 8),
              _ToggleRow(
                  label: 'SMS Alerts',
                  subtitle: 'Delivery and appointment reminders',
                  value: true,
                  onChanged: (_) {}),
              const SizedBox(height: 8),
              _ToggleRow(
                  label: 'Marketing Emails',
                  subtitle: 'Promotions and seasonal offers',
                  value: false,
                  onChanged: (_) {}),
              const SizedBox(height: 32),

              AccentButton(
                label: 'Save Changes',
                icon: Icons.check_rounded,
                isLoading: _isSaving,
                onTap: () async {
                  if (_formKey.currentState?.validate() ?? false) {
                    setState(() => _isSaving = true);
                    
                    final result = await AuthService.updateProfile({
                      'firstName': _firstNameCtrl.text.trim(),
                      'lastName': _lastNameCtrl.text.trim(),
                      'phoneNumber': _phoneCtrl.text.trim(),
                    });

                    if (!mounted) return;
                    setState(() => _isSaving = false);

                    if (result['success'] == true) {
                      // Refresh profile data
                      ref.invalidate(profileFutureProvider);
                      
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          backgroundColor: AppColors.success,
                          behavior: SnackBarBehavior.floating,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          content: const Row(
                            children: [
                              Icon(Icons.check_circle_rounded, color: AppColors.white, size: 16),
                              SizedBox(width: 8),
                              Text('Profile updated!', style: TextStyle(color: AppColors.white)),
                            ],
                          ),
                        ),
                      );
                      Navigator.pop(context);
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          backgroundColor: AppColors.error,
                          content: Text(result['message'] ?? 'Update failed'),
                        ),
                      );
                    }
                  }
                },
              ),
              const SizedBox(height: 12),
              Center(
                child: TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Cancel',
                      style: TextStyle(
                          color: AppColors.textSecondary, fontSize: 13)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final String text;
  const _SectionLabel(this.text);

  @override
  Widget build(BuildContext context) {
    return Text(
      text.toUpperCase(),
      style: const TextStyle(
        color: AppColors.textMuted,
        fontSize: 11,
        fontWeight: FontWeight.w700,
        letterSpacing: 1,
      ),
    );
  }
}

class _Field extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final IconData icon;
  final TextInputType? keyboardType;
  final String? Function(String?)? validator;

  const _Field({
    required this.label,
    required this.controller,
    required this.icon,
    this.keyboardType,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: const TextStyle(
                color: AppColors.textSecondary,
                fontSize: 12,
                fontWeight: FontWeight.w500)),
        const SizedBox(height: 6),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          validator: validator,
          style: const TextStyle(color: AppColors.white, fontSize: 14),
          decoration: InputDecoration(
            prefixIcon: Icon(icon, color: AppColors.textMuted, size: 18),
          ),
        ),
      ],
    );
  }
}

class _VehicleRow extends StatelessWidget {
  final String label;
  final String value;
  const _VehicleRow(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        SizedBox(
            width: 100,
            child: Text(label,
                style: const TextStyle(
                    color: AppColors.textMuted, fontSize: 12))),
        Text(value,
            style: const TextStyle(
                color: AppColors.white,
                fontSize: 12,
                fontWeight: FontWeight.w500)),
      ],
    );
  }
}

class _ToggleRow extends StatefulWidget {
  final String label;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _ToggleRow({
    required this.label,
    required this.subtitle,
    required this.value,
    required this.onChanged,
  });

  @override
  State<_ToggleRow> createState() => _ToggleRowState();
}

class _ToggleRowState extends State<_ToggleRow> {
  late bool _val;

  @override
  void initState() {
    super.initState();
    _val = widget.value;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(widget.label,
                    style: const TextStyle(
                        color: AppColors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.w500)),
                const SizedBox(height: 2),
                Text(widget.subtitle,
                    style: const TextStyle(
                        color: AppColors.textMuted, fontSize: 11)),
              ],
            ),
          ),
          Switch(
            value: _val,
            onChanged: (v) {
              setState(() => _val = v);
              widget.onChanged(v);
            },
            activeColor: AppColors.accent,
            activeTrackColor: AppColors.accent.withValues(alpha:0.3),
            inactiveThumbColor: AppColors.textMuted,
            inactiveTrackColor: AppColors.border,
          ),
        ],
      ),
    );
  }
}
