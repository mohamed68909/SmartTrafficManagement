import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class RecommendedProductCard extends StatelessWidget {
  final Map<String, dynamic> product;
  final bool isDark;
  final VoidCallback onTap;

  const RecommendedProductCard({
    super.key,
    required this.product,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    bool isSelected = product['selected'];

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        width: 170,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isDark ? AppTheme.cardBg : Colors.white,
          borderRadius: BorderRadius.circular(32),
          border: Border.all(
            color: isSelected
                ? AppTheme.primary
                : (isDark ? Colors.white10 : Colors.black12),
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppTheme.primary.withValues(alpha: 0.2),
                    blurRadius: 8,
                    spreadRadius: 1,
                  ),
                ]
              : [],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 100,
              width: double.infinity,
              decoration: BoxDecoration(
                color:
                    isDark ? Color(0xFF1E1E1E) : Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Center(
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 300),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(24),
                    child: Image.asset(
                      product['imagePath'],
                      width: double.infinity,
                      height: 100,
                      fit: BoxFit.cover,
                      key: ValueKey(product['imagePath']),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              product['category'],
              style: TextStyle(
                color: AppTheme.textSecondary,
                fontSize: 9,
                letterSpacing: 1,
              ),
            ),
            Text(
              product['name'],
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  "\$${product['price']}",
                  style: TextStyle(
                    color: AppTheme.primary,
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
                AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? AppTheme.primary
                        : AppTheme.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    isSelected ? 'SELECTED' : 'SELECT',
                    style: TextStyle(
                      color: isSelected ? Colors.black : AppTheme.primary,
                      fontSize: 8,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
