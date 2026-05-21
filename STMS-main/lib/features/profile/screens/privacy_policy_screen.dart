import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/shared_widgets.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: buildAppBar(context, title: 'Privacy Policy', showBack: true),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Privacy Policy',
              style: TextStyle(
                color: AppColors.white,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Last updated: May 2026',
              style: TextStyle(color: AppColors.textMuted, fontSize: 12),
            ),
            const SizedBox(height: 24),
            _buildSection(
              '1. Information We Collect',
              'We collect information to provide better services to all our users. This includes your name, email, phone number, and vehicle information when you register an account.',
            ),
            _buildSection(
              '2. How We Use Information',
              'We use the information we collect to provide, maintain, and improve our services, to develop new ones, and to protect AutoCare and our users.',
            ),
            _buildSection(
              '3. Location Data',
              'Our application requires access to your location to provide emergency roadside assistance (SOS) and to connect you with nearby mechanics. This data is only transmitted when you explicitly request a service.',
            ),
            _buildSection(
              '4. Information Sharing',
              'We do not share your personal information with companies, organizations, or individuals outside of AutoCare except in cases of emergency services (e.g., sharing location with a winch provider) or with your explicit consent.',
            ),
            _buildSection(
              '5. Data Security',
              'We work hard to protect AutoCare and our users from unauthorized access to or unauthorized alteration, disclosure, or destruction of information we hold.',
            ),
            const SizedBox(height: 40),
            Center(
              child: Text(
                'AutoCare Smart Traffic Management v1.0.0',
                style: TextStyle(color: AppColors.textMuted, fontSize: 11),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildSection(String title, String content) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: AppColors.accent,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            content,
            style: TextStyle(
              color: AppColors.white.withOpacity(0.7),
              fontSize: 14,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}
