import 'dart:convert';
import '../network/api_client.dart';
import '../network/api_constants.dart';
import '../models/models.dart';

class OrderService {
  static Future<List<Order>> getMyOrders() async {
    try {
      final List<Order> allOrders = [];

      // 1. Fetch Product Orders
      final orderResp = await ApiClient.get(ApiConstants.ordersUrl);
      if (orderResp.statusCode == 200) {
        final body = jsonDecode(orderResp.body);
        final List<dynamic> data = body['data'] ?? [];
        allOrders.addAll(data.map((json) {
          final orderIdStr = (json['orderId'] ?? '').toString();
          return Order(
              id: orderIdStr,
              title: 'Order #${orderIdStr.length >= 5 ? orderIdStr.substring(0, 5).toUpperCase() : orderIdStr}',
              date: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
              price: (json['totalAmount'] ?? 0).toDouble(),
              status: _mapStatus(json['status']),
              category: OrderCategory.shop,
              subtitle: '${json['itemsCount'] ?? 0} items',
            );
          }).toList());
      }

      // 2. Fetch SOS Requests
      final sosResp = await ApiClient.get(ApiConstants.sosHistoryUrl);
      if (sosResp.statusCode == 200) {
        final body = jsonDecode(sosResp.body);
        final List<dynamic> data = body['data'] ?? [];
        allOrders.addAll(data.map((json) {
          final type = _mapServiceType(json['serviceType']);
          return Order(
            id: json['id'] ?? '',
            title: 'Emergency: $type',
            date: DateTime.parse(json['requestedAtUtc'] ?? DateTime.now().toIso8601String()),
            price: 500, // Fixed price for SOS for now or from backend if added
            status: _mapSosStatus(json['status']),
            category: OrderCategory.emergency,
            subtitle: 'Service Location Active',
          );
        }));
      }

      // Sort by date descending
      allOrders.sort((a, b) => b.date.compareTo(a.date));
      return allOrders;
    } catch (e) {
      return [];
    }
  }

  static String _mapServiceType(dynamic type) {
    final typeStr = type?.toString();
    switch (typeStr) {
      case '1':
      case 'Maintenance':
        return 'Maintenance';
      case '2':
      case 'Inspection':
        return 'Inspection';
      case '3':
      case 'Emergency':
        return 'Emergency';
      case '4':
      case 'Towing':
        return 'Towing';
      case '5':
      case 'FuelDelivery':
      case 'Fuel Delivery':
        return 'Fuel Delivery';
      case '6':
      case 'VideoSupport':
      case 'Video Support':
        return 'Video Support';
      default:
        return 'Emergency Aid';
    }
  }

  static OrderStatus _mapStatus(dynamic status) {
    final statusStr = status?.toString();
    switch (statusStr) {
      case '0':
      case '1':
      case 'Pending':
        return OrderStatus.scheduled; // Pending
      case '2':
      case 'Processing':
      case '3':
      case 'Shipped':
        return OrderStatus.inProgress; // Processing / Shipped
      case '4':
      case 'Delivered':
        return OrderStatus.completed; // Delivered
      case '5':
      case 'Cancelled':
        return OrderStatus.cancelled;
      default:
        return OrderStatus.scheduled;
    }
  }

  static OrderStatus _mapSosStatus(dynamic status) {
    final statusStr = status?.toString();
    switch (statusStr) {
      case '0':
      case '1':
      case 'Pending':
        return OrderStatus.scheduled; // Requested (Pending)
      case '2':
      case 'Accepted':
      case '3':
      case 'InProgress':
        return OrderStatus.inProgress; // Accepted / InProgress
      case '4':
      case 'Completed':
        return OrderStatus.completed; // Completed
      case '5':
      case 'Rejected':
      case '6':
      case 'Cancelled':
        return OrderStatus.cancelled; // Cancelled
      default:
        return OrderStatus.scheduled;
    }
  }

  static Future<Map<String, dynamic>?> getOrderDetails(String orderId) async {
    try {
      final response = await ApiClient.get(ApiConstants.orderDetailsUrl(orderId));
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        return body['data'];
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}
