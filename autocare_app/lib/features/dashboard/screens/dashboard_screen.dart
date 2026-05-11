// lib/features/dashboard/screens/dashboard_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/providers/app_providers.dart';
import '../../../../core/widgets/shared_widgets.dart';
import '../../../../core/models/models.dart';
import '../../history/screens/history_screen.dart';
import '../../mechanic/screens/mechanic_screen.dart';
import '../../vehicle/screens/vehicle_tracker_screen.dart';
import '../../maintenance/screens/car_diagnostic_screen.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orders = ref.watch(ordersProvider);
    final recentOrders =
        orders.where((o) => o.status == OrderStatus.completed).take(3).toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(child: _buildHeader(context)),
            SliverToBoxAdapter(child: _buildTopCards(context)),
            SliverToBoxAdapter(child: _buildQuickActions(context, ref)),
            SliverToBoxAdapter(
                child: _buildUpcomingSection(context, ref)),
            SliverToBoxAdapter(
                child: _buildRecentActivity(context, recentOrders, ref)),
            const SliverToBoxAdapter(child: SizedBox(height: 24)),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Welcome back,',
                  style: Theme.of(context).textTheme.bodyMedium),
              const SizedBox(height: 2),
              const Text(
                'Youssef 👋',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: AppColors.white,
                  letterSpacing: -0.5,
                ),
              ),
            ],
          ),
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: const Icon(Icons.notifications_outlined,
                    color: AppColors.white, size: 20),
              ),
              const SizedBox(width: 10),
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: AppColors.accent,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Center(
                  child: Text(
                    'YA',
                    style: TextStyle(
                      color: AppColors.background,
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTopCards(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
      child: Row(
        children: [
          Expanded(
            child: AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: AppColors.accent.withValues(alpha:0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.account_balance_wallet_outlined,
                            color: AppColors.accent, size: 16),
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'Wallet',
                        style: TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    '1,250',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w800,
                      color: AppColors.accent,
                      letterSpacing: -1,
                    ),
                  ),
                  const Text(
                    'Points',
                    style: TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: AppColors.success.withValues(alpha:0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.eco_outlined,
                            color: AppColors.success, size: 16),
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'Eco Score',
                        style: TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Level 4',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: AppColors.white,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const Text(
                    'Commuter',
                    style: TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context, WidgetRef ref) {
    final actions = [
      {'icon': Icons.video_call_rounded, 'label': 'Mechanic\nCall', 'screen': 'mechanic'},
      {'icon': Icons.gps_fixed_rounded, 'label': 'Smart\nTracker', 'screen': 'tracker'},
      {'icon': Icons.medical_information_rounded, 'label': 'Car\nDiagnosis', 'screen': 'diagnostic'},
      {'icon': Icons.history_rounded, 'label': 'Order\nHistory', 'screen': 'history'},
    ];

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(title: 'Quick Actions'),
          const SizedBox(height: 14),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: actions.map((action) {
              return GestureDetector(
                onTap: () {
                  if (action['screen'] == 'mechanic') {
                    Navigator.push(context,
                      MaterialPageRoute(builder: (_) => const MechanicScreen()));
                  } else if (action['screen'] == 'history') {
                    Navigator.push(context,
                      MaterialPageRoute(builder: (_) => const HistoryScreen()));
                  } else if (action['screen'] == 'tracker') {
                    Navigator.push(context,
                      MaterialPageRoute(builder: (_) => const VehicleTrackerScreen()));
                  } else if (action['screen'] == 'diagnostic') {
                    Navigator.push(context,
                      MaterialPageRoute(builder: (_) => const CarDiagnosticScreen()));
                  } else if (action['screen'] == 'store') {
                    ref.read(navIndexProvider.notifier).state = 2;
                  }
                },
                child: Column(
                  children: [
                    Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Icon(
                        action['icon'] as IconData,
                        color: AppColors.accent,
                        size: 26,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      action['label'] as String,
                      style: const TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                        height: 1.3,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildUpcomingSection(BuildContext context, WidgetRef ref) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(title: 'Upcoming'),
          const SizedBox(height: 14),
          AppCard(
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: AppColors.accent.withValues(alpha:0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.tire_repair_rounded,
                      color: AppColors.accent, size: 24),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Tire Installation',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: AppColors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        DateFormat('EEE, MMM d · h:mm a').format(
                          DateTime.now().add(const Duration(days: 3, hours: 10)),
                        ),
                        style: const TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Text(
                      '850 USD',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppColors.accent,
                      ),
                    ),
                    const SizedBox(height: 4),
                    StatusBadge(label: 'Scheduled', color: AppColors.accent),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecentActivity(
      BuildContext context, List<Order> orders, WidgetRef ref) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionHeader(
            title: 'Recent Activity',
            actionLabel: 'View All',
            onAction: () => Navigator.push(context,
              MaterialPageRoute(builder: (_) => const HistoryScreen())),
          ),
          const SizedBox(height: 14),
          ...orders.map((order) => _OrderTile(order: order)),
        ],
      ),
    );
  }
}

class _OrderTile extends StatelessWidget {
  final Order order;

  const _OrderTile({required this.order});

  @override
  Widget build(BuildContext context) {
    final IconData icon = order.category == OrderCategory.emergency
        ? Icons.bolt_rounded
        : order.category == OrderCategory.shop
            ? Icons.shopping_bag_rounded
            : Icons.build_rounded;

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: AppCard(
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: AppColors.surfaceVariant,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: AppColors.textSecondary, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    order.title,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.white,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 3),
                  Text(
                    DateFormat('MMM d, yyyy').format(order.date),
                    style: const TextStyle(
                      color: AppColors.textMuted,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '${order.price.toStringAsFixed(0)} USD',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppColors.white,
                  ),
                ),
                const SizedBox(height: 4),
                StatusBadge(
                  label: order.statusLabel,
                  color: order.status == OrderStatus.completed
                      ? AppColors.textMuted
                      : AppColors.accent,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
