// lib/main.dart
// MERGED VERSION - Combines AutoCare, GrPr, and Smart Traffic Management
// Author: Merged Flutter Developer
// Date: 2026-05-03
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:latlong2/latlong.dart';
import 'package:flutter/foundation.dart';

// Core imports
import 'core/theme/app_theme.dart';
import 'core/theme/app_theme.dart' as grpr_theme;

import 'core/services/stripe_service.dart';
import 'core/theme/theme_notifier.dart';
import 'core/user_provider.dart';

// Screens - AutoCare
import 'shell.dart';

// Screens - GrPr
import 'features/store/screens/weather_conditions_screen.dart';
import 'features/maintenance/screens/maintenance_screen.dart';
import 'features/profile/screens/profile_screen.dart';
import 'features/profile/screens/edit_profile_screen.dart';
import 'features/profile/screens/settings_screen.dart';
import 'features/store/screens/cart_screen.dart';
import 'features/profile/screens/order_confirmation_screen.dart';
import 'features/profile/screens/rating_screen.dart';
import 'features/profile/screens/help_center_screen.dart';

// Screens - Smart Traffic
import 'features/auth/screens/splash_screen_first.dart';
import 'features/auth/screens/main_wrapper.dart';
import 'features/maps/screens/map_screen.dart';
import 'features/maps/screens/navigation_screen.dart';
import 'features/traffic/screens/traffic_screen.dart';
import 'features/emergency/screens/emergency.dart';
import 'features/reports/screens/report_hazard.dart';
import 'features/emergency/screens/winch_service.dart';
import 'features/emergency/screens/fuel_tracking.dart';

// Global navigator key for Smart Traffic features
final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

class MyHttpOverrides extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) {
    return super.createHttpClient(context)
      ..badCertificateCallback = (X509Certificate cert, String host, int port) {
        return true; // Always allow invalid certs to avoid issues on physical devices with free hosting
      };
  }
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  
  
  if (kDebugMode) {
    HttpOverrides.global = MyHttpOverrides();
  }

  // ========== ORIENTATION LOCK (from AutoCare) ==========
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // ========== SYSTEM UI STYLING (from AutoCare) ==========
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    statusBarBrightness: Brightness.dark,
    systemNavigationBarColor: AppColors.surface,
    systemNavigationBarIconBrightness: Brightness.light,
  ));

  // ========== STRIPE INITIALIZATION (from AutoCare) ==========
  // ⚠️ Secret key stays in stripe_service.dart for DEMO purposes only.
  // In production: move PaymentIntent creation to a backend server.
  StripeService.init();

  // ========== RUN APP with Riverpod Provider (from AutoCare) ==========
  runApp(
    const ProviderScope(
      child: MergedAutoCareApp(),
    ),
  );
}

class MergedAutoCareApp extends StatefulWidget {
  const MergedAutoCareApp({super.key});

  @override
  State<MergedAutoCareApp> createState() => _MergedAutoCareAppState();
}

class _MergedAutoCareAppState extends State<MergedAutoCareApp> {
  @override
  void initState() {
    super.initState();
    // Listen to theme changes from GrPr features
    themeNotifier.addListener(_onThemeChanged);
  }

  @override
  void dispose() {
    themeNotifier.removeListener(_onThemeChanged);
    super.dispose();
  }

  void _onThemeChanged() {
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: Listenable.merge([themeNotifier, userProvider]),
      builder: (context, _) {
        return MaterialApp(
          navigatorKey: navigatorKey, // For Smart Traffic features
          title: 'STMS',
          debugShowCheckedModeBanner: false,

          // ========== THEME MERGING ==========
          // Primary: AutoCare dark theme
          // Fallback: GrPr dynamic themes
          theme: _getLightTheme(),
          darkTheme: _getDarkTheme(),
          themeMode: themeNotifier.value,

          // ========== ROUTES ==========
          initialRoute: '/splash',
          routes: {
            // Splash & Auth Routes
            '/splash': (context) => const SplashScreen(),
            '/main_wrapper': (context) => const MainWrapper(),

            // GrPr Menu Routes
            '/': (context) => const MainMenuScreen(),
            '/weather': (context) => const WeatherConditionsScreen(),
            '/maintenance': (context) => const MaintenanceScreen(),
            '/profile': (context) => const ProfileScreen(),
            '/edit_profile': (context) => const EditProfileScreen(),
            '/settings': (context) => const SettingsScreen(),
            '/cart': (context) => const CartScreen(),
            '/order_confirmation': (context) => const OrderConfirmationScreen(),
            '/rating': (context) => const RatingScreen(),
            '/help': (context) => const HelpCenterScreen(),

            // AutoCare Routes (via AppShell)
            // AppShell handles its own navigation internally

            // Smart Traffic Routes
            '/map': (context) => const MapScreen(),
            '/navigation': (context) => NavigationScreen9(
              routePoints: const [],
              distance: '0 km',
              duration: '0 min',
              destination: const LatLng(31.2598, 32.2882),
            ),
            '/traffic': (context) => const TrafficScreen(),
            '/emergency': (context) => const EmergencyScreen(),
            '/report_hazard': (context) => const ReportHazardScreen(),
            '/winch_service': (context) => const WinchServiceScreen(),
            '/fuel_tracking': (context) => FuelTracking20(
              fuelType: 'Petrol',
              amount: '0',
              totalPrice: '0',
            ),
          },

          // Fallback for undefined routes
          onGenerateRoute: (settings) {
            // If route is not found, try AutoCare's AppShell
            if (settings.name == '/home') {
              return MaterialPageRoute(
                builder: (context) => const AppShell(),
              );
            }
            // Default fallback
            return MaterialPageRoute(
              builder: (context) => const MainMenuScreen(),
            );
          },
        );
      },
    );
  }

  ThemeData _getLightTheme() {
    // Merge GrPr light theme with AutoCare
    return ThemeData(
      brightness: Brightness.light,
      primaryColor: grpr_theme.AppTheme.primary,
      scaffoldBackgroundColor:
          grpr_theme.AppTheme.lightTheme.scaffoldBackgroundColor,
      colorScheme: ColorScheme.fromSwatch().copyWith(
        secondary: grpr_theme.AppTheme.primary,
        primary: grpr_theme.AppTheme.primary,
      ),
      textTheme: const TextTheme(
        bodyLarge: TextStyle(color: Colors.black87),
        bodyMedium: TextStyle(color: Colors.black87),
        titleLarge: TextStyle(fontWeight: FontWeight.bold),
      ),
      cardTheme: CardThemeData(
        color: grpr_theme.AppTheme.lightTheme.cardTheme.color,
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
    );
  }

  ThemeData _getDarkTheme() {
    // Primary: AutoCare dark theme
    // Enhanced with GrPr dark theme elements
    return AppTheme.dark.copyWith(
      // Override with GrPr dark theme preferences
      cardTheme: CardThemeData(
        color: grpr_theme.AppTheme.cardBg,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      textTheme: const TextTheme(
        bodyLarge: TextStyle(color: Colors.white),
        bodyMedium: TextStyle(color: Colors.white70),
      ),
    );
  }
}

// ========== GRPR MAIN MENU SCREEN (from main_3.dart) ==========
class MainMenuScreen extends StatelessWidget {
  const MainMenuScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Main Menu'),
        centerTitle: true,
        elevation: 0,
      ),
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Welcome to STMS',
                      style: theme.textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Your smart traffic management platform',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: isDark ? Colors.grey[400] : Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 1.1,
                ),
                delegate: SliverChildListDelegate([
                  _buildMenuCard(
                    context,
                    'Weather',
                    LucideIcons.cloudSun,
                    '/weather',
                    isDark,
                  ),
                  _buildMenuCard(
                    context,
                    'Maintenance',
                    LucideIcons.wrench,
                    '/maintenance',
                    isDark,
                  ),
                  _buildMenuCard(
                    context,
                    'Traffic',
                    LucideIcons.map,
                    '/traffic',
                    isDark,
                  ),
                  _buildMenuCard(
                    context,
                    'Emergency',
                    LucideIcons.alertTriangle,
                    '/emergency',
                    isDark,
                  ),
                  _buildMenuCard(
                    context,
                    'Profile',
                    LucideIcons.user,
                    '/profile',
                    isDark,
                  ),
                  _buildMenuCard(
                    context,
                    'My Cart',
                    LucideIcons.shoppingCart,
                    '/cart',
                    isDark,
                  ),
                  _buildMenuCard(
                    context,
                    'Map',
                    LucideIcons.map,
                    '/map',
                    isDark,
                  ),
                  _buildMenuCard(
                    context,
                    'Settings',
                    LucideIcons.settings,
                    '/settings',
                    isDark,
                  ),
                  _buildMenuCard(
                    context,
                    'Help & FAQ',
                    LucideIcons.helpCircle,
                    '/help',
                    isDark,
                  ),
                  _buildMenuCard(
                    context,
                    'Service Rating',
                    LucideIcons.star,
                    '/rating',
                    isDark,
                  ),
                  _buildMenuCard(
                    context,
                    'Payments',
                    LucideIcons.creditCard,
                    '/order_confirmation',
                    isDark,
                  ),
                  _buildMenuCard(
                    context,
                    'Winch Service',
                    LucideIcons.truck,
                    '/winch_service',
                    isDark,
                  ),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuCard(
    BuildContext context,
    String title,
    IconData icon,
    String route,
    bool isDark,
  ) {
    final theme = Theme.of(context);

    return GestureDetector(
      onTap: () {
        Navigator.pushNamed(context, route);
      },
      child: Container(
        decoration: BoxDecoration(
          color: isDark ? grpr_theme.AppTheme.cardBg : Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: isDark ? Colors.white10 : Colors.black12,
          ),
          boxShadow: isDark
              ? []
              : [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: grpr_theme.AppTheme.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: grpr_theme.AppTheme.primary, size: 28),
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

