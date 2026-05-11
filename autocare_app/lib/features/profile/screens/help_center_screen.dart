// lib/features/profile/screens/help_center_screen.dart
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/shared_widgets.dart';
import 'live_chat_screen.dart';

class HelpCenterScreen extends StatefulWidget {
  const HelpCenterScreen({super.key});

  @override
  State<HelpCenterScreen> createState() => _HelpCenterScreenState();
}

class _HelpCenterScreenState extends State<HelpCenterScreen> {
  final _searchCtrl = TextEditingController();
  int? _expandedIndex;

  void _makeCall() async {
    final Uri url = Uri.parse('tel:16000');
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    }
  }

  void _showComingSoon(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Feature coming soon!'),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  final _faqs = [
    (
      'How do I track my order?',
      'Go to Order History from your Profile or Dashboard. Each order shows a real-time status badge. You\'ll also receive SMS updates at each stage of your delivery.'
    ),
    (
      'What payment methods are accepted?',
      'We accept Visa, Mastercard, and Amex via Stripe (fully encrypted), Digital Wallet points, and Cash on Delivery. All card payments are processed securely — we never store raw card numbers.'
    ),
    (
      'How does Emergency Fuel Delivery work?',
      'Tap the Emergency tab, select fuel type and quantity, confirm your GPS location, and tap Request. A certified driver will arrive within 20–35 minutes with your fuel.'
    ),
    (
      'Can I reschedule a maintenance appointment?',
      'Yes — go to Order History, find your scheduled appointment, and tap Reschedule. You can change the date and time up to 12 hours before the appointment.'
    ),
    (
      'How do I earn and redeem points?',
      'You earn 1 point per 10 USD spent. Points can be redeemed at checkout by selecting Digital Wallet. 100 points = 10 USD discount.'
    ),
    (
      'What is the return policy?',
      'Unused products in original packaging can be returned within 30 days. Installation services are non-refundable once completed. Contact support to initiate a return.'
    ),
    (
      'Is the Mechanic Video Call free?',
      'The first 15 minutes of each call are free. Extended sessions are billed at 50 USD per 15 minutes, deducted from your Wallet balance.'
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: buildAppBar(context, title: 'Help Center', showBack: true),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Search
            TextField(
              controller: _searchCtrl,
              style: const TextStyle(color: AppColors.white),
              decoration: const InputDecoration(
                hintText: 'Search for help...',
                prefixIcon: Icon(Icons.search, color: AppColors.textMuted, size: 20),
              ),
            ),
            const SizedBox(height: 24),

            // Quick actions
            const SectionHeader(title: 'Quick Support'),
            const SizedBox(height: 14),
            Row(
              children: [
                _SupportCard(
                  icon: Icons.chat_bubble_outline_rounded,
                  label: 'Live Chat',
                  sublabel: 'Avg 2 min reply',
                  color: AppColors.accent,
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LiveChatScreen())),
                ),
                const SizedBox(width: 10),
                _SupportCard(
                  icon: Icons.phone_outlined,
                  label: 'Call Us',
                  sublabel: '16000 · 24/7',
                  color: AppColors.success,
                  onTap: _makeCall,
                ),
                const SizedBox(width: 10),
                _SupportCard(
                  icon: Icons.email_outlined,
                  label: 'Email',
                  sublabel: 'support@autocare',
                  color: const Color(0xFF2196F3),
                  onTap: () => _showComingSoon(context),
                ),
              ],
            ),
            const SizedBox(height: 28),

            // FAQ
            const SectionHeader(title: 'Frequently Asked Questions'),
            const SizedBox(height: 14),
            ..._faqs.asMap().entries.map((entry) {
              final i = entry.key;
              final (q, a) = entry.value;
              final isExpanded = _expandedIndex == i;
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: GestureDetector(
                  onTap: () => setState(
                      () => _expandedIndex = isExpanded ? null : i),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 250),
                    decoration: BoxDecoration(
                      color: isExpanded
                          ? AppColors.accent.withValues(alpha:0.06)
                          : AppColors.surface,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: isExpanded
                            ? AppColors.accent.withValues(alpha:0.4)
                            : AppColors.border,
                        width: isExpanded ? 1.5 : 1,
                      ),
                    ),
                    child: Column(
                      children: [
                        Padding(
                          padding: const EdgeInsets.all(14),
                          child: Row(
                            children: [
                              Expanded(
                                child: Text(
                                  q,
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: isExpanded
                                        ? FontWeight.w700
                                        : FontWeight.w500,
                                    color: isExpanded
                                        ? AppColors.accent
                                        : AppColors.white,
                                    height: 1.3,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              AnimatedRotation(
                                turns: isExpanded ? 0.5 : 0,
                                duration: const Duration(milliseconds: 250),
                                child: Icon(
                                  Icons.keyboard_arrow_down_rounded,
                                  color: isExpanded
                                      ? AppColors.accent
                                      : AppColors.textMuted,
                                  size: 20,
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (isExpanded)
                          Padding(
                            padding:
                                const EdgeInsets.fromLTRB(14, 0, 14, 14),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const NeonDivider(),
                                const SizedBox(height: 10),
                                Text(
                                  a,
                                  style: const TextStyle(
                                    color: AppColors.textSecondary,
                                    fontSize: 13,
                                    height: 1.5,
                                  ),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              );
            }),
            const SizedBox(height: 24),

            // Still need help
            AppCard(
              borderColor: AppColors.accent.withValues(alpha:0.3),
              child: Column(
                children: [
                  const Icon(Icons.headset_mic_rounded,
                      color: AppColors.accent, size: 32),
                  const SizedBox(height: 12),
                  const Text(
                    'Still need help?',
                    style: TextStyle(
                        color: AppColors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Our support team is available 24/7\nto help you with any issue.',
                    style: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 12,
                        height: 1.5),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  AccentButton(
                    label: 'Start Live Chat',
                    icon: Icons.chat_rounded,
                    onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LiveChatScreen())),
                    height: 46,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SupportCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String sublabel;
  final Color color;
  final VoidCallback onTap;

  const _SupportCard({
    required this.icon,
    required this.label,
    required this.sublabel,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: color.withValues(alpha:0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: color, size: 20),
              ),
              const SizedBox(height: 8),
              Text(label,
                  style: const TextStyle(
                      color: AppColors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w600)),
              const SizedBox(height: 2),
              Text(sublabel,
                  style: const TextStyle(
                      color: AppColors.textMuted, fontSize: 9),
                  textAlign: TextAlign.center),
            ],
          ),
        ),
      ),
    );
  }
}
