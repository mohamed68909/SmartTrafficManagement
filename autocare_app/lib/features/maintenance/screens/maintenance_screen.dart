// lib/features/maintenance/screens/maintenance_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/providers/app_providers.dart';
import '../../../../core/widgets/shared_widgets.dart';
import '../../../../core/models/models.dart';
import '../../store/screens/checkout_address_screen.dart';

const _maintenanceCategories = [
  MaintenanceItem(id: 'oil', name: 'Oil Change', icon: '🛢️', price: 450),
  MaintenanceItem(id: 'belts', name: 'Engine Belts', icon: '⚙️', price: 680),
  MaintenanceItem(id: 'rotation', name: 'Tire Rotation', icon: '🔄', price: 200),
  MaintenanceItem(id: 'brakes', name: 'Brake Service', icon: '🛑', price: 750),
  MaintenanceItem(id: 'full', name: 'Full Check-up', icon: '🔧', price: 1200),
  MaintenanceItem(id: 'ac', name: 'AC Service', icon: '❄️', price: 380),
];

const _recommendedProducts = [
  {'name': 'Liqui Moly 5W-30', 'type': 'Engine Oil', 'price': 850, 'icon': '🛢️'},
  {'name': 'Brembo Brake Pads', 'type': 'Brake System', 'price': 1200, 'icon': '🔴'},
  {'name': 'Bosch Air Filter', 'type': 'Air System', 'price': 280, 'icon': '💨'},
  {'name': 'NGK Spark Plugs', 'type': 'Ignition', 'price': 320, 'icon': '⚡'},
];

class MaintenanceScreen extends ConsumerStatefulWidget {
  const MaintenanceScreen({super.key});

  @override
  ConsumerState<MaintenanceScreen> createState() => _MaintenanceScreenState();
}

class _MaintenanceScreenState extends ConsumerState<MaintenanceScreen> {
  final Set<String> _selectedProducts = {};

  @override
  Widget build(BuildContext context) {
    final selectedCategories = ref.watch(maintenanceSelectionProvider);
    final selectedDate = ref.watch(selectedDateProvider);
    final selectedTime = ref.watch(selectedTimeProvider);

    final total = _maintenanceCategories
        .where((c) => selectedCategories.contains(c.id))
        .fold(0.0, (sum, c) => sum + c.price);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Stack(
          children: [
            SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 120),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Scheduled\nMaintenance',
                    style: TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w800,
                      color: AppColors.white,
                      height: 1.1,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Select services for your Toyota Corolla 2023',
                    style: TextStyle(
                        color: AppColors.textSecondary, fontSize: 13),
                  ),
                  const SizedBox(height: 24),
                  const SectionHeader(title: 'Service Categories'),
                  const SizedBox(height: 14),
                  _buildServiceGrid(selectedCategories),
                  const SizedBox(height: 24),
                  const SectionHeader(title: 'Recommended for Your Vehicle'),
                  const SizedBox(height: 14),
                  _buildRecommendedProducts(),
                  const SizedBox(height: 24),
                  const SectionHeader(title: 'Schedule Date'),
                  const SizedBox(height: 14),
                  _buildDatePicker(selectedDate, ref),
                  const SizedBox(height: 16),
                  _buildTimeDropdown(selectedTime, ref),
                ],
              ),
            ),
            // Bottom Bar
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  border: const Border(
                      top: BorderSide(color: AppColors.border)),
                ),
                child: Row(
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Est. Total',
                            style: TextStyle(
                                color: AppColors.textSecondary, fontSize: 12)),
                        const SizedBox(height: 2),
                        Text(
                          '${total.toStringAsFixed(0)} EGP',
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w800,
                            color: AppColors.accent,
                            letterSpacing: -0.5,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: AccentButton(
                        label: 'CONFIRM BOOKING',
                        onTap: total > 0
                            ? () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                      builder: (_) => const CheckoutAddressScreen()),
                                );
                              }
                            : () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Please select at least one service'),
                                    backgroundColor: AppColors.surface,
                                  ),
                                );
                              },
                        height: 50,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildServiceGrid(Set<String> selectedCategories) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        mainAxisSpacing: 10,
        crossAxisSpacing: 10,
        childAspectRatio: 1.05,
      ),
      itemCount: _maintenanceCategories.length,
      itemBuilder: (context, index) {
        final item = _maintenanceCategories[index];
        final isSelected = selectedCategories.contains(item.id);
        return GestureDetector(
          onTap: () =>
              ref.read(maintenanceSelectionProvider.notifier).toggle(item.id),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: isSelected
                  ? AppColors.accent.withValues(alpha:0.1)
                  : AppColors.surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: isSelected ? AppColors.accent : AppColors.border,
                width: isSelected ? 1.5 : 1,
              ),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(item.icon, style: const TextStyle(fontSize: 26)),
                const SizedBox(height: 6),
                Text(
                  item.name,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: isSelected ? AppColors.accent : AppColors.white,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 2),
                Text(
                  '${item.price} EGP',
                  style: TextStyle(
                    fontSize: 10,
                    color: isSelected
                        ? AppColors.accent.withValues(alpha:0.7)
                        : AppColors.textMuted,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildRecommendedProducts() {
    return SizedBox(
      height: 130,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: _recommendedProducts.length,
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (context, index) {
          final p = _recommendedProducts[index];
          final id = 'rec_$index';
          final isSelected = _selectedProducts.contains(id);
          return GestureDetector(
            onTap: () => setState(() {
              if (isSelected) {
                _selectedProducts.remove(id);
              } else {
                _selectedProducts.add(id);
              }
            }),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 130,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isSelected
                    ? AppColors.accent.withValues(alpha:0.1)
                    : AppColors.surface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isSelected ? AppColors.accent : AppColors.border,
                  width: isSelected ? 1.5 : 1,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(p['icon'] as String,
                      style: const TextStyle(fontSize: 22)),
                  const Spacer(),
                  Text(
                    p['name'] as String,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.white,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    p['type'] as String,
                    style: const TextStyle(
                        fontSize: 10, color: AppColors.textMuted),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '${p['price']} EGP',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: AppColors.accent,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? AppColors.accent
                              : AppColors.surfaceVariant,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          isSelected ? 'Selected' : 'Select',
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w700,
                            color: isSelected
                                ? AppColors.background
                                : AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildDatePicker(DateTime selectedDate, WidgetRef ref) {
    final now = DateTime.now();
    return SizedBox(
      height: 80,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: 14,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final date = now.add(Duration(days: index));
          final isSelected = DateFormat('yyyyMMdd').format(date) ==
              DateFormat('yyyyMMdd').format(selectedDate);
          final dayName = DateFormat('EEE').format(date);
          final dayNum = DateFormat('d').format(date);

          return GestureDetector(
            onTap: () =>
                ref.read(selectedDateProvider.notifier).state = date,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 56,
              decoration: BoxDecoration(
                color: isSelected ? AppColors.accent : AppColors.surface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isSelected ? AppColors.accent : AppColors.border,
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    dayName,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: isSelected
                          ? AppColors.background
                          : AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    dayNum,
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: isSelected
                          ? AppColors.background
                          : AppColors.white,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildTimeDropdown(String selectedTime, WidgetRef ref) {
    final times = [
      '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
      '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
    ];
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          const Icon(Icons.access_time_rounded,
              color: AppColors.accent, size: 18),
          const SizedBox(width: 10),
          Expanded(
            child: DropdownButton<String>(
              value: selectedTime,
              isExpanded: true,
              dropdownColor: AppColors.surface,
              underline: const SizedBox(),
              style: const TextStyle(
                  color: AppColors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w500),
              icon: const Icon(Icons.keyboard_arrow_down_rounded,
                  color: AppColors.textSecondary),
              items: times
                  .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                  .toList(),
              onChanged: (v) =>
                  ref.read(selectedTimeProvider.notifier).state = v!,
            ),
          ),
        ],
      ),
    );
  }
}
