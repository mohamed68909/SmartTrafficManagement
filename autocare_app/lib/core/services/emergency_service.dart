import 'dart:convert';
import '../network/api_client.dart';
import '../network/api_constants.dart';

class EmergencyService {
  static String _getEnumString(dynamic type) {
    if (type is String) return type;
    switch (type) {
      case 1: return 'Maintenance';
      case 2: return 'Inspection';
      case 3: return 'Emergency';
      case 4: return 'Towing';
      case 5: return 'FuelDelivery';
      case 6: return 'VideoSupport';
      default: return 'Emergency';
    }
  }

  static Future<Map<String, dynamic>> requestSos({
    required dynamic serviceType, // Accept String or int
    required double lat,
    required double lng,
    String? notes,
  }) async {
    try {
      final response = await ApiClient.post(
        ApiConstants.sosRequestUrl,
        {
          'ServiceType': _getEnumString(serviceType),
          'Lat': lat,
          'Lng': lng,
          'Notes': notes,
        },
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return {'success': true};
      } else {
        final errorData = jsonDecode(response.body);
        return {
          'success': false, 
          'message': errorData['error']?['message'] ?? 'Failed to send SOS request',
          'statusCode': response.statusCode
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error: $e', 'statusCode': 0};
    }
  }

  static Future<List<dynamic>> getSosHistory() async {
    try {
      final response = await ApiClient.get(ApiConstants.sosHistoryUrl);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['data'] ?? [];
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  static Future<Map<String, dynamic>> cancelSos(String id) async {
    try {
      final response = await ApiClient.patch(ApiConstants.sosCancelUrl(id), {});
      if (response.statusCode == 200) {
        return {'success': true};
      }
      final errorData = jsonDecode(response.body);
      return {'success': false, 'message': errorData['error']?['message'] ?? 'Failed to cancel'};
    } catch (e) {
      return {'success': false, 'message': 'Error: $e'};
    }
  }

  static Future<Map<String, dynamic>> acceptSos(String id) async {
    try {
      final response = await ApiClient.patch(ApiConstants.sosAcceptUrl(id), {});
      if (response.statusCode == 200) {
        return {'success': true};
      }
      final errorData = jsonDecode(response.body);
      return {'success': false, 'message': errorData['error']?['message'] ?? 'Failed to accept'};
    } catch (e) {
      return {'success': false, 'message': 'Error: $e'};
    }
  }

  static Future<Map<String, dynamic>?> getSosStatus(String id) async {
    try {
      final response = await ApiClient.get(ApiConstants.sosStatusUrl(id));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['data'];
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}
