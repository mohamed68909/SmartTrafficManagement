// lib/features/profile/screens/notifications_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/shared_widgets.dart';
import '../../../../core/providers/app_providers.dart';
import '../../../../core/services/notification_service.dart';

class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});

  @override
  ConsumerState<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  static IconData _iconFor(String? title) {
    final t = (title ?? '').toLowerCase();
    if (t.contains('order') || t.contains('confirm')) return Icons.check_circle_rounded;
    if (t.contains('ship') || t.contains('deliver')) return Icons.local_shipping_rounded;
    if (t.contains('emergency') || t.contains('alert')) return Icons.bolt_rounded;
    if (t.contains('point')) return Icons.stars_rounded;
    if (t.contains('maintenance') || t.contains('reminder')) return Icons.build_rounded;
    if (t.contains('offer') || t.contains('discount')) return Icons.local_offer_rounded;
    if (t.contains('payment')) return Icons.check_circle_rounded;
    return Icons.notifications_rounded;
  }

  static Color _colorFor(String? title) {
    final t = (title ?? '').toLowerCase();
    if (t.contains('emergency') || t.contains('alert')) return const Color(0xFFFF9800);
    if (t.contains('payment') || t.contains('order') || t.contains('confirm')) return AppColors.success;
    return AppColors.accent;
  }

  String _timeAgo(String? createdAt) {
    if (createdAt == null) return '';
    final dt = DateTime.tryParse(createdAt);
    if (dt == null) return '';
    final diff = DateTime.now().difference(dt.toLocal());
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes} min ago';
    if (diff.inHours < 24) return '${diff.inHours} hr ago';
    if (diff.inDays < 7) return '${diff.inDays} days ago';
    return '${dt.day}/${dt.month}/${dt.year}';
  }

  @override
  Widget build(BuildContext context) {
    final notificationsAsync = ref.watch(notificationsFutureProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: buildAppBar(
        context,
        title: 'Notifications',
        showBack: true,
        actions: [
          TextButton(
            onPressed: () {
              // Refresh after marking all read
              ref.invalidate(notificationsFutureProvider);
            },
            child: const Text('Mark all read',
                style: TextStyle(
                    color: AppColors.accent,
                    fontSize: 12,
                    fontWeight: FontWeight.w600)),
          ),
        ],
      ),
      body: notificationsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.accent)),
        error: (err, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.notifications_off_outlined, color: AppColors.textMuted, size: 48),
              const SizedBox(height: 12),
              const Text('Could not load notifications', style: TextStyle(color: AppColors.textSecondary, fontSize: 14)),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () => ref.invalidate(notificationsFutureProvider),
                child: const Text('Retry', style: TextStyle(color: AppColors.accent)),
              ),
            ],
          ),
        ),
        data: (notifications) {
          final unread = notifications.where((n) => n['isRead'] == false).length;
          if (notifications.isEmpty) {
            return const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.notifications_none_rounded, color: AppColors.textMuted, size: 56),
                  SizedBox(height: 12),
                  Text('No notifications yet', style: TextStyle(color: AppColors.textSecondary, fontSize: 14)),
                ],
              ),
            );
          }
          return Column(
            children: [
              if (unread > 0)
                Container(
                  margin: const EdgeInsets.fromLTRB(20, 12, 20, 0),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: AppColors.accent.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.accent.withOpacity(0.25)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 20,
                        height: 20,
                        decoration: const BoxDecoration(
                            color: AppColors.accent, shape: BoxShape.circle),
                        child: Center(
                          child: Text('$unread',
                              style: const TextStyle(
                                  color: AppColors.background,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w800)),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '$unread unread notification${unread > 1 ? 's' : ''}',
                        style: const TextStyle(
                            color: AppColors.accent,
                            fontSize: 13,
                            fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ),
              Expanded(
                child: ListView.separated(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                  itemCount: notifications.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (context, index) {
                    final n = notifications[index];
                    final isRead = n['isRead'] == true;
                    final icon = _iconFor(n['title']?.toString());
                    final color = _colorFor(n['title']?.toString());
                    return GestureDetector(
                      onTap: () async {
                        if (!isRead) {
                          final id = n['id']?.toString() ?? '';
                          await NotificationService.markAsRead(id);
                          ref.invalidate(notificationsFutureProvider);
                        }
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: isRead
                              ? AppColors.surface
                              : AppColors.accent.withOpacity(0.06),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: isRead
                                ? AppColors.border
                                : AppColors.accent.withOpacity(0.3),
                            width: isRead ? 1 : 1.5,
                          ),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                color: color.withOpacity(0.12),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Icon(icon, color: color, size: 20),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Text(
                                          n['title']?.toString() ?? '',
                                          style: TextStyle(
                                            fontSize: 14,
                                            fontWeight: isRead
                                                ? FontWeight.w500
                                                : FontWeight.w700,
                                            color: AppColors.white,
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Text(_timeAgo(n['createdAt']?.toString()),
                                          style: const TextStyle(
                                              color: AppColors.textMuted,
                                              fontSize: 10)),
                                      if (!isRead) ...[
                                        const SizedBox(width: 6),
                                        Container(
                                          width: 7,
                                          height: 7,
                                          decoration: const BoxDecoration(
                                              color: AppColors.accent,
                                              shape: BoxShape.circle),
                                        ),
                                      ],
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    n['message']?.toString() ?? '',
                                    style: const TextStyle(
                                      color: AppColors.textSecondary,
                                      fontSize: 12,
                                      height: 1.4,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
