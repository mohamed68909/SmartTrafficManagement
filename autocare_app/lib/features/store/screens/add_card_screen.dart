// lib/features/store/screens/add_card_screen.dart
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_stripe/flutter_stripe.dart' hide PaymentMethod, CardBrand;
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/shared_widgets.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_constants.dart';
import '../../../../core/providers/app_providers.dart';
import '../../../../core/models/models.dart';

class AddCardScreen extends ConsumerStatefulWidget {
  const AddCardScreen({super.key});

  @override
  ConsumerState<AddCardScreen> createState() => _AddCardScreenState();
}

class _AddCardScreenState extends ConsumerState<AddCardScreen> {
  CardFieldInputDetails? _cardDetails;
  bool _isProcessing = false;

  Future<void> _saveCard() async {
    if (_cardDetails == null || !_cardDetails!.complete) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppColors.error,
          content: const Text('Please enter valid card details'),
        ),
      );
      return;
    }

    setState(() => _isProcessing = true);

    try {
      // 1. Create Payment Method via Stripe SDK securely
      final paymentMethod = await Stripe.instance.createPaymentMethod(
        params: const PaymentMethodParams.card(
          paymentMethodData: PaymentMethodData(),
        ),
      );

      // 2. Send PaymentMethod ID to the backend to attach to customer
      final response = await ApiClient.post(
        ApiConstants.cardsUrl,
        {'paymentMethodId': paymentMethod.id},
      );

      if (!mounted) return;
      setState(() => _isProcessing = false);

      if (response.statusCode == 200 || response.statusCode == 201) {
        final json = jsonDecode(response.body);
        final data = json['data'];
        
        // Add to local state
        final newCard = PaymentMethod(
          id: data['paymentMethodId'],
          brand: _parseBrand(data['brand']),
          lastFour: data['last4'],
          expiryDate: '${data['expMonth'].toString().padLeft(2, '0')}/${data['expYear'].toString().substring(2)}',
          holderName: 'User',
        );
        ref.read(paymentMethodProvider.notifier).addCard(newCard);

        showSuccessDialog(
          context,
          title: 'Card Added Successfully! 💳',
          message: 'Your card has been securely saved to your wallet.',
          onDone: () {
            Navigator.of(context).pop(); // close dialog
            Navigator.of(context).pop(); // go back to manage cards
          },
        );
      } else {
        final json = jsonDecode(response.body);
        final errorMsg = json['error']?['message'] ?? 'Failed to save card';
        throw Exception(errorMsg);
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _isProcessing = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppColors.error,
          content: Text(e.toString().replaceAll('Exception: ', '')),
        ),
      );
    }
  }

  CardBrand _parseBrand(String? brand) {
    if (brand == null) return CardBrand.visa;
    brand = brand.toLowerCase();
    if (brand.contains('mastercard')) return CardBrand.mastercard;
    if (brand.contains('amex')) return CardBrand.amex;
    return CardBrand.visa;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: buildAppBar(context, title: 'Add New Card', showBack: true),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Premium Header
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.accent.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.credit_card_rounded, color: AppColors.accent, size: 28),
                  ),
                  const SizedBox(width: 16),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Secure Payment', style: TextStyle(color: AppColors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                        SizedBox(height: 4),
                        Text('Powered by Stripe', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            
            const Text('Card Information', style: TextStyle(color: AppColors.white, fontSize: 14, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            
            // Stripe Card Field
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: (!kIsWeb && (Platform.isAndroid || Platform.isIOS)) 
                ? CardField(
                    onCardChanged: (card) {
                      setState(() {
                        _cardDetails = card;
                      });
                    },
                    style: ThemeMode.system == ThemeMode.dark ? const TextStyle(color: Colors.white, fontSize: 16) : const TextStyle(color: Colors.black, fontSize: 16),
                    decoration: InputDecoration(
                      border: InputBorder.none,
                      hintStyle: TextStyle(color: AppColors.textSecondary.withOpacity(0.5)),
                    ),
                  )
                : const Padding(
                    padding: EdgeInsets.all(16.0),
                    child: Text(
                      'Card adding is only supported on mobile devices (Android/iOS). Please use your phone to add a card.',
                      style: TextStyle(color: AppColors.error, fontWeight: FontWeight.bold),
                      textAlign: TextAlign.center,
                    ),
                  ),
            ),
            
            const SizedBox(height: 32),
            
            // Secure Badge
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.success.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.success.withOpacity(0.3)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.verified_user_rounded, color: AppColors.success, size: 18),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Your payment info is safely encrypted and secured by Stripe. We do not store your raw card details.',
                      style: TextStyle(color: AppColors.success, fontSize: 11, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 40),
            AccentButton(
              label: 'Save Card',
              onTap: _saveCard,
              isLoading: _isProcessing,
              icon: Icons.save_rounded,
            ),
          ],
        ),
      ),
    );
  }
}
