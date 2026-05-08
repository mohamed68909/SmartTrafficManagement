import 'dart:convert';
import '../network/api_client.dart';
import '../network/api_constants.dart';

class SupportService {
  static Future<List<dynamic>> getMyTickets() async {
    try {
      final response = await ApiClient.get(ApiConstants.supportTicketsMyUrl);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['data'] ?? [];
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  static Future<bool> closeTicket(String ticketId) async {
    try {
      final response = await ApiClient.patch(ApiConstants.supportCloseUrl(ticketId), {});
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  static Future<List<dynamic>> getChatHistory(String ticketId) async {
    try {
      final response = await ApiClient.get(ApiConstants.chatHistoryUrl(ticketId));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['data'] ?? [];
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  static Future<Map<String, dynamic>> sendChatMessage(String ticketId, String message) async {
    try {
      final response = await ApiClient.post(
        ApiConstants.chatSendUrl,
        {'ticketId': ticketId, 'message': message},
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        return {'success': true, 'data': jsonDecode(response.body)['data']};
      }
      return {'success': false, 'message': 'Failed to send message'};
    } catch (e) {
      return {'success': false, 'message': 'Error: $e'};
    }
  }
}
