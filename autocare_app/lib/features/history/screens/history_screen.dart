// lib/features/history/screens/history_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/providers/app_providers.dart';
import '../../../../core/widgets/shared_widgets.dart';
import '../../../../core/models/models.dart';

class HistoryScreen extends ConsumerWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final filter = ref.watch(historyFilterProvider);
    final allOrders = ref.watch(ordersProvider);

    final filteredOrders = allOrders.where((o) {
      if (filter == 'All') return true;
      if (filter == 'Shop') return o.category == OrderCategory.shop;
      if (filter == 'Emergency') return o.category == OrderCategory.emergency;
      if (filter == 'Maintenance') return o.category == OrderCategory.maintenance;
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: buildAppBar(context, title: 'Order History', showBack: true),
      body: Column(
        children: [
          // Filter Chips
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: ['All', 'Shop', 'Emergency', 'Maintenance'].map((f) {
                  final isSelected = filter == f;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: GestureDetector(
                      onTap: () =>
                          ref.read(historyFilterProvider.notifier).state = f,
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? AppColors.accent
                              : AppColors.surface,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: isSelected
                                ? AppColors.accent
                                : AppColors.border,
                          ),
                        ),
                        child: Text(
                          f,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: isSelected
                                ? AppColors.background
                                : AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
          const SizedBox(height: 16),
          // Order List
          Expanded(
            child: filteredOrders.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.receipt_long_rounded,
                            color: AppColors.textMuted, size: 48),
                        const SizedBox(height: 12),
                        const Text(
                          'No orders found',
                          style: TextStyle(
                              color: AppColors.textSecondary, fontSize: 14),
                        ),
                      ],
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
                    itemCount: filteredOrders.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, index) =>
                        _OrderHistoryTile(order: filteredOrders[index]),
                  ),
          ),
        ],
      ),
    );
  }
}

class _OrderHistoryTile extends StatelessWidget {
  final Order order;

  const _OrderHistoryTile({required this.order});

  Color get _statusColor {
    switch (order.status) {
      case OrderStatus.scheduled:
        return AppColors.accent;
      case OrderStatus.inProgress:
        return const Color(0xFFFF9800);
      case OrderStatus.completed:
        return AppColors.textMuted;
      case OrderStatus.cancelled:
        return AppColors.error;
    }
  }

  IconData get _categoryIcon {
    switch (order.category) {
      case OrderCategory.shop:
        return Icons.shopping_bag_rounded;
      case OrderCategory.emergency:
        return Icons.bolt_rounded;
      case OrderCategory.maintenance:
        return Icons.build_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppColors.surfaceVariant,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(_categoryIcon,
                    color: AppColors.textSecondary, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      order.title,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Order ID: ${order.id}',
                      style: const TextStyle(
                          color: AppColors.textMuted, fontSize: 11),
                    ),
                  ],
                ),
              ),
              StatusBadge(label: order.statusLabel, color: _statusColor),
            ],
          ),
          const SizedBox(height: 12),
          const NeonDivider(),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.calendar_today_rounded,
                      color: AppColors.textMuted, size: 12),
                  const SizedBox(width: 5),
                  Text(
                    DateFormat('MMM d, yyyy').format(order.date),
                    style: const TextStyle(
                        color: AppColors.textMuted, fontSize: 12),
                  ),
                ],
              ),
              Text(
                '${order.price.toStringAsFixed(0)} USD',
                style: const TextStyle(
                  color: AppColors.white,
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
          if (order.subtitle != null) ...[
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.location_on_rounded,
                    color: AppColors.textMuted, size: 12),
                const SizedBox(width: 5),
                Text(
                  order.subtitle!,
                  style: const TextStyle(
                      color: AppColors.textMuted, fontSize: 11),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
