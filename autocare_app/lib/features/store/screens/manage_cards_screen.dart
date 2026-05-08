// lib/features/checkout/screens/manage_cards_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/providers/app_providers.dart';
import '../../../../core/widgets/shared_widgets.dart';
import '../../../../core/models/models.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_constants.dart';
import 'add_card_screen.dart';

class ManageCardsScreen extends ConsumerWidget {
  const ManageCardsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cards = ref.watch(paymentMethodProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: buildAppBar(context, title: 'Payment Methods', showBack: true),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Saved Cards',
              style: TextStyle(
                color: AppColors.textSecondary,
                fontSize: 12,
                fontWeight: FontWeight.w500,
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 12),
            ...cards.map((card) => _CardTile(card: card)),
            const SizedBox(height: 8),
            // Add New Card Button (dashed border)
            GestureDetector(
              onTap: () => _showAddCardDialog(context, ref),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 18),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: AppColors.accent.withValues(alpha:0.5),
                    style: BorderStyle.solid,
                    width: 1.5,
                  ),
                ),
                child: Column(
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: AppColors.accent.withValues(alpha:0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.add_rounded,
                          color: AppColors.accent, size: 22),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      '+ Add New Card',
                      style: TextStyle(
                        color: AppColors.accent,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 2),
                    const Text(
                      'Visa, Mastercard, Amex accepted',
                      style: TextStyle(
                          color: AppColors.textMuted, fontSize: 11),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            // Stripe Security Note
            AppCard(
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.success.withValues(alpha:0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.verified_user_rounded,
                        color: AppColors.success, size: 18),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Secured by Stripe',
                          style: TextStyle(
                            color: AppColors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Your card details are encrypted and stored securely. We never store raw card numbers.',
                          style: TextStyle(
                              color: AppColors.textSecondary, fontSize: 11, height: 1.4),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddCardDialog(BuildContext context, WidgetRef ref) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const AddCardScreen()),
    );
  }
}

class _CardTile extends ConsumerWidget {
  final PaymentMethod card;

  const _CardTile({required this.card});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: AppCard(
        child: Row(
          children: [
            // Card brand icon
            Container(
              width: 52,
              height: 36,
              decoration: BoxDecoration(
                color: AppColors.surfaceVariant,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.border),
              ),
              child: Center(
                child: Text(
                  card.brand == CardBrand.visa
                      ? 'VISA'
                      : card.brand == CardBrand.mastercard
                          ? 'MC'
                          : 'AMEX',
                  style: TextStyle(
                    fontSize: card.brand == CardBrand.visa ? 12 : 13,
                    fontWeight: FontWeight.w900,
                    color: card.brand == CardBrand.visa
                        ? const Color(0xFF1A1F71)
                        : card.brand == CardBrand.mastercard
                            ? const Color(0xFFEB001B)
                            : const Color(0xFF2E77BC),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${card.brandName} •••• ${card.lastFour}',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.white,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    'Expires ${card.expiryDate}  ·  ${card.holderName}',
                    style: const TextStyle(
                        color: AppColors.textSecondary, fontSize: 11),
                  ),
                ],
              ),
            ),
            TextButton(
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    backgroundColor: AppColors.surface,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16)),
                    title: const Text(
                      'Remove Card',
                      style: TextStyle(color: AppColors.white),
                    ),
                    content: Text(
                      'Remove ${card.brandName} ending in ${card.lastFour}?',
                      style:
                          const TextStyle(color: AppColors.textSecondary),
                    ),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(ctx),
                        child: const Text('Cancel',
                            style: TextStyle(color: AppColors.textSecondary)),
                      ),
                      TextButton(
                        onPressed: () async {
                          try {
                            await ApiClient.delete(ApiConstants.deleteCardUrl(card.id));
                            ref
                                .read(paymentMethodProvider.notifier)
                                .removeCard(card.id);
                          } catch (e) {
                            debugPrint('Failed to delete card: $e');
                          }
                          if (ctx.mounted) Navigator.pop(ctx);
                        },
                        child: const Text('Remove',
                            style: TextStyle(
                                color: AppColors.error,
                                fontWeight: FontWeight.w700)),
                      ),
                    ],
                  ),
                );
              },
              child: const Text(
                'Remove',
                style: TextStyle(
                  color: AppColors.error,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
