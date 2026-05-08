class Product {
  final String id;
  final String name;
  final String? description;
  final double price;
  final int stockQuantity;
  final String categoryName;
  final String? imageUrl;

  Product({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    required this.stockQuantity,
    required this.categoryName,
    this.imageUrl,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      price: (json['price'] ?? 0).toDouble(),
      stockQuantity: json['stockQuantity'] ?? 0,
      categoryName: json['categoryName'] ?? '',
      imageUrl: json['imageUrl'],
    );
  }
}
