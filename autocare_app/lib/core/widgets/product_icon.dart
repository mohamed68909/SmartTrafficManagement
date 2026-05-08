// lib/core/widgets/product_icon.dart
// Flutter-drawn product icons — no network images required.
// Each category gets its own neon-green icon on a dark card background.

import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class ProductIcon extends StatelessWidget {
  final String category;
  final double size;

  const ProductIcon({super.key, required this.category, this.size = 60});

  @override
  Widget build(BuildContext context) {
    final data = _iconFor(category);
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: data.bg,
        borderRadius: BorderRadius.circular(size * 0.18),
        border: Border.all(color: data.accent.withValues(alpha:0.3)),
      ),
      child: Center(
        child: Icon(data.icon, color: data.accent, size: size * 0.48),
      ),
    );
  }

  _IconData _iconFor(String category) {
    switch (category.toLowerCase()) {
      case 'oils':
        return _IconData(
          icon: Icons.opacity_rounded,
          accent: AppColors.accent,
          bg: const Color(0xFF1A1A00),
        );
      case 'brakes':
        return _IconData(
          icon: Icons.radio_button_checked_rounded,
          accent: const Color(0xFFFF4444),
          bg: const Color(0xFF1A0000),
        );
      case 'tires':
        return _IconData(
          icon: Icons.tire_repair_rounded,
          accent: AppColors.accent,
          bg: const Color(0xFF0D1A00),
        );
      case 'engine belts':
        return _IconData(
          icon: Icons.settings_rounded,
          accent: const Color(0xFFFF9800),
          bg: const Color(0xFF1A0D00),
        );
      case 'accessories':
        return _IconData(
          icon: Icons.star_rounded,
          accent: const Color(0xFF2196F3),
          bg: const Color(0xFF001A2A),
        );
      case 'filters':
        return _IconData(
          icon: Icons.air_rounded,
          accent: const Color(0xFF00BCD4),
          bg: const Color(0xFF001A1A),
        );
      case 'batteries':
        return _IconData(
          icon: Icons.battery_charging_full_rounded,
          accent: AppColors.accent,
          bg: const Color(0xFF1A1A00),
        );
      default:
        return _IconData(
          icon: Icons.inventory_2_rounded,
          accent: AppColors.accent,
          bg: AppColors.surfaceVariant,
        );
    }
  }
}

class _IconData {
  final IconData icon;
  final Color accent;
  final Color bg;
  const _IconData({required this.icon, required this.accent, required this.bg});
}

// Large hero version for product detail screen
class ProductIconHero extends StatelessWidget {
  final String category;

  const ProductIconHero({super.key, required this.category});

  @override
  Widget build(BuildContext context) {
    return ProductIcon(category: category, size: 120);
  }
}
