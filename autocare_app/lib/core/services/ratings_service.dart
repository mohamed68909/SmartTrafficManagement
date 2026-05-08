import 'dart:convert';
import '../network/api_client.dart';
import '../network/api_constants.dart';

class RatingsService {
  static Future<List<dynamic>> getMyRatings() async {
    try {
      final response = await ApiClient.get(ApiConstants.ratingsMyUrl);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['data'] ?? [];
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  static Future<Map<String, dynamic>> submitRating({
    required String targetId,
    required String targetType,
    required int rating,
    String? comment,
  }) async {
    try {
      final response = await ApiClient.post(
        ApiConstants.ratingsMyUrl.replaceAll('/my', ''), // POST /api/ratings
        {
          'targetId': targetId,
          'targetType': targetType,
          'value': rating,
          'comment': comment,
        },
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        return {'success': true};
      }
      return {'success': false, 'message': 'Failed to submit rating'};
    } catch (e) {
      return {'success': false, 'message': 'Error: $e'};
    }
  }
}
