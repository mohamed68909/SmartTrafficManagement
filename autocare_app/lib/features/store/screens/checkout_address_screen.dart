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
                  _AddNewAddressButton(
                    onAddressAdded: (label, address) {
                      // In a real app, persist to backend
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          backgroundColor: AppColors.success,
                          behavior: SnackBarBehavior.floating,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          content: Row(
                            children: [
                              const Icon(Icons.check_circle, color: Colors.white, size: 16),
                              const SizedBox(width: 8),
                              Text('"$label" address saved!', style: const TextStyle(color: Colors.white)),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
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
  final void Function(String label, String address)? onAddressAdded;

  const _AddNewAddressButton({this.onAddressAdded});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => _showAddAddressDialog(context),
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

  void _showAddAddressDialog(BuildContext context) {
    final labelCtrl = TextEditingController();
    final addressCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Add New Address', style: TextStyle(color: AppColors.white, fontSize: 16, fontWeight: FontWeight.w700)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: labelCtrl,
              style: const TextStyle(color: AppColors.white),
              decoration: const InputDecoration(
                hintText: 'Label (e.g. Home, Work)',
                hintStyle: TextStyle(color: AppColors.textMuted),
                prefixIcon: Icon(Icons.label_outlined, color: AppColors.accent, size: 18),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: addressCtrl,
              style: const TextStyle(color: AppColors.white),
              decoration: const InputDecoration(
                hintText: 'Full address',
                hintStyle: TextStyle(color: AppColors.textMuted),
                prefixIcon: Icon(Icons.location_on_outlined, color: AppColors.accent, size: 18),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.accent,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () {
              if (labelCtrl.text.trim().isNotEmpty && addressCtrl.text.trim().isNotEmpty) {
                Navigator.pop(ctx);
                onAddressAdded?.call(labelCtrl.text.trim(), addressCtrl.text.trim());
              }
            },
            child: const Text('Save', style: TextStyle(color: AppColors.background, fontWeight: FontWeight.w700)),
          ),
        ],
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



