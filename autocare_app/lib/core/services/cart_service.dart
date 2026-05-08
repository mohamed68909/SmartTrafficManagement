import 'dart:convert';
import '../network/api_client.dart';
import '../network/api_constants.dart';

class CartService {
  static Future<Map<String, dynamic>?> getCart() async {
    try {
      final response = await ApiClient.get(ApiConstants.cartUrl);
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        return body['data'];
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  static Future<Map<String, dynamic>> addItem(String productId, int quantity) async {
    try {
      final response = await ApiClient.post(
        ApiConstants.cartItemsUrl,
        {'productId': productId, 'quantity': quantity},
      );
      if (response.statusCode == 200) {
        return {'success': true, 'data': jsonDecode(response.body)['data']};
      }
      return {'success': false, 'message': 'Failed to add item'};
    } catch (e) {
      return {'success': false, 'message': 'Error: $e'};
    }
  }

  static Future<Map<String, dynamic>> updateQuantity(String cartItemId, int quantity) async {
    try {
      final response = await ApiClient.patch(
        ApiConstants.cartItemUrl(cartItemId),
        {'quantity': quantity},
      );
      if (response.statusCode == 200) {
        return {'success': true, 'data': jsonDecode(response.body)['data']};
      }
      return {'success': false, 'message': 'Failed to update quantity'};
    } catch (e) {
      return {'success': false, 'message': 'Error: $e'};
    }
  }

  static Future<Map<String, dynamic>> removeItem(String cartItemId) async {
    try {
      final response = await ApiClient.delete(ApiConstants.cartItemUrl(cartItemId));
      if (response.statusCode == 200) {
        return {'success': true};
      }
      return {'success': false, 'message': 'Failed to remove item'};
    } catch (e) {
      return {'success': false, 'message': 'Error: $e'};
    }
  }
}
