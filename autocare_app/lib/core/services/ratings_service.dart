import 'dart:convert';
import '../network/api_client.dart';
import '../network/api_constants.dart';

/// Model representing a single user rating returned by the backend.
class RatingItem {
  final String id;
  final int stars;
  final String? comment;
  final String? serviceRequestId;
  final String? orderId;
  final DateTime createdAtUtc;

  const RatingItem({
    required this.id,
    required this.stars,
    this.comment,
    this.serviceRequestId,
    this.orderId,
    required this.createdAtUtc,
  });

  factory RatingItem.fromJson(Map<String, dynamic> json) => RatingItem(
        id: json['id'] ?? '',
        stars: json['stars'] ?? 0,
        comment: json['comment'],
        serviceRequestId: json['serviceRequestId'],
        orderId: json['orderId'],
        createdAtUtc: DateTime.tryParse(json['createdAtUtc'] ?? '') ?? DateTime.now(),
      );
}

class RatingsService {
  /// Fetch all ratings submitted by the current user.
  /// Maps to: GET /api/ratings/my
  static Future<List<RatingItem>> getMyRatings() async {
    try {
      final response = await ApiClient.get(ApiConstants.ratingsMyUrl);
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final List<dynamic> data = body['data'] ?? [];
        return data.map((j) => RatingItem.fromJson(j)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  /// Submit a new rating for a completed service request or order.
  /// Maps to: POST /api/ratings
  ///
  /// [serviceRequestId] — pass for SOS / emergency service ratings.
  /// [orderId]          — pass for store order ratings.
  /// At least one of the two must be provided.
  static Future<Map<String, dynamic>> submitRating({
    String? serviceRequestId,
    String? orderId,
    required int stars,
    String? comment,
  }) async {
    try {
      final response = await ApiClient.post(
        ApiConstants.ratingsUrl,
        {
          if (serviceRequestId != null) 'serviceRequestId': serviceRequestId,
          if (orderId != null) 'orderId': orderId,
          'stars': stars,
          if (comment != null && comment.isNotEmpty) 'comment': comment,
        },
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        final body = jsonDecode(response.body);
        return {'success': true, 'data': body['data']};
      }
      final err = jsonDecode(response.body);
      return {'success': false, 'message': err['message'] ?? 'Failed to submit rating'};
    } catch (e) {
      return {'success': false, 'message': 'Error: $e'};
    }
  }
}
