// lib/core/services/stripe_service.dart
import 'dart:io';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:http/http.dart' as http;

class StripeService {
  static const String _publishableKey =
      'pk_test_51TUhceDd73slVpASb5Ba9vB8lkijS4ESlfbFZFIZTFq2bXNrp8QU8B2tKdIEuJsCSVYjyzyBsM9sVMvVEbf4roz900cshwZCQO';
  
  static const String _secretKey =
      'sk_test_51TUhceDd73slVpAS6jQcfJ268fpl9VAJLpFyXgrcABz1NlHEKp4YoQtHz3V9Oj1ZYr1Yqn3vFKxiTNevoUG5ASJi00zaTT7GND';

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

  /// Direct payment flow (Creates PaymentIntent on the client side using sk_test)
  /// Used when there is no backend configured to handle payments.
  static Future<bool> processDirectPayment({
    required int amountInCents,
    required String currency,
    required String customerEmail,
    required String customerName,
  }) async {
    try {
      // 1. Create PaymentIntent directly via Stripe API
      final url = Uri.parse('https://api.stripe.com/v1/payment_intents');
      final response = await http.post(
        url,
        headers: {
          'Authorization': 'Bearer $_secretKey',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: {
          'amount': amountInCents.toString(),
          'currency': currency,
        },
      );

      final jsonBody = jsonDecode(response.body);
      if (jsonBody['error'] != null) {
        debugPrint('Stripe API Error: ${jsonBody['error']['message']}');
        return false;
      }

      final clientSecret = jsonBody['client_secret'];

      // 2. Initialize and present the payment sheet
      return await processBackendPayment(
        clientSecret: clientSecret,
        customerEmail: customerEmail,
        customerName: customerName,
      );
    } catch (e) {
      debugPrint('processDirectPayment error: $e');
      return false;
    }
  }
}
