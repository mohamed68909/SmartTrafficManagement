// lib/core/services/stripe_service.dart
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_stripe/flutter_stripe.dart';

class StripeService {
  static const String _publishableKey =
      'pk_test_51TUhceDd73slVpASb5Ba9vB8lkijS4ESlfbFZFIZTFq2bXNrp8QU8B2tKdIEuJsCSVYjyzyBsM9sVMvVEbf4roz900cshwZCQO';

  static void init() {
    if (kIsWeb || (!Platform.isAndroid && !Platform.isIOS)) {
      debugPrint('Stripe initialization skipped on this platform.');
      return;
    }
    Stripe.publishableKey = _publishableKey;
    Stripe.merchantIdentifier = 'autocare.egypt';
  }

  /// Full payment flow using backend's clientSecret.
  /// This is the SECURE way to process payments.
  static Future<bool> processBackendPayment({
    required String clientSecret,
    required String customerEmail,
    required String customerName,
  }) async {
    // Mock for Desktop/Web testing to avoid MissingPluginException
    if (kIsWeb || (!Platform.isAndroid && !Platform.isIOS)) {
      debugPrint('Simulating successful Stripe payment for Desktop/Web...');
      await Future.delayed(const Duration(seconds: 2));
      return true;
    }

    await Stripe.instance.initPaymentSheet(
      paymentSheetParameters: SetupPaymentSheetParameters(
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'AutoCare Egypt',
        appearance: PaymentSheetAppearance(
          colors: PaymentSheetAppearanceColors(
            primary: const Color(0xFFD4FF00),
            background: ThemeMode.system == ThemeMode.dark ? const Color(0xFF080808) : Colors.white,
            componentBackground: ThemeMode.system == ThemeMode.dark ? const Color(0xFF161616) : Colors.grey[100],
            primaryText: ThemeMode.system == ThemeMode.dark ? Colors.white : Colors.black,
            secondaryText: ThemeMode.system == ThemeMode.dark ? const Color(0xFFA0A0A0) : Colors.grey[700],
            componentText: ThemeMode.system == ThemeMode.dark ? Colors.white : Colors.black,
            placeholderText: ThemeMode.system == ThemeMode.dark ? const Color(0xFF555555) : Colors.grey,
            icon: const Color(0xFFD4FF00),
            componentBorder: ThemeMode.system == ThemeMode.dark ? const Color(0xFF2A2A2A) : Colors.grey[300],
            componentDivider: ThemeMode.system == ThemeMode.dark ? const Color(0xFF2A2A2A) : Colors.grey[300],
          ),
          shapes: const PaymentSheetShape(
            borderRadius: 14,
          ),
        ),
        billingDetails: BillingDetails(
          email: customerEmail,
          name: customerName,
        ),
      ),
    );

    try {
      await Stripe.instance.presentPaymentSheet();
      return true;
    } on StripeException catch (e) {
      if (e.error.code == FailureCode.Canceled) return false;
      rethrow;
    }
  }
}
