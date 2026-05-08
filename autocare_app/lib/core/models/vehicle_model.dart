class Vehicle {
  final String id;
  final String make;
  final String model;
  final int year;
  final String plateNumber;
  final String color;
  final String type;
  final bool isDefault;
  final String? registrationPhotoUrl;

  Vehicle({
    required this.id,
    required this.make,
    required this.model,
    required this.year,
    required this.plateNumber,
    required this.color,
    required this.type,
    required this.isDefault,
    this.registrationPhotoUrl,
  });

  factory Vehicle.fromJson(Map<String, dynamic> json) {
    return Vehicle(
      id: json['id'] ?? '',
      make: json['make'] ?? '',
      model: json['model'] ?? '',
      year: json['year'] ?? 2000,
      plateNumber: json['plateNumber'] ?? '',
      color: json['color'] ?? '',
      type: json['type'] ?? '',
      isDefault: json['isDefault'] ?? false,
      registrationPhotoUrl: json['registrationPhotoUrl'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'make': make,
      'model': model,
      'year': year,
      'plateNumber': plateNumber,
      'color': color,
      'type': type,
      'isDefault': isDefault,
      'registrationPhotoUrl': registrationPhotoUrl,
    };
  }
}
