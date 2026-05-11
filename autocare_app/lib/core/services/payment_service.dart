import 'dart:convert';
import 'package:flutter/material.dart';
import '../network/api_client.dart';
import '../network/api_constants.dart';
import '../models/models.dart';

class PaymentService {
  /// Syncs local cart to the backend and initiates checkout.
  /// Returns the clientSecret and orderId needed by Stripe.
  static Future<Map<String, dynamic>> syncCartAndCheckout(List<CartItem> cartItems, String paymentMethod) async {
    try {
      int methodInt = 1; // Default to Card
      if (paymentMethod == 'wallet') methodInt = 2;
      if (paymentMethod == 'cash') methodInt = 3;

      final response = await ApiClient.post(
        ApiConstants.checkoutUrl,
        {
          'currency': 'usd',
          'paymentMethod': methodInt,
        },
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final json = jsonDecode(response.body);
        final data = json['data'];
        return {
          'success': true,
          'clientSecret': data['clientSecret'],
          'paymentIntentId': data['paymentIntentId'],
          'orderId': data['orderId'],
        };
      } else {
        final json = jsonDecode(response.body);
        final errorMsg = json['error']?['message'] ?? 'Checkout failed on backend';
        return {'success': false, 'message': errorMsg};
      }
    } catch (e) {
      debugPrint('Sync & Checkout Error: $e');
      return {'success': false, 'message': e.toString()};
    }
  }

  /// Fetch the current user's full payment history.
  /// Maps to: GET /api/payments/history
  static Future<List<dynamic>> getPaymentHistory() async {
    try {
      final response = await ApiClient.get(ApiConstants.paymentHistoryUrl);
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        return body['data'] ?? [];
      }
      return [];
    } catch (e) {
      debugPrint('getPaymentHistory error: $e');
      return [];
    }
  }

  /// Fetch a single payment record by its ID.
  /// Maps to: GET /api/payments/{id}
  static Future<Map<String, dynamic>?> getPaymentById(String id) async {
    try {
      final response = await ApiClient.get(ApiConstants.paymentByIdUrl(id));
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        return body['data'];
      }
      return null;
    } catch (e) {
      debugPrint('getPaymentById error: $e');
      return null;
    }
  }
}
