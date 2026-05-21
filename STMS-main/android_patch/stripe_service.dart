// lib/core/services/stripe_service.dart
//
// ⚠️  SECURITY NOTE — READ BEFORE PRODUCTION DEPLOYMENT:
// ─────────────────────────────────────────────────────────
// This file calls the Stripe API directly from the client using the Secret Key.
// This is ONLY acceptable for a graduation project demo.
//
// In production:
//  1. Create a backend (Node.js / Python / Firebase Functions)
//  2. The backend calls stripe.paymentIntents.create() with the Secret Key
//  3. Client calls YOUR endpoint → receives only the client_secret
//  4. Use flutter_stripe on client only to present the PaymentSheet
// ─────────────────────────────────────────────────────────

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_stripe/flutter_stripe.dart';

class StripeService {
  // ⚠️ NEVER expose secret key in production client code
  static const String _secretKey =
      'sk_test_51TMnqBHPklzCGFjckvFl1fbL0CHUxjeG8g6tJfQfSCxuCVvErQnuY0G6m2nbBKYVryAIn8CRUCm1SwpAvt9HUALK009iRy3Gkc';

  static const String _publishableKey =
      'pk_test_51TMnqBHPklzCGFjcCz9AVAcZPUagl21zWKI9vg4MKVpftQvtKGKO8U3fgz5Lg8s1xhystsgGLfVXSJrfiEtKfTsD00yh3gHgPb';

  /// Call once from main() before runApp()
  static void init() {
    Stripe.publishableKey = _publishableKey;
    Stripe.merchantIdentifier = 'autocare.egypt';
  }

  /// Creates a PaymentIntent and returns client_secret.
  /// ⚠️ Move this to your backend in production.
  static Future<String> _createPaymentIntent({
    required int amountInPiastres,
    String currency = 'egp',
  }) async {
    final response = await http.post(
      Uri.parse('https://api.stripe.com/v1/payment_intents'),
      headers: {
        'Authorization': 'Bearer $_secretKey',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: {
        'amount': amountInPiastres.toString(),
        'currency': currency,
        'payment_method_types[]': 'card',
      },
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body)['client_secret'] as String;
    }
    final error = jsonDecode(response.body);
    throw Exception('Stripe error: ${error['error']['message']}');
  }

  /// Full payment flow: create intent → init sheet → present sheet.
  /// Returns true on success, false if user cancelled.
  static Future<bool> processPayment({
    required double amountEGP,
    required String customerEmail,
    required String customerName,
  }) async {
    final clientSecret = await _createPaymentIntent(
      amountInPiastres: (amountEGP * 100).round(),
    );

    await Stripe.instance.initPaymentSheet(
      paymentSheetParameters: SetupPaymentSheetParameters(
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'AutoCare Egypt',
        // Simplified appearance — compatible with flutter_stripe 10.x
        appearance: const PaymentSheetAppearance(
          colors: PaymentSheetAppearanceColors(
            primary: Color(0xFFD4FF00),
            background: Color(0xFF080808),
            componentBackground: Color(0xFF161616),
            primaryText: Color(0xFFFFFFFF),
            secondaryText: Color(0xFFA0A0A0),
            componentText: Color(0xFFFFFFFF),
            placeholderText: Color(0xFF555555),
            icon: Color(0xFFD4FF00),
            componentBorder: Color(0xFF2A2A2A),
            componentDivider: Color(0xFF2A2A2A),
          ),
          shapes: PaymentSheetShape(
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
