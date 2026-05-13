// lib/shell.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/app_theme.dart';
import 'core/providers/app_providers.dart';
import 'features/dashboard/screens/dashboard_screen.dart';
import 'features/traffic/screens/traffic_screen.dart';
import 'features/store/screens/store_screen.dart';
import 'features/maintenance/screens/maintenance_screen.dart';
import 'features/profile/screens/profile_screen.dart';
import 'main.dart' show MainMenuScreen;

class AppShell extends ConsumerWidget {
  const AppShell({super.key});

  static const List<Widget> _screens = [
    DashboardScreen(),   // 0
    TrafficScreen(),     // 1
    StoreScreen(),       // 2
    MaintenanceScreen(), // 3
    ProfileScreen(),     // 4
    MainMenuScreen(),    // 5 ← Menu tab
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final navIndex = ref.watch(navIndexProvider);

    return Scaffold(
      body: IndexedStack(
        index: navIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: AppColors.surface,
          border: Border(top: BorderSide(color: AppColors.border, width: 1)),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _NavItem(
                  icon: Icons.home_rounded,
                  label: 'Home',
                  index: 0,
                  currentIndex: navIndex,
                  onTap: () => ref.read(navIndexProvider.notifier).state = 0,
                ),
                _NavItem(
                  icon: Icons.traffic_rounded,
                  label: 'Traffic',
                  index: 1,
                  currentIndex: navIndex,
                  onTap: () => ref.read(navIndexProvider.notifier).state = 1,
                ),
                _NavItem(
                  icon: Icons.storefront_rounded,
                  label: 'Store',
                  index: 2,
                  currentIndex: navIndex,
                  onTap: () => ref.read(navIndexProvider.notifier).state = 2,
                ),
                _NavItem(
                  icon: Icons.build_rounded,
                  label: 'Service',
                  index: 3,
                  currentIndex: navIndex,
                  onTap: () => ref.read(navIndexProvider.notifier).state = 3,
                ),
                _NavItem(
                  icon: Icons.person_rounded,
                  label: 'Profile',
                  index: 4,
                  currentIndex: navIndex,
                  onTap: () => ref.read(navIndexProvider.notifier).state = 4,
                ),
                _NavItem(
                  icon: Icons.grid_view_rounded,
                  label: 'Menu',
                  index: 5,
                  currentIndex: navIndex,
                  onTap: () => ref.read(navIndexProvider.notifier).state = 5,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final int index;
  final int currentIndex;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon,
    required this.label,
    required this.index,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isActive = index == currentIndex;
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        decoration: isActive
            ? BoxDecoration(
                color: AppColors.accent.withValues(alpha:0.12),
                borderRadius: BorderRadius.circular(10),
              )
            : null,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 200),
              child: Icon(
                icon,
                key: ValueKey(isActive),
                size: 22,
                color: isActive ? AppColors.accent : AppColors.textMuted,
              ),
            ),
            const SizedBox(height: 3),
            Text(
              label,
              style: TextStyle(
                fontSize: 9,
                fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                color: isActive ? AppColors.accent : AppColors.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
