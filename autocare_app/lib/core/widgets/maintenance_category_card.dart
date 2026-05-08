import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class MaintenanceCategoryCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final bool isDark;
  final bool isSelected;
  final double price;
  final VoidCallback onTap;

  const MaintenanceCategoryCard({
    super.key,
    required this.title,
    required this.icon,
    required this.isDark,
    required this.isSelected,
    required this.price,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected
              ? AppTheme.primary.withValues(alpha: 0.1)
              : (isDark ? AppTheme.cardBg : Colors.white),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: isSelected
                ? AppTheme.primary
                : (isDark ? Colors.white10 : Colors.black12),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Icon(icon, color: AppTheme.primary, size: 24),
                if (isSelected)
                  Icon(Icons.check_circle,
                      color: AppTheme.primary, size: 16),
              ],
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: const TextStyle(
                        fontWeight: FontWeight.w500, fontSize: 13)),
                Text('+\$${price.toStringAsFixed(0)}',
                    style: TextStyle(
                        color: AppTheme.textSecondary, fontSize: 11)),
              ],
            )
          ],
        ),
      ),
    );
  }
}
