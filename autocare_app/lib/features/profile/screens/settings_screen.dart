import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../core/theme/theme_notifier.dart';
import 'package:lucide_icons/lucide_icons.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool pushNotifications = true;
  bool locationAlwaysOn = false;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return ListenableBuilder(
      listenable: themeNotifier,
      builder: (context, _) {
        return Scaffold(
          appBar: AppBar(
            backgroundColor: Colors.transparent,
            elevation: 0,
            leadingWidth: 120,
            leading: Row(
              children: [
                const SizedBox(width: 8),
                IconButton(
                  icon: Icon(LucideIcons.chevronLeft,
                      color: isDark ? Colors.white : Colors.black, size: 18),
                  onPressed: () =>
                      Navigator.pushReplacementNamed(context, '/profile'),
                ),
                const SizedBox(width: 4),
                Text('Back',
                    style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white70 : Colors.black87)),
              ],
            ),
          ),
          body: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Settings',
                    style: const TextStyle(
                        fontSize: 32, fontWeight: FontWeight.bold)),
                const SizedBox(height: 40),
                _buildSectionHeader('Notifications'),
                _buildSettingCard(
                  'Push Notifications',
                  'Get alerts for traffic and services',
                  pushNotifications,
                  onToggle: (v) => setState(() => pushNotifications = v),
                ),
                const SizedBox(height: 32),
                _buildSectionHeader('Location'),
                _buildSettingCard(
                  'Location Always On',
                  'Track location in background',
                  locationAlwaysOn,
                  onToggle: (v) => setState(() => locationAlwaysOn = v),
                  bottomText:
                      'When disabled, location is only tracked while using the app',
                ),
                const SizedBox(height: 32),
                _buildSectionHeader('Appearance'),
                _buildSettingCard(
                  'Dark Mode',
                  'Ultra-modern dark theme',
                  themeNotifier.value == ThemeMode.dark,
                  onToggle: (v) {
                    themeNotifier.value = v ? ThemeMode.dark : ThemeMode.light;
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16, left: 4),
      child: Text(title,
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
    );
  }

  Widget _buildSettingCard(String title, String subtitle, bool value,
      {required Function(bool) onToggle, String? bottomText}) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.cardBg : Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: isDark ? Colors.white10 : Colors.black12),
        boxShadow: isDark
            ? []
            : [
                BoxShadow(
                    color: Colors.black.withValues(alpha: 0.02),
                    blurRadius: 10,
                    offset: const Offset(0, 4))
              ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title,
                        style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: isDark ? Colors.white : Colors.black87)),
                    const SizedBox(height: 4),
                    Text(subtitle,
                        style: TextStyle(
                            color: AppTheme.textSecondary, fontSize: 13)),
                  ],
                ),
              ),
              Switch(
                value: value,
                onChanged: onToggle,
                activeThumbColor: AppTheme.primary,
                activeTrackColor: AppTheme.primary.withValues(alpha: 0.3),
              )
            ],
          ),
          if (bottomText != null) ...[
            const Padding(
                padding: EdgeInsets.symmetric(vertical: 12),
                child: Divider(color: Colors.white10)),
            Text(bottomText,
                style: TextStyle(
                    color: AppTheme.textSecondary, fontSize: 10)),
          ]
        ],
      ),
    );
  }
}
