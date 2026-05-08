import 'dart:convert';
import '../network/api_client.dart';

class TrackerService {
  static Future<SensorData?> getVehicleEnvironment(String vehicleId) async {
    try {
      final response = await ApiClient.get('/sensors/vehicle-env?vehicleId=$vehicleId');

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        if (body['isSuccess']) {
          return SensorData.fromJson(body['value']);
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
