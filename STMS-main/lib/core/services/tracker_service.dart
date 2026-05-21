import 'dart:convert';
import '../network/api_client.dart';
import '../network/api_constants.dart';

class TrackerService {
  static Future<SensorData?> getVehicleEnvironment(String vehicleId) async {
    try {
      final response = await ApiClient.get(ApiConstants.sensorsVehicleEnvUrl(vehicleId));

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        if (body['isSuccess'] == true) {
          return SensorData.fromJson(body['data']);
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}

class SensorData {
  final double temperature;
  final double humidity;
  final double airQuality;
  final DateTime capturedAt;

  SensorData({
    required this.temperature,
    required this.humidity,
    required this.airQuality,
    required this.capturedAt,
  });

  factory SensorData.fromJson(Map<String, dynamic> json) {
    return SensorData(
      temperature: (json['temperatureCelsius'] ?? 0).toDouble(),
      humidity: (json['humidityPercentage'] ?? 0).toDouble(),
      airQuality: (json['airQualityIndex'] ?? 0).toDouble(),
      capturedAt: DateTime.parse(json['capturedAtUtc'] ?? DateTime.now().toIso8601String()),
    );
  }
}
