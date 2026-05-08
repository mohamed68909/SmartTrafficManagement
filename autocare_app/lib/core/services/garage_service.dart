import 'dart:convert';
import 'dart:io';
import '../network/api_client.dart';
import '../network/api_constants.dart';
import '../models/vehicle_model.dart';

class GarageService {
  static Future<List<Vehicle>> getVehicles() async {
    try {
      final response = await ApiClient.get(ApiConstants.garageUrl);

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final List<dynamic> data = body['data'];
        return data.map((json) => Vehicle.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load vehicles');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  static Future<Map<String, dynamic>> addVehicle(Vehicle vehicle) async {
    try {
      final response = await ApiClient.post(
        ApiConstants.garageUrl,
        vehicle.toJson(),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return {'success': true};
      } else {
        final errorData = jsonDecode(response.body);
        return {'success': false, 'message': errorData['message'] ?? 'Failed to add vehicle'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error: $e'};
    }
  }

  static Future<String?> uploadLicensePlate(File file) async {
    try {
      final response = await ApiClient.upload(
        ApiConstants.uploadUrl,
        file,
        folder: 'documents',
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['data']['url'];
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}
