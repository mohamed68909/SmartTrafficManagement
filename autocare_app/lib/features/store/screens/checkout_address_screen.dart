// lib/features/store/screens/checkout_address_screen.dart
// Route: /store/checkout/address
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/providers/app_providers.dart';
import '../../../../core/widgets/shared_widgets.dart';
import '../../../../core/models/models.dart';
import 'checkout_payment_screen.dart';

class CheckoutAddressScreen extends ConsumerStatefulWidget {
  const CheckoutAddressScreen({super.key});

  @override
  ConsumerState<CheckoutAddressScreen> createState() =>
      _CheckoutAddressScreenState();
}

class _CheckoutAddressScreenState
    extends ConsumerState<CheckoutAddressScreen> {
  @override
  Widget build(BuildContext context) {
    final selectedId = ref.watch(selectedAddressProvider);
    final cartItems = ref.watch(cartProvider);
    final subtotal = cartItems.fold<double>(0, (s, i) => s + i.total);
    final displaySubtotal = subtotal > 0 ? subtotal : 850.0;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: buildAppBar(context, title: 'Delivery Address', showBack: true),
      body: Column(
        children: [
          // ── Stepper ─────────────────────────────────────────────────────
          buildCheckoutStepper(0),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Where should we deliver?',
                    style: TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Saved addresses
                  ...sampleAddresses.map((addr) =>
                      _AddressTile(
                        address: addr,
                        isSelected: addr.id == selectedId,
                        onTap: () => ref
                            .read(selectedAddressProvider.notifier)
                            .state = addr.id,
                      )),
                  const SizedBox(height: 8),
                  // Add new address
                  _AddNewAddressButton(),
                  const SizedBox(height: 28),
                  // Order mini summary
                  _OrderMiniSummary(
                    itemCount: cartItems.isEmpty ? 1 : cartItems.length,
                    subtotal: displaySubtotal,
                  ),
                ],
              ),
            ),
          ),
          // ── Bottom CTA ───────────────────────────────────────────────────
          _buildBottomBar(context, displaySubtotal),
        ],
      ),
    );
  }

  Widget _buildBottomBar(BuildContext context, double subtotal) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: Row(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Subtotal',
                  style: TextStyle(
                      color: AppColors.textSecondary, fontSize: 12)),
              const SizedBox(height: 2),
              Text(
                '${subtotal.toStringAsFixed(0)} EGP',
                style: const TextStyle(
                  color: AppColors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
          const SizedBox(width: 16),
          Expanded(
            child: AccentButton(
              label: 'Continue to Payment',
              icon: Icons.arrow_forward_rounded,
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (_) => const CheckoutPaymentScreen()),
              ),
              height: 50,
            ),
          ),
        ],
      ),
    );
  }
}

Widget buildCheckoutStepper(int activeStep) {
  const steps = ['Address', 'Payment', 'Confirm'];
  return Padding(
    padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
    child: Row(
      children: steps.asMap().entries.map((entry) {
        final i = entry.key;
        final label = entry.value;
        final isDone = i < activeStep;
        final isActive = i == activeStep;
        return Expanded(
          child: Row(
            children: [
              Expanded(
                child: Column(
                  children: [
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      height: 3,
                      decoration: BoxDecoration(
                        color: isDone || isActive
                            ? AppColors.accent
                            : AppColors.border,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      label,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: isActive
                            ? FontWeight.w700
                            : FontWeight.w400,
                        color: isActive || isDone
                            ? AppColors.accent
                            : AppColors.textMuted,
                      ),
                    ),
                  ],
                ),
              ),
              if (i < steps.length - 1) const SizedBox(width: 4),
            ],
          ),
        );
      }).toList(),
    ),
  );
}

class _AddressTile extends StatelessWidget {
  final DeliveryAddress address;
  final bool isSelected;
  final VoidCallback onTap;

  const _AddressTile({
    required this.address,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isSelected ? AppColors.accent : AppColors.border,
              width: isSelected ? 1.5 : 1,
            ),
          ),
          child: Row(
            children: [
              // Icon
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: isSelected
                      ? AppColors.accent.withValues(alpha:0.15)
                      : AppColors.surfaceVariant,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  address.label == 'Home'
                      ? Icons.home_rounded
                      : Icons.work_rounded,
                  color: isSelected
                      ? AppColors.accent
                      : AppColors.textSecondary,
                  size: 20,
                ),
              ),
              const SizedBox(width: 14),
              // Info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          address.label,
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: AppColors.white,
                          ),
                        ),
                        if (address.isDefault) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.accent.withValues(alpha:0.15),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text(
                              'Default',
                              style: TextStyle(
                                color: AppColors.accent,
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      address.address,
                      style: const TextStyle(
                          color: AppColors.textSecondary, fontSize: 12),
                    ),
                  ],
                ),
              ),
              // Radio
              AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: 22,
                height: 22,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isSelected ? AppColors.accent : Colors.transparent,
                  border: Border.all(
                    color: isSelected ? AppColors.accent : AppColors.border,
                    width: 2,
                  ),
                ),
                child: isSelected
                    ? const Icon(Icons.check_rounded,
                        color: AppColors.background, size: 13)
                    : null,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _AddNewAddressButton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {},
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: AppColors.accent.withValues(alpha:0.4),
            style: BorderStyle.solid,
          ),
        ),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.add_location_alt_rounded,
                color: AppColors.accent, size: 20),
            SizedBox(width: 8),
            Text(
              'Add New Address',
              style: TextStyle(
                color: AppColors.accent,
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OrderMiniSummary extends StatelessWidget {
  final int itemCount;
  final double subtotal;

  const _OrderMiniSummary(
      {required this.itemCount, required this.subtotal});

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Order Summary',
            style: TextStyle(
              color: AppColors.white,
              fontSize: 14,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '$itemCount ${itemCount == 1 ? 'item' : 'items'}',
                style: const TextStyle(
                    color: AppColors.textSecondary, fontSize: 13),
              ),
              Text(
                '${subtotal.toStringAsFixed(0)} EGP',
                style: const TextStyle(
                    color: AppColors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w600),
              ),
            ],
          ),
          const SizedBox(height: 6),
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Delivery fee',
                  style:
                      TextStyle(color: AppColors.textSecondary, fontSize: 13)),
              Text('50 EGP',
                  style: TextStyle(
                      color: AppColors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.w600)),
            ],
          ),
        ],
      ),
    );
  }
}
