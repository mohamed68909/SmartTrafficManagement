// lib/features/store/screens/add_card_screen.dart
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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
  bool _isProcessing = false;

  // Controllers for custom card fields
  final _cardNumberController = TextEditingController();
  final _holderNameController = TextEditingController();
  final _expiryController = TextEditingController();
  final _cvvController = TextEditingController();

  // Focus nodes
  final _cardNumberFocus = FocusNode();
  final _holderNameFocus = FocusNode();
  final _expiryFocus = FocusNode();
  final _cvvFocus = FocusNode();

  bool get _areFieldsValid {
    final cardNum = _cardNumberController.text.replaceAll(' ', '');
    final holderName = _holderNameController.text.trim();
    final expiry = _expiryController.text;
    final cvv = _cvvController.text;
    return cardNum.length >= 15 &&
        holderName.isNotEmpty &&
        expiry.length == 5 &&
        (cvv.length == 3 || cvv.length == 4);
  }

  @override
  void dispose() {
    _cardNumberController.dispose();
    _holderNameController.dispose();
    _expiryController.dispose();
    _cvvController.dispose();
    _cardNumberFocus.dispose();
    _holderNameFocus.dispose();
    _expiryFocus.dispose();
    _cvvFocus.dispose();
    super.dispose();
  }

  Future<void> _saveCard() async {
    // Validate custom fields
    if (!_areFieldsValid) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: AppColors.error,
          content: Text('Please enter valid card details'),
        ),
      );
      return;
    }



    setState(() => _isProcessing = true);

    try {
      String paymentMethodId = '';
      
      if (kIsWeb || (!Platform.isAndroid && !Platform.isIOS)) {
        // Mock Stripe for Desktop
        await Future.delayed(const Duration(seconds: 1));
        paymentMethodId = 'pm_mock_${DateTime.now().millisecondsSinceEpoch}';
      } else {
        // 1. Feed custom field data to Stripe SDK
        final expiry = _expiryController.text.split('/');
        final expMonth = int.tryParse(expiry[0]) ?? 1;
        final expYear = int.tryParse('20${expiry.length > 1 ? expiry[1] : "25"}') ?? 2025;
        
        await Stripe.instance.dangerouslyUpdateCardDetails(
          CardDetails(
            number: _cardNumberController.text.replaceAll(' ', ''),
            expirationMonth: expMonth,
            expirationYear: expYear,
            cvc: _cvvController.text,
          ),
        );

        // 2. Create Payment Method via Stripe SDK securely
        final paymentMethod = await Stripe.instance.createPaymentMethod(
          params: const PaymentMethodParams.card(
            paymentMethodData: PaymentMethodData(),
          ),
        );
        paymentMethodId = paymentMethod.id;
      }

      // 2. Send PaymentMethod ID to the backend to attach to customer
      final response = await ApiClient.post(
        ApiConstants.cardsUrl,
        {'paymentMethodId': paymentMethodId},
      );

      if (!mounted) return;
      setState(() => _isProcessing = false);

      if (response.statusCode == 200 || response.statusCode == 201) {
        final json = jsonDecode(response.body);
        final data = json['data'];
        
        // Add to local state
        final cardNum = _cardNumberController.text.replaceAll(' ', '');
        final newCard = PaymentMethod(
          id: data['paymentMethodId'],
          brand: _parseBrand(data['brand']),
          lastFour: data['last4'] ?? cardNum.substring(cardNum.length - 4),
          expiryDate: data['expMonth'] != null 
              ? '${data['expMonth'].toString().padLeft(2, '0')}/${data['expYear'].toString().substring(2)}'
              : _expiryController.text,
          holderName: _holderNameController.text.trim().isNotEmpty 
              ? _holderNameController.text.trim() 
              : 'User',
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

  /// Detect card brand icon based on the card number prefix
  IconData _detectCardBrandIcon() {
    final number = _cardNumberController.text.replaceAll(' ', '');
    if (number.startsWith('4')) return Icons.credit_card; // Visa
    if (number.startsWith('5') || number.startsWith('2')) return Icons.credit_card; // Mastercard
    if (number.startsWith('3')) return Icons.credit_card; // Amex
    return Icons.credit_card_rounded;
  }

  Widget _buildCardInputField({
    required TextEditingController controller,
    required FocusNode focusNode,
    required String label,
    required String hint,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
    List<TextInputFormatter>? formatters,
    int? maxLength,
    Widget? suffixIcon,
    FocusNode? nextFocus,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: focusNode.hasFocus ? AppColors.accent : AppColors.border,
          width: focusNode.hasFocus ? 1.5 : 1,
        ),
      ),
      child: TextField(
        controller: controller,
        focusNode: focusNode,
        keyboardType: keyboardType,
        inputFormatters: formatters,
        maxLength: maxLength,
        style: const TextStyle(
          color: AppColors.white,
          fontSize: 16,
          fontWeight: FontWeight.w500,
          letterSpacing: 0.5,
        ),
        onChanged: (_) => setState(() {}),
        onSubmitted: (_) {
          if (nextFocus != null) {
            FocusScope.of(context).requestFocus(nextFocus);
          }
        },
        decoration: InputDecoration(
          labelText: label,
          labelStyle: TextStyle(
            color: focusNode.hasFocus ? AppColors.accent : AppColors.textSecondary,
            fontSize: 13,
            fontWeight: FontWeight.w500,
          ),
          hintText: hint,
          hintStyle: TextStyle(
            color: AppColors.textMuted.withValues(alpha: 0.6),
            fontSize: 15,
          ),
          prefixIcon: Container(
            margin: const EdgeInsets.only(left: 12, right: 8),
            child: Icon(
              icon,
              color: focusNode.hasFocus ? AppColors.accent : AppColors.textSecondary,
              size: 22,
            ),
          ),
          prefixIconConstraints: const BoxConstraints(minWidth: 44, minHeight: 44),
          suffixIcon: suffixIcon,
          counterText: '',
          border: InputBorder.none,
          enabledBorder: InputBorder.none,
          focusedBorder: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: buildAppBar(context, title: 'Add New Card', showBack: true),
      body: GestureDetector(
        onTap: () => FocusScope.of(context).unfocus(),
        child: SingleChildScrollView(
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
                        color: AppColors.accent.withValues(alpha: 0.15),
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
              const SizedBox(height: 16),
              
              // Cardholder Name Field
              _buildCardInputField(
                controller: _holderNameController,
                focusNode: _holderNameFocus,
                label: 'Cardholder Name',
                hint: 'John Doe',
                icon: Icons.person_outline_rounded,
                keyboardType: TextInputType.name,
                formatters: [
                  FilteringTextInputFormatter.allow(RegExp(r'[a-zA-Z\s]')),
                ],
                nextFocus: _cardNumberFocus,
              ),
              const SizedBox(height: 14),
              
              // Card Number Field
              _buildCardInputField(
                controller: _cardNumberController,
                focusNode: _cardNumberFocus,
                label: 'Card Number',
                hint: '1234 5678 9012 3456',
                icon: _detectCardBrandIcon(),
                keyboardType: TextInputType.number,
                maxLength: 19, // 16 digits + 3 spaces
                formatters: [
                  FilteringTextInputFormatter.digitsOnly,
                  _CardNumberFormatter(),
                ],
                suffixIcon: _cardNumberController.text.replaceAll(' ', '').length >= 15
                    ? const Padding(
                        padding: EdgeInsets.only(right: 12),
                        child: Icon(Icons.check_circle_rounded, color: AppColors.success, size: 22),
                      )
                    : null,
                nextFocus: _expiryFocus,
              ),
              const SizedBox(height: 14),
              
              // Expiry & CVV Row
              Row(
                children: [
                  // Expiry Date Field
                  Expanded(
                    child: _buildCardInputField(
                      controller: _expiryController,
                      focusNode: _expiryFocus,
                      label: 'Expiry Date',
                      hint: 'MM/YY',
                      icon: Icons.calendar_month_rounded,
                      keyboardType: TextInputType.number,
                      maxLength: 5, // MM/YY
                      formatters: [
                        FilteringTextInputFormatter.digitsOnly,
                        _ExpiryDateFormatter(),
                      ],
                      nextFocus: _cvvFocus,
                    ),
                  ),
                  const SizedBox(width: 14),
                  // CVV Field
                  Expanded(
                    child: _buildCardInputField(
                      controller: _cvvController,
                      focusNode: _cvvFocus,
                      label: 'CVV',
                      hint: '123',
                      icon: Icons.lock_outline_rounded,
                      keyboardType: TextInputType.number,
                      maxLength: 4,
                      formatters: [
                        FilteringTextInputFormatter.digitsOnly,
                      ],
                      suffixIcon: Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: IconButton(
                          icon: Icon(
                            Icons.help_outline_rounded,
                            color: AppColors.textMuted.withValues(alpha: 0.7),
                            size: 20,
                          ),
                          onPressed: () {
                            showDialog(
                              context: context,
                              builder: (ctx) => AlertDialog(
                                backgroundColor: AppColors.surface,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                title: const Text('CVV / CVC', style: TextStyle(color: AppColors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                                content: const Text(
                                  'The 3 or 4 digit security code on the back of your card (or front for Amex).',
                                  style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                                ),
                                actions: [
                                  TextButton(
                                    onPressed: () => Navigator.pop(ctx),
                                    child: const Text('Got it', style: TextStyle(color: AppColors.accent, fontWeight: FontWeight.bold)),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                  ),
                ],
              ),


              
              const SizedBox(height: 28),
              
              // Secure Badge
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.success.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.success.withValues(alpha: 0.3)),
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
              
              const SizedBox(height: 32),
              AccentButton(
                label: 'Save Card',
                onTap: _saveCard,
                isLoading: _isProcessing,
                icon: Icons.save_rounded,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Formats card number with spaces every 4 digits: 1234 5678 9012 3456
class _CardNumberFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final text = newValue.text;
    if (text.isEmpty) return newValue;

    final buffer = StringBuffer();
    for (int i = 0; i < text.length; i++) {
      if (i > 0 && i % 4 == 0) buffer.write(' ');
      buffer.write(text[i]);
    }
    final formatted = buffer.toString();
    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}

/// Formats expiry date as MM/YY
class _ExpiryDateFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final text = newValue.text;
    if (text.isEmpty) return newValue;

    final buffer = StringBuffer();
    for (int i = 0; i < text.length; i++) {
      if (i == 2) buffer.write('/');
      buffer.write(text[i]);
    }
    final formatted = buffer.toString();
    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}
