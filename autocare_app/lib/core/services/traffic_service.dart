import 'dart:convert';
import '../network/api_client.dart';
import '../network/api_constants.dart';

class TrafficService {
  static Future<Map<String, dynamic>> reportIncident({
    required String title,
    required String description,
    required String location,
    bool isVerified = false,
  }) async {
    try {
      final response = await ApiClient.post(
        ApiConstants.trafficReportUrl,
        {
          'title': title,
          'description': description,
          'location': location,
          'isVerified': isVerified,
        },
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return {'success': true, 'data': jsonDecode(response.body)['data']};
      } else {
        final errorData = jsonDecode(response.body);
        return {'success': false, 'message': errorData['error']?['message'] ?? 'Failed to submit report'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error: $e'};
    }
  }

  static Future<List<dynamic>> getIncidents() async {
    try {
      final response = await ApiClient.get(ApiConstants.trafficIncidentsUrl);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['data'] ?? [];
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  static Future<List<dynamic>> getIncidentsByLocation(String location) async {
    try {
      final response = await ApiClient.get(ApiConstants.trafficIncidentsByLocationUrl(location));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['data'] ?? [];
      }
      return [];
    } catch (e) {
      return [];
    }
  }
}
