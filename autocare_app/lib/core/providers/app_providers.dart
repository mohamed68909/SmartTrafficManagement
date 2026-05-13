// lib/core/providers/app_providers.dart
import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/models.dart';
import '../models/vehicle_model.dart';
import '../services/store_service.dart';
import '../services/garage_service.dart';
import '../services/auth_service.dart';
import '../services/order_service.dart';
import '../services/emergency_service.dart';
import '../services/cart_service.dart';
import '../services/notification_service.dart';
import '../network/api_client.dart';
import '../network/api_constants.dart';

// ─── Products Provider (API) ──────────────────────────────────────────────────
final productsFutureProvider = FutureProvider<List<Product>>((ref) async {
  return await StoreService.getProducts();
});

final categoriesFutureProvider = FutureProvider<List<dynamic>>((ref) async {
  return await StoreService.getCategories();
});

// ─── Vehicles Provider (API) ──────────────────────────────────────────────────
final vehiclesProvider = StateProvider<List<Vehicle>>((ref) => []);

final vehiclesFutureProvider = FutureProvider<List<Vehicle>>((ref) async {
  final vehicles = await GarageService.getVehicles();
  ref.read(vehiclesProvider.notifier).state = vehicles;
  return vehicles;
});

// ─── Profile Provider (API) ───────────────────────────────────────────────────
final profileFutureProvider = FutureProvider<Map<String, dynamic>?>((ref) async {
  final response = await AuthService.getProfile();
  return response?['data'];
});

// Moved below ordersProvider

// ─── SOS History Provider (API) ──────────────────────────────────────────────
final sosHistoryFutureProvider = FutureProvider<List<dynamic>>((ref) async {
  return await EmergencyService.getSosHistory();
});

// ─── Notifications Provider (API) ────────────────────────────────────────────
final notificationsFutureProvider = FutureProvider<List<dynamic>>((ref) async {
  return await NotificationService.getNotifications();
});

final sampleAppointment = ServiceAppointment(
  id: 'APT-001',
  serviceName: 'Tire Installation',
  dateTime: DateTime.now().add(const Duration(days: 3, hours: 10)),
  estimatedCost: 850,
  location: 'AutoCare Center, Heliopolis',
  isUpcoming: true,
);

final sampleAddresses = <DeliveryAddress>[];
final samplePaymentMethods = <PaymentMethod>[];

// ─── Cart Provider ────────────────────────────────────────────────────────────
class CartNotifier extends StateNotifier<List<CartItem>> {
  CartNotifier() : super([]) {
    loadCart();
  }

  Future<void> loadCart() async {
    try {
      final cartData = await CartService.getCart();
      if (cartData != null && cartData['items'] != null) {
        final List<dynamic> itemsJson = cartData['items'];
        state = itemsJson.map((item) {
          // Create a minimal Product object from CartItemDto
          final product = Product(
            id: item['productId'] ?? '',
            name: item['productName'] ?? 'Unknown',
            brand: item['productBrand'] ?? 'AutoCare',
            category: item['productCategory'] ?? 'Store',
            price: (item['unitPrice'] ?? 0).toDouble(),
            imageUrl: item['productImageUrl'] ?? '',
          );
          return CartItem(
            cartItemId: item['id'],
            product: product,
            quantity: item['quantity'] ?? 1,
          );
        }).toList();
      }
    } catch (e) {
      // Keep existing state or clear if error
    }
  }

  Future<void> addItem(Product product, {int quantity = 1}) async {
    final result = await CartService.addItem(product.id, quantity);
    if (result['success']) {
      // Refresh to get the correct cartItemIds and sync with backend
      await loadCart();
    }
  }

  Future<void> removeItem(String cartItemId) async {
    final result = await CartService.removeItem(cartItemId);
    if (result['success']) {
      state = state.where((item) => item.cartItemId != cartItemId).toList();
    }
  }

  Future<void> updateQuantity(String cartItemId, int quantity) async {
    if (quantity <= 0) {
      await removeItem(cartItemId);
      return;
    }
    final result = await CartService.updateQuantity(cartItemId, quantity);
    if (result['success']) {
      state = [
        for (final item in state)
          if (item.cartItemId == cartItemId)
            CartItem(
                cartItemId: item.cartItemId,
                product: item.product,
                quantity: quantity)
          else
            item,
      ];
    }
  }

  void clear() => state = [];

  double get subtotal => state.fold(0, (sum, item) => sum + item.total);
}

final cartProvider =
    StateNotifierProvider<CartNotifier, List<CartItem>>((ref) => CartNotifier());

final cartSubtotalProvider = Provider<double>((ref) {
  final cart = ref.watch(cartProvider);
  return cart.fold(0, (sum, item) => sum + item.total);
});

// ─── Payment Method Provider ──────────────────────────────────────────────────
class PaymentMethodNotifier extends StateNotifier<List<PaymentMethod>> {
  PaymentMethodNotifier() : super([]) {
    _loadFromBackend();
  }

  Future<void> _loadFromBackend() async {
    try {
      final response = await ApiClient.get(ApiConstants.cardsUrl);
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final List<dynamic> cards = body['data'] ?? [];
        state = cards.map<PaymentMethod>((c) {
          final brand = (c['brand'] ?? '').toString().toLowerCase();
          return PaymentMethod(
            id: c['paymentMethodId']?.toString() ?? '',
            brand: brand.contains('mastercard')
                ? CardBrand.mastercard
                : brand.contains('amex')
                    ? CardBrand.amex
                    : CardBrand.visa,
            lastFour: c['last4']?.toString() ?? '••••',
            expiryDate:
                '${(c['expMonth'] ?? 0).toString().padLeft(2, '0')}/${(c['expYear'] ?? 0).toString().substring(2)}',
            holderName: 'Card',
          );
        }).toList();
      }
    } catch (_) {
      // keep empty on error
    }
  }

  void removeCard(String id) {
    state = state.where((pm) => pm.id != id).toList();
  }

  void addCard(PaymentMethod method) {
    state = [...state, method];
  }
}

final paymentMethodProvider =
    StateNotifierProvider<PaymentMethodNotifier, List<PaymentMethod>>(
        (ref) => PaymentMethodNotifier());

// ─── Selected Payment Provider ────────────────────────────────────────────────
final selectedPaymentProvider = StateProvider<String>((ref) => 'card');

// ─── Orders Provider ──────────────────────────────────────────────────────────
class OrdersNotifier extends StateNotifier<List<Order>> {
  OrdersNotifier() : super([]);

  void addOrder(Order order) {
    state = [order, ...state];
  }

  void updateFromApi(List<Order> orders) {
    state = orders;
  }
}

final ordersProvider =
    StateNotifierProvider<OrdersNotifier, List<Order>>(
        (ref) => OrdersNotifier());

// ─── Orders Provider (API) ────────────────────────────────────────────────────
final ordersFutureProvider = FutureProvider<List<Order>>((ref) async {
  final orders = await OrderService.getMyOrders();
  // Update the ordersNotifier state as well
  ref.read(ordersProvider.notifier).updateFromApi(orders);
  return orders;
});

// ─── Fuel Delivery Provider ───────────────────────────────────────────────────
class FuelDeliveryState {
  final double liters;
  final int fuelType; // 92 or 95
  static const double deliveryFee = 50;

  const FuelDeliveryState({
    this.liters = 15,
    this.fuelType = 95,
  });

  double get pricePerLiter => fuelType == 92 ? 14.5 : 15.75;
  double get fuelCost => liters * pricePerLiter;
  double get totalCost => fuelCost + deliveryFee;

  FuelDeliveryState copyWith({double? liters, int? fuelType}) {
    return FuelDeliveryState(
      liters: liters ?? this.liters,
      fuelType: fuelType ?? this.fuelType,
    );
  }
}

class FuelDeliveryNotifier extends StateNotifier<FuelDeliveryState> {
  FuelDeliveryNotifier() : super(const FuelDeliveryState());

  void setLiters(double liters) => state = state.copyWith(liters: liters);
  void setFuelType(int type) => state = state.copyWith(fuelType: type);
}

final fuelDeliveryProvider =
    StateNotifierProvider<FuelDeliveryNotifier, FuelDeliveryState>(
        (ref) => FuelDeliveryNotifier());

// ─── History Filter Provider ──────────────────────────────────────────────────
final historyFilterProvider = StateProvider<String>((ref) => 'All');

// ─── Selected Address Provider ────────────────────────────────────────────────
final selectedAddressProvider = StateProvider<String?>((ref) => 'ADDR-1');

// ─── Maintenance Selection Provider ──────────────────────────────────────────
class MaintenanceSelectionNotifier extends StateNotifier<Set<String>> {
  MaintenanceSelectionNotifier() : super({});

  void toggle(String id) {
    if (state.contains(id)) {
      state = {...state}..remove(id);
    } else {
      state = {...state, id};
    }
  }

  void select(String id) {
    state = {id};
  }

  void clear() {
    state = {};
  }

  void clearAll() => clear();

  bool isSelected(String id) => state.contains(id);
}

final maintenanceSelectionProvider =
    StateNotifierProvider<MaintenanceSelectionNotifier, Set<String>>(
        (ref) => MaintenanceSelectionNotifier());

// ─── Selected Date Provider ───────────────────────────────────────────────────
final selectedDateProvider = StateProvider<DateTime>((ref) => DateTime.now().add(const Duration(days: 1)));

// ─── Selected Time Provider ───────────────────────────────────────────────────
final selectedTimeProvider = StateProvider<String>((ref) => '10:00 AM');

// ─── Nav Index Provider ───────────────────────────────────────────────────────
final navIndexProvider = StateProvider<int>((ref) => 0);

// ─── Mic/Video Toggle (Mechanic Screen) ──────────────────────────────────────
final micEnabledProvider = StateProvider<bool>((ref) => true);
final videoEnabledProvider = StateProvider<bool>((ref) => true);

// ─── Emergency Service Type (0=Fuel, 1=Tire Change, 2=Tow Truck) ─────────────
final emergencyServiceTypeProvider = StateProvider<int>((ref) => 0);

// ─── Tire Change State ────────────────────────────────────────────────────────
class TireChangeState {
  final String tirePosition; // 'front_left','front_right','rear_left','rear_right','all'
  final bool hasSpareTire;
  static const double serviceFee = 150.0;
  static const double spareTireFee = 350.0;

  const TireChangeState({
    this.tirePosition = 'front_left',
    this.hasSpareTire = true,
  });

  double get totalCost => serviceFee + (hasSpareTire ? 0 : spareTireFee);

  TireChangeState copyWith({String? tirePosition, bool? hasSpareTire}) =>
      TireChangeState(
        tirePosition: tirePosition ?? this.tirePosition,
        hasSpareTire: hasSpareTire ?? this.hasSpareTire,
      );
}

class TireChangeNotifier extends StateNotifier<TireChangeState> {
  TireChangeNotifier() : super(const TireChangeState());
  void setPosition(String pos) => state = state.copyWith(tirePosition: pos);
  void setHasSpare(bool val) => state = state.copyWith(hasSpareTire: val);
}

final tireChangeProvider =
    StateNotifierProvider<TireChangeNotifier, TireChangeState>(
        (ref) => TireChangeNotifier());

// ─── Tow Truck State ─────────────────────────────────────────────────────────
class TowTruckState {
  final String destination;
  final double distanceKm;
  static const double baseFee = 200.0;
  static const double perKmFee = 8.0;

  const TowTruckState({
    this.destination = 'Nearest AutoCare Center',
    this.distanceKm = 5.0,
  });

  double get totalCost => baseFee + (distanceKm * perKmFee);

  TowTruckState copyWith({String? destination, double? distanceKm}) =>
      TowTruckState(
        destination: destination ?? this.destination,
        distanceKm: distanceKm ?? this.distanceKm,
      );
}

class TowTruckNotifier extends StateNotifier<TowTruckState> {
  TowTruckNotifier() : super(const TowTruckState());
  void setDestination(String d) => state = state.copyWith(destination: d);
  void setDistance(double km) => state = state.copyWith(distanceKm: km);
}

final towTruckProvider =
    StateNotifierProvider<TowTruckNotifier, TowTruckState>(
        (ref) => TowTruckNotifier());
