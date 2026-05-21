import 'dart:convert';
import '../network/api_client.dart';
import '../network/api_constants.dart';

class NotificationService {
  /// GET /api/notifications
  static Future<List<dynamic>> getNotifications() async {
    try {
      final response = await ApiClient.get(ApiConstants.notificationsUrl);
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        return body['data'] ?? [];
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  /// PUT /api/notifications/{id}/read
  static Future<bool> markAsRead(String id) async {
    try {
      final response = await ApiClient.put(
        ApiConstants.markNotificationReadUrl(id),
        {},
      );
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  /// DELETE /api/notifications/{id}
  static Future<bool> deleteNotification(String id) async {
    try {
      final response = await ApiClient.delete(
        ApiConstants.deleteNotificationUrl(id),
      );
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }
}

