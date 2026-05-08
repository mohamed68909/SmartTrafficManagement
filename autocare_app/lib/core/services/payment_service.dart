import 'dart:convert';
import 'package:flutter/material.dart';
import '../network/api_client.dart';
import '../network/api_constants.dart';
import '../models/models.dart';

class PaymentService {
  /// Syncs local cart to the backend and initiates checkout.
  /// Returns the clientSecret and orderId needed by Stripe.
  static Future<Map<String, dynamic>> syncCartAndCheckout(List<CartItem> cartItems) async {
    try {
      // 1. Sync items to backend cart
      // (For a robust app, we'd clear backend cart first or match items,
      // but for this phase we'll just add them sequentially)
      for (var item in cartItems) {
        await ApiClient.post(
          ApiConstants.cartItemsUrl,
          {
            'productId': item.product.id,
            'quantity': item.quantity,
          },
        );
      }

      // 2. Call Checkout
      final response = await ApiClient.post(
        ApiConstants.checkoutUrl,
        {'currency': 'egp'}, // As requested by backend CheckoutCommand
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
        return {
          'success': false,
          'message': errorMsg,
        };
      }
    } catch (e) {
      debugPrint('Sync & Checkout Error: $e');
      return {'success': false, 'message': e.toString()};
    }
  }
}
