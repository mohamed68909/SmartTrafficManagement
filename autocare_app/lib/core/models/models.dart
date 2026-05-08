// lib/core/models/models.dart

// ─── Product ──────────────────────────────────────────────────────────────────
class Product {
  final String id;
  final String name;
  final String brand;
  final String category;
  final double price;
  final String imageUrl;
  final String? specs;
  final double? rating;
  int quantity;

  Product({
    required this.id,
    required this.name,
    required this.brand,
    required this.category,
    required this.price,
    required this.imageUrl,
    this.specs,
    this.rating,
    this.quantity = 1,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] ?? '',
      name: json['name'] ?? 'Unknown Product',
      brand: 'Generic', // Assuming generic brand since it's not in the DTO
      category: json['categoryName'] ?? 'Oils', // Default category
      price: (json['price'] ?? 0).toDouble(),
      imageUrl: json['imageUrl'] ?? '',
      specs: json['description'],
      rating: 4.5, // Default rating
      quantity: 1,
    );
  }

  Product copyWith({int? quantity}) => Product(
        id: id,
        name: name,
        brand: brand,
        category: category,
        price: price,
        imageUrl: imageUrl,
        specs: specs,
        rating: rating,
        quantity: quantity ?? this.quantity,
      );
}

// ─── Order ────────────────────────────────────────────────────────────────────
enum OrderStatus { scheduled, inProgress, completed, cancelled }

enum OrderCategory { shop, emergency, maintenance }

class Order {
  final String id;
  final String title;
  final DateTime date;
  final double price;
  final OrderStatus status;
  final OrderCategory category;
  final String? subtitle;

  const Order({
    required this.id,
    required this.title,
    required this.date,
    required this.price,
    required this.status,
    required this.category,
    this.subtitle,
  });

  String get statusLabel {
    switch (status) {
      case OrderStatus.scheduled:
        return 'Scheduled';
      case OrderStatus.inProgress:
        return 'In Progress';
      case OrderStatus.completed:
        return 'Completed';
      case OrderStatus.cancelled:
        return 'Cancelled';
    }
  }
}

// ─── ServiceAppointment ───────────────────────────────────────────────────────
class ServiceAppointment {
  final String id;
  final String serviceName;
  final DateTime dateTime;
  final double estimatedCost;
  final String location;
  final bool isUpcoming;

  const ServiceAppointment({
    required this.id,
    required this.serviceName,
    required this.dateTime,
    required this.estimatedCost,
    required this.location,
    this.isUpcoming = true,
  });
}

// ─── PaymentMethod ────────────────────────────────────────────────────────────
enum CardBrand { visa, mastercard, amex }

class PaymentMethod {
  final String id;
  final CardBrand brand;
  final String lastFour;
  final String expiryDate;
  final String holderName;

  const PaymentMethod({
    required this.id,
    required this.brand,
    required this.lastFour,
    required this.expiryDate,
    required this.holderName,
  });

  String get brandName {
    switch (brand) {
      case CardBrand.visa:
        return 'Visa';
      case CardBrand.mastercard:
        return 'Mastercard';
      case CardBrand.amex:
        return 'Amex';
    }
  }
}

// ─── CartItem ─────────────────────────────────────────────────────────────────
class CartItem {
  final String? cartItemId; // ID from backend
  final Product product;
  int quantity;

  CartItem({this.cartItemId, required this.product, this.quantity = 1});

  double get total => product.price * quantity;
}

// ─── Address ──────────────────────────────────────────────────────────────────
class DeliveryAddress {
  final String id;
  final String label;
  final String address;
  final bool isDefault;

  const DeliveryAddress({
    required this.id,
    required this.label,
    required this.address,
    this.isDefault = false,
  });
}

// ─── Tire ─────────────────────────────────────────────────────────────────────
class Tire {
  final String id;
  final String brand;
  final String model;
  final String size;
  final double price;
  final String imageUrl;
  final double? rating;
  final String? specs;

  const Tire({
    required this.id,
    required this.brand,
    required this.model,
    required this.size,
    required this.price,
    required this.imageUrl,
    this.rating,
    this.specs,
  });
}

// ─── MaintenanceItem ──────────────────────────────────────────────────────────
class MaintenanceItem {
  final String id;
  final String name;
  final String icon;
  final double price;

  const MaintenanceItem({
    required this.id,
    required this.name,
    required this.icon,
    required this.price,
  });
}
