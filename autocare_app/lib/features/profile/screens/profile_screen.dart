// lib/features/profile/screens/profile_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/providers/app_providers.dart';
import '../../../../core/services/auth_service.dart';
import '../../auth/screens/login.dart';
import '../../../../core/widgets/shared_widgets.dart';
import '../../history/screens/history_screen.dart';
import '../../store/screens/manage_cards_screen.dart';
import '../../mechanic/screens/mechanic_screen.dart';
import 'edit_profile_screen.dart';
import 'notifications_screen.dart';
import 'help_center_screen.dart';
import 'privacy_policy_screen.dart';
import '../../vehicle/screens/vehicle_info_screen.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orders = ref.watch(ordersProvider);
    final completedCount =
        orders.where((o) => o.status.name == 'completed').length;

    final vehiclesAsync = ref.watch(vehiclesFutureProvider);
    final profileAsync = ref.watch(profileFutureProvider);
    ref.watch(ordersFutureProvider); // Trigger orders fetch in background

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
          child: Column(
            children: [
              // ── Avatar & name ────────────────────────────────────────────
              profileAsync.when(
                data: (user) => _buildProfileHeader(user),
                loading: () => const Center(child: CircularProgressIndicator(color: AppColors.accent)),
                error: (err, stack) => _buildProfileHeader(null),
              ),
              const SizedBox(height: 24),
              // ── Stats row ────────────────────────────────────────────────
              _buildStatsRow(completedCount, profileAsync.value?['points']?.toString() ?? '0'),
              const SizedBox(height: 28),
              // ── Vehicle card ─────────────────────────────────────────────
              vehiclesAsync.when(
                loading: () => const Center(child: CircularProgressIndicator(color: AppColors.accent)),
                error: (err, stack) => const Text('Failed to load vehicle', style: TextStyle(color: AppColors.error)),
                data: (vehicles) {
                  if (vehicles.isEmpty) {
                    return _buildAddVehicleCard(context);
                  }
                  // Get default or first
                  final vehicle = vehicles.firstWhere((v) => v.isDefault, orElse: () => vehicles.first);
                  return _buildVehicleCard(vehicle);
                },
              ),
              const SizedBox(height: 24),
              // ── Menu sections ─────────────────────────────────────────────
              _buildSection(
                title: 'Account',
                items: [
                  _MenuItem(Icons.person_outline_rounded, 'Edit Profile', null,
                      onTap: () => Navigator.push(context,
                          MaterialPageRoute(builder: (_) => const EditProfileScreen()))),
                  _MenuItem(Icons.notifications_outlined, 'Notifications', null,
                      onTap: () => Navigator.push(context,
                          MaterialPageRoute(builder: (_) => const NotificationsScreen()))),
                  _MenuItem(Icons.language_rounded, 'Language', 'Arabic'),
                ],
                context: context,
                ref: ref,
              ),
              const SizedBox(height: 16),
              _buildSection(
                title: 'Services',
                items: [
                  _MenuItem(Icons.history_rounded, 'Order History', null,
                      onTap: () => Navigator.push(context,
                          MaterialPageRoute(
                              builder: (_) => const HistoryScreen()))),
                  _MenuItem(Icons.credit_card_rounded, 'Payment Methods', null,
                      onTap: () => Navigator.push(context,
                          MaterialPageRoute(
                              builder: (_) => const ManageCardsScreen()))),
                  _MenuItem(Icons.video_call_rounded, 'Mechanic Support', null,
                      onTap: () => Navigator.push(context,
                          MaterialPageRoute(
                              builder: (_) => const MechanicScreen()))),
                  _MenuItem(Icons.location_on_outlined, 'Saved Addresses', null),
                ],
                context: context,
                ref: ref,
              ),
              const SizedBox(height: 16),
              _buildSection(
                title: 'Support',
                items: [
                  _MenuItem(Icons.help_outline_rounded, 'Help Center', null,
                      onTap: () => Navigator.push(context,
                          MaterialPageRoute(builder: (_) => const HelpCenterScreen()))),
                  _MenuItem(Icons.privacy_tip_outlined, 'Privacy Policy', null,
                      onTap: () => Navigator.push(context,
                          MaterialPageRoute(builder: (_) => const PrivacyPolicyScreen()))),
                  _MenuItem(Icons.info_outline_rounded, 'About AutoCare', 'v1.0.0'),
                ],
                context: context,
                ref: ref,
              ),
              const SizedBox(height: 24),
              // Sign out
              GestureDetector(
                onTap: () async {
                  await AuthService.logout();
                  if (context.mounted) {
                    Navigator.pushAndRemoveUntil(
                      context,
                      MaterialPageRoute(builder: (_) => const LoginScreen3()),
                      (route) => false,
                    );
                  }
                },
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(
                    color: AppColors.error.withValues(alpha:0.08),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.error.withValues(alpha:0.25)),
                  ),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.logout_rounded,
                          color: AppColors.error, size: 18),
                      SizedBox(width: 8),
                      Text(
                        'Sign Out',
                        style: TextStyle(
                          color: AppColors.error,
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProfileHeader(Map<String, dynamic>? user) {
    final String firstName = user?['firstName'] ?? 'User';
    final String lastName = user?['lastName'] ?? '';
    final String fullName = '$firstName $lastName';
    final String email = user?['email'] ?? 'No email provided';
    final String phone = user?['phoneNumber'] ?? 'No phone provided';
    final String initials = (firstName.isNotEmpty ? firstName[0] : '') + (lastName.isNotEmpty ? lastName[0] : '');

    return Column(
      children: [
        Stack(
          alignment: Alignment.bottomRight,
          children: [
            Container(
              width: 90,
              height: 90,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: const LinearGradient(
                  colors: [Color(0xFF2A2A00), AppColors.accent],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.accent.withValues(alpha:0.3),
                    blurRadius: 20,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: Center(
                child: Text(
                  initials.isNotEmpty ? initials.toUpperCase() : 'U',
                  style: const TextStyle(
                    color: AppColors.background,
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -1,
                  ),
                ),
              ),
            ),
            Container(
              width: 26,
              height: 26,
              decoration: BoxDecoration(
                color: AppColors.accent,
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.background, width: 2),
              ),
              child: const Icon(Icons.edit_rounded,
                  size: 12, color: AppColors.background),
            ),
          ],
        ),
        const SizedBox(height: 14),
        Text(
          fullName,
          style: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w800,
            color: AppColors.white,
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          '$email  ·  $phone',
          style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
        ),
        const SizedBox(height: 10),
        Container(
          padding:
              const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
          decoration: BoxDecoration(
            color: AppColors.accent.withValues(alpha:0.12),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.accent.withValues(alpha:0.3)),
          ),
          child: const Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.verified_rounded,
                  color: AppColors.accent, size: 14),
              SizedBox(width: 5),
              Text(
                'Verified Member · Level 4 Commuter',
                style: TextStyle(
                  color: AppColors.accent,
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStatsRow(int completedCount, String points) {
    return Row(
      children: [
        _StatCard(label: 'Orders', value: '$completedCount', icon: Icons.shopping_bag_rounded),
        const SizedBox(width: 10),
        _StatCard(label: 'Points', value: points, icon: Icons.stars_rounded),
        const SizedBox(width: 10),
        _StatCard(label: 'Eco Level', value: 'Lv.4', icon: Icons.eco_rounded),
      ],
    );
  }

  Widget _buildAddVehicleCard(BuildContext context) {
    return AppCard(
      borderColor: AppColors.border,
      child: InkWell(
        onTap: () => Navigator.push(
            context,
            MaterialPageRoute(
                builder: (_) => const VehicleInfoScreen(isRegistration: false))),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 8.0),
          child: Row(
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: AppColors.surfaceVariant,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.add_rounded, color: AppColors.textSecondary, size: 28),
              ),
              const SizedBox(width: 14),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Add Vehicle',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppColors.white,
                      ),
                    ),
                    SizedBox(height: 3),
                    Text(
                      'Tap to add your car details',
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildVehicleCard(dynamic vehicle) {
    return AppCard(
      borderColor: AppColors.accent.withValues(alpha:0.3),
      child: Row(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: AppColors.accent.withValues(alpha:0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.directions_car_rounded,
                color: AppColors.accent, size: 28),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${vehicle.make} ${vehicle.model}',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.white,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  '${vehicle.year} · ${vehicle.color} · ${vehicle.plateNumber}',
                  style: const TextStyle(
                      color: AppColors.textSecondary, fontSize: 12),
                ),
                const SizedBox(height: 6),
                const Row(
                  children: [
                    _VehicleBadge(label: 'Next Oil Change: 5,000 km'),
                  ],
                ),
              ],
            ),
          ),
          const Icon(Icons.chevron_right_rounded,
              color: AppColors.textMuted, size: 20),
        ],
      ),
    );
  }

  Widget _buildSection({
    required String title,
    required List<_MenuItem> items,
    required BuildContext context,
    required WidgetRef ref,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(bottom: 10, left: 2),
          child: Text(
            title.toUpperCase(),
            style: const TextStyle(
              color: AppColors.textMuted,
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 1,
            ),
          ),
        ),
        Container(
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            children: items.asMap().entries.map((entry) {
              final i = entry.key;
              final item = entry.value;
              return Column(
                children: [
                  _MenuTile(item: item),
                  if (i < items.length - 1)
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 16),
                      child: Divider(height: 1, color: AppColors.border),
                    ),
                ],
              );
            }).toList(),
          ),
        ),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _StatCard(
      {required this.label, required this.value, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          children: [
            Icon(icon, color: AppColors.accent, size: 20),
            const SizedBox(height: 6),
            Text(
              value,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: AppColors.white,
              ),
            ),
            const SizedBox(height: 2),
            Text(label,
                style: const TextStyle(
                    color: AppColors.textMuted, fontSize: 10)),
          ],
        ),
      ),
    );
  }
}

class _VehicleBadge extends StatelessWidget {
  final String label;
  const _VehicleBadge({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: AppColors.surfaceVariant,
        borderRadius: BorderRadius.circular(5),
      ),
      child: Text(label,
          style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 10,
              fontWeight: FontWeight.w500)),
    );
  }
}

class _MenuItem {
  final IconData icon;
  final String title;
  final String? value;
  final VoidCallback? onTap;

  const _MenuItem(this.icon, this.title, this.value, {this.onTap});
}

class _MenuTile extends StatelessWidget {
  final _MenuItem item;
  const _MenuTile({required this.item});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: item.onTap ?? () {},
      borderRadius: BorderRadius.circular(14),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Icon(item.icon, color: AppColors.textSecondary, size: 20),
            const SizedBox(width: 14),
            Expanded(
              child: Text(
                item.title,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: AppColors.white,
                ),
              ),
            ),
            if (item.value != null)
              Text(item.value!,
                  style: const TextStyle(
                      color: AppColors.textMuted, fontSize: 12)),
            const SizedBox(width: 4),
            const Icon(Icons.chevron_right_rounded,
                color: AppColors.textMuted, size: 18),
          ],
        ),
      ),
    );
  }
}
