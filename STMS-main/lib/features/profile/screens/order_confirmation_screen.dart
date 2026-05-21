import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../history/screens/history_screen.dart';

class OrderConfirmationScreen extends StatefulWidget {
  const OrderConfirmationScreen({super.key});

  @override
  State<OrderConfirmationScreen> createState() =>
      _OrderConfirmationScreenState();
}

class _OrderConfirmationScreenState extends State<OrderConfirmationScreen> {
  String orderNumber = '#EG-998742';
  String deliveryDate = 'April 15, 2026';
  String deliveryTime = '10:00 AM';

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                height: 120,
                width: 120,
                decoration: BoxDecoration(
                  color: AppTheme.primary,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                        color: AppTheme.primary.withValues(alpha: 0.4),
                        blurRadius: 40,
                        spreadRadius: 10),
                  ],
                ),
                child: const Center(
                  child: Icon(LucideIcons.check, color: Colors.black, size: 60),
                ),
              ),
              const SizedBox(height: 48),
              Text(
                'Order Confirmed!',
                style:
                    const TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                "Order $orderNumber",
                style: TextStyle(color: AppTheme.textSecondary),
              ),
              const SizedBox(height: 48),
              Container(
                padding: const EdgeInsets.all(32),
                decoration: BoxDecoration(
                  color: isDark ? AppTheme.cardBg : Colors.white,
                  borderRadius: BorderRadius.circular(32),
                  border: Border.all(
                      color: isDark ? Colors.white10 : Colors.black12),
                  boxShadow: isDark
                      ? []
                      : [
                          BoxShadow(
                              color: Colors.black.withValues(alpha: 0.02),
                              blurRadius: 10,
                              offset: const Offset(0, 4))
                        ],
                ),
                child: Column(
                  children: [
                    Text(
                      'Your order has been confirmed and will be delivered on:',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                          color: AppTheme.textSecondary, height: 1.5),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      deliveryDate,
                      style: TextStyle(
                          color: AppTheme.primary,
                          fontSize: 24,
                          fontWeight: FontWeight.bold),
                    ),
                    Text(
                      deliveryTime,
                      style: const TextStyle(
                          fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 48),
              SizedBox(
                width: double.infinity,
                height: 60,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pushNamedAndRemoveUntil(
                      context,
                      '/',
                      (route) => false,
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    foregroundColor: Colors.black,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Text('View Dashboard',
                      style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 60,
                child: OutlinedButton(
                  onPressed: () {
                    Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const HistoryScreen()));
                  },
                  style: OutlinedButton.styleFrom(
                    foregroundColor: isDark ? Colors.white : Colors.black87,
                    side: BorderSide(
                        color: isDark ? Colors.white10 : Colors.black12),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Text('Track Order'),
                ),
              ),
              const SizedBox(height: 40),
              Text(
                'Redirecting to dashboard in 5 seconds...',
                style: TextStyle(
                    color: AppTheme.textSecondary, fontSize: 12),
              )
            ],
          ),
        ),
      ),
    ),
  );
  }
}
