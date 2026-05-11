import 'dart:convert';
import 'dart:io';
import '../network/api_client.dart';
import '../network/api_constants.dart';
import '../models/vehicle_model.dart';

class GarageService {
  /// Fetch all vehicles belonging to the current user.
  /// Maps to: GET /api/garage
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

  /// Fetch a single vehicle by its ID.
  /// Maps to: GET /api/garage/{id}
  static Future<Vehicle?> getVehicleById(String id) async {
    try {
      final response = await ApiClient.get(ApiConstants.garageVehicleUrl(id));
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        return Vehicle.fromJson(body['data']);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /// Add a new vehicle to the current user's garage.
  /// Maps to: POST /api/garage
  static Future<Map<String, dynamic>> addVehicle(Vehicle vehicle) async {
    try {
      final response = await ApiClient.post(
        ApiConstants.garageUrl,
        vehicle.toJson(),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final body = jsonDecode(response.body);
        return {'success': true, 'data': body['data']};
      } else {
        final errorData = jsonDecode(response.body);
        return {'success': false, 'message': errorData['message'] ?? 'Failed to add vehicle'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error: $e'};
    }
  }

  /// Update an existing vehicle.
  /// Maps to: PUT /api/garage/{id}
  static Future<Map<String, dynamic>> updateVehicle(String id, Vehicle vehicle) async {
    try {
      final response = await ApiClient.put(
        ApiConstants.garageVehicleUrl(id),
        vehicle.toJson(),
      );
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        return {'success': true, 'data': body['data']};
      }
      final errorData = jsonDecode(response.body);
      return {'success': false, 'message': errorData['message'] ?? 'Failed to update vehicle'};
    } catch (e) {
      return {'success': false, 'message': 'Network error: $e'};
    }
  }

  /// Delete a vehicle from the garage.
  /// Maps to: DELETE /api/garage/{id}
  static Future<Map<String, dynamic>> deleteVehicle(String id) async {
    try {
      final response = await ApiClient.delete(ApiConstants.garageVehicleUrl(id));
      if (response.statusCode == 200) {
        return {'success': true};
      }
      final errorData = jsonDecode(response.body);
      return {'success': false, 'message': errorData['message'] ?? 'Failed to delete vehicle'};
    } catch (e) {
      return {'success': false, 'message': 'Network error: $e'};
    }
  }

  /// Upload a license plate image and return the hosted URL.
  /// Maps to: POST /api/upload?folder=documents
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
