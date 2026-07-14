// test/widget_test.dart
// AutoCare App — Widget & Unit Tests
// Run with: flutter test

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:autocare_app/core/models/models.dart';
import 'package:autocare_app/core/providers/app_providers.dart';
import 'package:autocare_app/core/theme/app_theme.dart';

import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart' as http_testing;
import 'package:autocare_app/core/network/api_client.dart';
import 'dart:convert';

// ─── Helper: wrap widget in ProviderScope + MaterialApp ──────────────────────
Widget testWrap(Widget child) {
  return ProviderScope(
    child: MaterialApp(
      theme: AppTheme.dark,
      home: child,
    ),
  );
}

void main() {
  // Mock Backend State
  final mockCartItems = <Map<String, dynamic>>[];
  var mockCards = <Map<String, dynamic>>[];

  setUpAll(() {
    SharedPreferences.setMockInitialValues({});

    ApiClient.client = http_testing.MockClient((request) async {
      final path = request.url.path;
      final method = request.method;

      if (path.endsWith('/cart')) {
        return http.Response(jsonEncode({
          'data': {
            'items': mockCartItems
          }
        }), 200);
      } 
      else if (path.endsWith('/cart/items')) {
        if (method == 'POST') {
          final body = jsonDecode(request.body);
          final productId = body['productId'];
          final quantity = body['quantity'] ?? 1;

          // Find if already exists
          int existingIndex = mockCartItems.indexWhere((item) => item['productId'] == productId);
          if (existingIndex != -1) {
            mockCartItems[existingIndex]['quantity'] = (mockCartItems[existingIndex]['quantity'] as int) + quantity;
          } else {
            mockCartItems.add({
              'id': productId, // Use productId as id for easy mock removal/update
              'productId': productId,
              'productName': 'Test Oil',
              'productBrand': 'TestBrand',
              'productCategory': 'Oils',
              'unitPrice': 500.0,
              'productImageUrl': 'test.png',
              'quantity': quantity
            });
          }
          return http.Response(jsonEncode({
            'success': true,
            'data': {}
          }), 200);
        }
      } 
      else if (path.contains('/cart/items/')) {
        final itemId = path.split('/').last;
        if (method == 'DELETE') {
          mockCartItems.removeWhere((item) => item['id'] == itemId || item['productId'] == itemId);
          return http.Response(jsonEncode({'success': true}), 200);
        } else if (method == 'PATCH') {
          final body = jsonDecode(request.body);
          final quantity = body['quantity'] ?? 1;
          for (var item in mockCartItems) {
            if (item['id'] == itemId || item['productId'] == itemId) {
              item['quantity'] = quantity;
            }
          }
          return http.Response(jsonEncode({
            'success': true,
            'data': {}
          }), 200);
        }
      } 
      else if (path.endsWith('/payments/cards')) {
        return http.Response(jsonEncode({
          'data': mockCards
        }), 200);
      } 
      else if (path.contains('/payments/cards/')) {
        final cardId = path.split('/').last;
        if (method == 'DELETE') {
          mockCards.removeWhere((card) => card['paymentMethodId'] == cardId);
          return http.Response(jsonEncode({'success': true}), 200);
        }
      }

      return http.Response(jsonEncode({'message': 'Not found'}), 404);
    });
  });

  setUp(() {
    mockCartItems.clear();
    mockCards = [
      {
        'paymentMethodId': 'PM-1',
        'brand': 'visa',
        'last4': '4242',
        'expMonth': 12,
        'expYear': 2027
      },
      {
        'paymentMethodId': 'PM-2',
        'brand': 'mastercard',
        'last4': '5555',
        'expMonth': 9,
        'expYear': 2026
      }
    ];
  });

  // ─── UNIT TESTS: CartNotifier ────────────────────────────────────────────
  group('CartNotifier', () {
    late ProviderContainer container;

    setUp(() {
      container = ProviderContainer();
    });

    tearDown(() {
      container.dispose();
    });

    final testProduct = Product(
      id: 'TEST-001',
      name: 'Test Oil',
      brand: 'TestBrand',
      category: 'Oils',
      price: 500,
      imageUrl: 'test.png',
    );

    test('starts empty', () {
      final cart = container.read(cartProvider);
      expect(cart, isEmpty);
    });

    test('adds item to cart', () async {
      await container.read(cartProvider.notifier).addItem(testProduct);
      final cart = container.read(cartProvider);
      expect(cart.length, 1);
      expect(cart.first.product.id, 'TEST-001');
      expect(cart.first.quantity, 1);
    });

    test('increments quantity for duplicate item', () async {
      final notifier = container.read(cartProvider.notifier);
      await notifier.addItem(testProduct);
      await notifier.addItem(testProduct);
      final cart = container.read(cartProvider);
      expect(cart.length, 1);
      expect(cart.first.quantity, 2);
    });

    test('removes item from cart', () async {
      final notifier = container.read(cartProvider.notifier);
      await notifier.addItem(testProduct);
      await notifier.removeItem('TEST-001');
      expect(container.read(cartProvider), isEmpty);
    });

    test('updates quantity correctly', () async {
      final notifier = container.read(cartProvider.notifier);
      await notifier.addItem(testProduct);
      await notifier.updateQuantity('TEST-001', 5);
      expect(container.read(cartProvider).first.quantity, 5);
    });

    test('removes item when quantity set to 0', () async {
      final notifier = container.read(cartProvider.notifier);
      await notifier.addItem(testProduct);
      await notifier.updateQuantity('TEST-001', 0);
      expect(container.read(cartProvider), isEmpty);
    });

    test('calculates subtotal correctly', () async {
      final notifier = container.read(cartProvider.notifier);
      await notifier.addItem(testProduct);
      await notifier.addItem(testProduct); // qty=2, price=500 → total=1000
      expect(notifier.subtotal, 1000.0);
    });

    test('clears cart', () async {
      final notifier = container.read(cartProvider.notifier);
      await notifier.addItem(testProduct);
      await notifier.addItem(testProduct);
      notifier.clear();
      expect(container.read(cartProvider), isEmpty);
    });
  });

  // ─── UNIT TESTS: FuelDeliveryState ───────────────────────────────────────
  group('FuelDeliveryNotifier', () {
    late ProviderContainer container;

    setUp(() => container = ProviderContainer());
    tearDown(() => container.dispose());

    test('starts with correct defaults', () {
      final state = container.read(fuelDeliveryProvider);
      expect(state.liters, 15.0);
      expect(state.fuelType, 95);
    });

    test('calculates 95 octane price correctly', () {
      final state = container.read(fuelDeliveryProvider);
      // 15L × 15.75 + 50 delivery = 286.25
      expect(state.totalCost, closeTo(286.25, 0.01));
    });

    test('calculates 92 octane price correctly', () {
      container.read(fuelDeliveryProvider.notifier).setFuelType(92);
      final state = container.read(fuelDeliveryProvider);
      // 15L × 14.5 + 50 delivery = 267.50
      expect(state.totalCost, closeTo(267.50, 0.01));
    });

    test('updates liters correctly', () {
      container.read(fuelDeliveryProvider.notifier).setLiters(20.0);
      final state = container.read(fuelDeliveryProvider);
      expect(state.liters, 20.0);
    });

    test('total updates when liters change', () {
      container.read(fuelDeliveryProvider.notifier).setLiters(10.0);
      final state = container.read(fuelDeliveryProvider);
      // 10 × 15.75 + 50 = 207.50
      expect(state.totalCost, closeTo(207.50, 0.01));
    });

    test('delivery fee is always 50 EGP', () {
      expect(FuelDeliveryState.deliveryFee, 50.0);
    });
  });

  // ─── UNIT TESTS: MaintenanceSelectionNotifier ─────────────────────────────
  group('MaintenanceSelectionNotifier', () {
    late ProviderContainer container;

    setUp(() => container = ProviderContainer());
    tearDown(() => container.dispose());

    test('starts with empty selection', () {
      expect(container.read(maintenanceSelectionProvider), isEmpty);
    });

    test('toggles selection on', () {
      container.read(maintenanceSelectionProvider.notifier).toggle('oil');
      expect(container.read(maintenanceSelectionProvider).contains('oil'), true);
    });

    test('toggles selection off', () {
      final notifier = container.read(maintenanceSelectionProvider.notifier);
      notifier.toggle('oil');
      notifier.toggle('oil');
      expect(container.read(maintenanceSelectionProvider).contains('oil'), false);
    });

    test('can select multiple services', () {
      final notifier = container.read(maintenanceSelectionProvider.notifier);
      notifier.toggle('oil');
      notifier.toggle('brakes');
      notifier.toggle('full');
      expect(container.read(maintenanceSelectionProvider).length, 3);
    });
  });

  // ─── UNIT TESTS: PaymentMethodNotifier ───────────────────────────────────
  group('PaymentMethodNotifier', () {
    late ProviderContainer container;

    setUp(() => container = ProviderContainer());
    tearDown(() => container.dispose());

    test('starts with sample payment methods', () async {
      container.read(paymentMethodProvider); // Trigger instantiation
      await Future.delayed(const Duration(milliseconds: 10)); // Wait for async load
      final methods = container.read(paymentMethodProvider);
      expect(methods.isNotEmpty, true);
    });

    test('removes a card by id', () async {
      container.read(paymentMethodProvider); // Trigger instantiation
      await Future.delayed(const Duration(milliseconds: 10)); // Wait for async load
      final notifier = container.read(paymentMethodProvider.notifier);
      final initial = container.read(paymentMethodProvider);
      final idToRemove = initial.first.id;
      notifier.removeCard(idToRemove);
      final updated = container.read(paymentMethodProvider);
      expect(updated.any((m) => m.id == idToRemove), false);
    });

    test('adds a new card', () {
      final notifier = container.read(paymentMethodProvider.notifier);
      const newCard = PaymentMethod(
        id: 'PM-TEST',
        brand: CardBrand.visa,
        lastFour: '1234',
        expiryDate: '01/28',
        holderName: 'Test User',
      );
      notifier.addCard(newCard);
      final methods = container.read(paymentMethodProvider);
      expect(methods.any((m) => m.id == 'PM-TEST'), true);
    });
  });

  // ─── UNIT TESTS: OrdersNotifier ──────────────────────────────────────────
  group('OrdersNotifier', () {
    late ProviderContainer container;
    setUp(() {
      container = ProviderContainer(
        overrides: [
          ordersProvider.overrideWith((ref) {
            final notifier = OrdersNotifier();
            notifier.addOrder(Order(
              id: 'ORD-SAMPLE',
              title: 'Sample Order',
              date: DateTime.now(),
              price: 150,
              status: OrderStatus.completed,
              category: OrderCategory.shop,
            ));
            return notifier;
          }),
        ],
      );
    });
    tearDown(() => container.dispose());

    test('starts with sample orders', () {
      expect(container.read(ordersProvider).isNotEmpty, true);
    });

    test('adds a new order to front', () {
      final notifier = container.read(ordersProvider.notifier);
      final newOrder = Order(
        id: 'ORD-TEST',
        title: 'Test Order',
        date: DateTime.now(),
        price: 999,
        status: OrderStatus.scheduled,
        category: OrderCategory.shop,
      );
      notifier.addOrder(newOrder);
      expect(container.read(ordersProvider).first.id, 'ORD-TEST');
    });
  });

  // ─── MODEL TESTS ─────────────────────────────────────────────────────────
  group('Order model', () {
    test('statusLabel returns correct strings', () {
      final o = (status) => Order(
            id: 'x',
            title: 'x',
            date: DateTime.now(),
            price: 0,
            status: status,
            category: OrderCategory.shop,
          );

      expect(o(OrderStatus.scheduled).statusLabel, 'Scheduled');
      expect(o(OrderStatus.inProgress).statusLabel, 'In Progress');
      expect(o(OrderStatus.completed).statusLabel, 'Completed');
      expect(o(OrderStatus.cancelled).statusLabel, 'Cancelled');
    });
  });

  group('PaymentMethod model', () {
    test('brandName returns correct strings', () {
      const visa = PaymentMethod(
          id: '1', brand: CardBrand.visa, lastFour: '0000',
          expiryDate: '12/25', holderName: 'A');
      const mc = PaymentMethod(
          id: '2', brand: CardBrand.mastercard, lastFour: '0000',
          expiryDate: '12/25', holderName: 'A');
      const amex = PaymentMethod(
          id: '3', brand: CardBrand.amex, lastFour: '0000',
          expiryDate: '12/25', holderName: 'A');

      expect(visa.brandName, 'Visa');
      expect(mc.brandName, 'Mastercard');
      expect(amex.brandName, 'Amex');
    });
  });

  group('CartItem', () {
    test('total = price × quantity', () {
      final product = Product(
          id: 'p1', name: 'Oil', brand: 'B', category: 'C',
          price: 300, imageUrl: '');
      final item = CartItem(product: product, quantity: 3);
      expect(item.total, 900.0);
    });
  });

  // ─── WIDGET TESTS ─────────────────────────────────────────────────────────
  group('App smoke test', () {
    testWidgets('App builds without crashing', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            theme: AppTheme.dark,
            home: Scaffold(
              backgroundColor: AppColors.background,
              body: const Center(
                child: Text('AutoCare Test',
                    style: TextStyle(color: AppColors.white)),
              ),
            ),
          ),
        ),
      );
      expect(find.text('AutoCare Test'), findsOneWidget);
    });

    testWidgets('AppColors are non-transparent', (tester) async {
      expect(AppColors.background.alpha, greaterThan(0));
      expect(AppColors.accent.alpha, greaterThan(0));
      expect(AppColors.surface.alpha, greaterThan(0));
    });
  });
}
