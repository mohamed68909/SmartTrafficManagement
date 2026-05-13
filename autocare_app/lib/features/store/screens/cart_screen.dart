// lib/features/store/screens/cart_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/providers/app_providers.dart';
import '../../../../core/widgets/shared_widgets.dart';
import 'checkout_address_screen.dart';

class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartItems = ref.watch(cartProvider);
    final notifier = ref.read(cartProvider.notifier);
    final subtotal = notifier.subtotal;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: buildAppBar(
        context,
        title: 'Cart  (${cartItems.length})',
        showBack: true,
        actions: cartItems.isNotEmpty
            ? [
                TextButton(
                  onPressed: () => ref.read(cartProvider.notifier).clear(),
                  child: const Text('Clear',
                      style: TextStyle(
                          color: AppColors.error, fontWeight: FontWeight.w600)),
                ),
              ]
            : null,
      ),
      body: cartItems.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.shopping_cart_outlined,
                      color: AppColors.textMuted, size: 64),
                  const SizedBox(height: 16),
                  const Text('Your cart is empty',
                      style: TextStyle(
                          color: AppColors.textSecondary, fontSize: 16)),
                  const SizedBox(height: 8),
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Continue Shopping',
                        style: TextStyle(color: AppColors.accent)),
                  ),
                ],
              ),
            )
          : Column(
              children: [
                Expanded(
                  child: ListView.separated(
                    padding: const EdgeInsets.all(20),
                    itemCount: cartItems.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final item = cartItems[index];
                      return AppCard(
                        child: Row(
                          children: [
                            Container(
                              width: 56,
                              height: 56,
                              decoration: BoxDecoration(
                                color: AppColors.surfaceVariant,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Icon(Icons.inventory_2_rounded,
                                  color: AppColors.accent, size: 26),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(item.product.name,
                                      style: const TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.white,
                                      )),
                                  const SizedBox(height: 3),
                                  Text(item.product.brand,
                                      style: const TextStyle(
                                          color: AppColors.textMuted,
                                          fontSize: 11)),
                                  const SizedBox(height: 6),
                                  Text(
                                    '${item.product.price.toStringAsFixed(0)} EGP × ${item.quantity}',
                                    style: const TextStyle(
                                      color: AppColors.accent,
                                      fontSize: 13,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Column(
                              children: [
                                Row(
                                  children: [
                                    _QtyButton(
                                      icon: Icons.remove_rounded,
                                      onTap: () => ref
                                          .read(cartProvider.notifier)
                                          .updateQuantity(item.cartItemId!, item.quantity - 1),
                                    ),
                                    Padding(
                                      padding: const EdgeInsets.symmetric(horizontal: 10),
                                      child: Text('${item.quantity}',
                                          style: const TextStyle(
                                            color: AppColors.white,
                                            fontSize: 15,
                                            fontWeight: FontWeight.w700,
                                          )),
                                    ),
                                    _QtyButton(
                                      icon: Icons.add_rounded,
                                      onTap: () => ref
                                          .read(cartProvider.notifier)
                                          .updateQuantity(item.cartItemId!, item.quantity + 1),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  '${item.total.toStringAsFixed(0)} EGP',
                                  style: const TextStyle(
                                    color: AppColors.white,
                                    fontSize: 14,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
                Container(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
                  decoration: const BoxDecoration(
                    color: AppColors.surface,
                    border: Border(top: BorderSide(color: AppColors.border)),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Subtotal',
                              style: TextStyle(
                                  color: AppColors.textSecondary, fontSize: 13)),
                          Text(
                            '${subtotal.toStringAsFixed(0)} EGP',
                            style: const TextStyle(
                              color: AppColors.white,
                              fontSize: 20,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      AccentButton(
                        label: 'Proceed to Checkout',
                        icon: Icons.arrow_forward_rounded,
                        onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => const CheckoutAddressScreen()),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}

class _QtyButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;

  const _QtyButton({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 28,
        height: 28,
        decoration: BoxDecoration(
          color: AppColors.surfaceVariant,
          borderRadius: BorderRadius.circular(7),
          border: Border.all(color: AppColors.border),
        ),
        child: Icon(icon, color: AppColors.accent, size: 16),
      ),
    );
  }
}


