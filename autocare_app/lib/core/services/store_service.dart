import 'dart:convert';
import '../network/api_client.dart';
import '../network/api_constants.dart';
import '../models/models.dart';

class StoreService {
  static Future<List<Product>> getProducts() async {
    try {
      final response = await ApiClient.get(ApiConstants.productsUrl);

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final List<dynamic> data = body['data']['items'];
        return data.map((json) => Product.fromJson(json)).toList();
      } else {
        final errorData = jsonDecode(response.body);
        throw Exception(errorData['error']?['message'] ?? 'Failed to load products');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  static Future<List<dynamic>> getCategories() async {
    try {
      final response = await ApiClient.get(ApiConstants.categoriesUrl);
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        return body['data'] ?? [];
      }
      return [];
    } catch (e) {
      return [];
    }
  }
}
