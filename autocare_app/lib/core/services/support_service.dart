import 'dart:convert';
import '../network/api_client.dart';
import '../network/api_constants.dart';

/// Lightweight ticket model used in the "My Tickets" list.
class SupportTicket {
  final String id;
  final String subject;
  final String status;
  final DateTime createdAt;

  const SupportTicket({
    required this.id,
    required this.subject,
    required this.status,
    required this.createdAt,
  });

  factory SupportTicket.fromJson(Map<String, dynamic> json) => SupportTicket(
        id: json['id'] ?? '',
        subject: json['subject'] ?? '',
        status: json['status'] ?? 'Open',
        createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      );
}

class SupportService {
  /// Fetch all support tickets belonging to the current user.
  /// Maps to: GET /api/support/tickets/my
  static Future<List<SupportTicket>> getMyTickets() async {
    try {
      final response = await ApiClient.get(ApiConstants.supportTicketsMyUrl);
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final List<dynamic> data = body['data'] ?? [];
        return data.map((j) => SupportTicket.fromJson(j)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  /// Open a new support ticket.
  /// Maps to: POST /api/support/tickets/open
  ///
  /// [subject] — brief description of the issue.
  /// [message] — initial message / details.
  static Future<Map<String, dynamic>> openTicket({
    required String subject,
    required String message,
  }) async {
    try {
      final response = await ApiClient.post(
        ApiConstants.supportOpenTicketUrl,
        {'subject': subject, 'message': message},
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        final body = jsonDecode(response.body);
        return {'success': true, 'data': body['data']};
      }
      final err = jsonDecode(response.body);
      return {'success': false, 'message': err['message'] ?? 'Failed to open ticket'};
    } catch (e) {
      return {'success': false, 'message': 'Error: $e'};
    }
  }

  /// Close an existing support ticket.
  /// Maps to: PATCH /api/support/close/{id}
  static Future<bool> closeTicket(String ticketId) async {
    try {
      final response = await ApiClient.patch(ApiConstants.supportCloseUrl(ticketId), {});
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  /// Fetch the full chat history for a ticket.
  /// Maps to: GET /api/chat/history/{ticketId}
  static Future<List<dynamic>> getChatHistory(String ticketId) async {
    try {
      final response = await ApiClient.get(ApiConstants.chatHistoryUrl(ticketId));
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        return body['data'] ?? [];
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  /// Send a chat message within a ticket conversation.
  /// Maps to: POST /api/chat/send
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
