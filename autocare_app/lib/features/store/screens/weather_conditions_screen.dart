import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class WeatherConditionsScreen extends StatefulWidget {
  const WeatherConditionsScreen({super.key});

  @override
  State<WeatherConditionsScreen> createState() =>
      _WeatherConditionsScreenState();
}

class _WeatherConditionsScreenState extends State<WeatherConditionsScreen> {
  double targetTemperature = 24.0;
  double targetHumidity = 45.0;
  String airQuality = 'Good';
  double precipitationChance = 0.15;
  String uvIndex = 'Low';
  String visibility = '10km';
  String roadTemp = '28°';

  bool isLoading = true;
  String loadingMessage = 'Detecting Location...';

  @override
  void initState() {
    super.initState();
    _fetchLiveWeatherData();
  }

  Future<void> _fetchLiveWeatherData() async {
    try {
      // 1. Check permissions
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        throw Exception('Location services are disabled.');
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          throw Exception('Location permissions are denied');
        }
      }

      if (permission == LocationPermission.deniedForever) {
        throw Exception('Location permissions are permanently denied');
      }

      setState(() {
        loadingMessage = 'Fetching Live Weather...';
      });

      // 2. Get current position
      Position position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high);

      // 3. Fetch Data from Open-Meteo
      final url = Uri.parse(
          'https://api.open-meteo.com/v1/forecast?latitude=${position.latitude}&longitude=${position.longitude}&current=temperature_2m,relative_humidity_2m,precipitation,visibility&daily=uv_index_max&timezone=auto');
      final response = await http.get(url).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final current = data['current'];
        final daily = data['daily'];

        setState(() {
          targetTemperature = (current['temperature_2m'] ?? 24.0).toDouble();
          targetHumidity = (current['relative_humidity_2m'] ?? 45.0).toDouble();

          double prec = (current['precipitation'] ?? 0.0).toDouble();
          precipitationChance = prec > 0 ? (prec > 10 ? 0.9 : prec / 10) : 0.05;

          double vis = (current['visibility'] ?? 10000.0).toDouble() / 1000.0;
          visibility = '${vis.toStringAsFixed(1)}km';

          double uv = (daily['uv_index_max'][0] ?? 2.0).toDouble();
          if (uv < 3)
            uvIndex = 'Low';
          else if (uv < 6)
            uvIndex = 'Mod';
          else if (uv < 8)
            uvIndex = 'High';
          else
            uvIndex = 'V.High';

          roadTemp = '${(targetTemperature + 4).toStringAsFixed(0)}°';
          isLoading = false;
        });
      } else {
        throw Exception('Failed to load weather data');
      }
    } catch (e) {
      debugPrint('Weather fetch error: $e');
      setState(() {
        isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content:
                Text('Could not fetch live data. Using defaults.\nError: $e'),
            backgroundColor: Colors.orange,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final mediaQuery = MediaQuery.of(context);
    final isSmallScreen = mediaQuery.size.width < 360;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Weather Conditions', style: TextStyle(fontSize: 18)),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(LucideIcons.chevronLeft,
              color: isDark ? Colors.white : Colors.black),
          onPressed: () => Navigator.pushReplacementNamed(context, '/'),
        ),
      ),
      body: isLoading
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(color: AppTheme.primary),
                  const SizedBox(height: 16),
                  Text(loadingMessage,
                      style: TextStyle(color: AppTheme.textSecondary)),
                ],
              ),
            )
          : SafeArea(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    // Hero Weather Icon and Temperature
                    Container(
                      padding: const EdgeInsets.all(32),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: isDark
                              ? [
                                  AppTheme.cardBg,
                                  AppTheme.cardBg.withValues(alpha: 0.5)
                                ]
                              : [Colors.blue.shade50, Colors.white],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(40),
                        border: Border.all(
                            color:
                                isDark ? Colors.white10 : Colors.blue.shade100),
                      ),
                      child: Column(
                        children: [
                          Icon(
                            LucideIcons.cloudSun,
                            size: 80,
                            color: isDark ? Colors.white : Colors.blue.shade700,
                          ),
                          const SizedBox(height: 16),
                          TweenAnimationBuilder<double>(
                            tween:
                                Tween<double>(begin: 0, end: targetTemperature),
                            duration: const Duration(seconds: 2),
                            builder: (context, value, child) {
                              return Text(
                                '${value.toInt()}°',
                                style: TextStyle(
                                  color: AppTheme.primary,
                                  fontSize: isSmallScreen ? 60 : 80,
                                  fontWeight: FontWeight.bold,
                                ),
                              );
                            },
                          ),
                          Text(
                            'PARTLY CLOUDY',
                            style: TextStyle(
                                color: AppTheme.textSecondary,
                                letterSpacing: 1.5,
                                fontSize: 12,
                                fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),

                    Row(
                      children: [
                        Expanded(
                            child: _buildAnimatedSensorCard(
                                'HUMIDITY',
                                targetHumidity,
                                '%',
                                LucideIcons.droplets,
                                isDark)),
                        const SizedBox(width: 16),
                        Expanded(
                            child: _buildSensorCard('AIR QUALITY', airQuality,
                                LucideIcons.wind, isDark,
                                valueColor: AppTheme.primary)),
                      ],
                    ),
                    const SizedBox(height: 16),

                    _buildWeatherConditionCard(isDark),
                    const SizedBox(height: 24),

                    _buildBottomStats(isDark),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildAnimatedSensorCard(String label, double targetValue,
      String suffix, IconData icon, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.cardBg : Colors.white,
        borderRadius: BorderRadius.circular(32),
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
              Icon(icon, color: AppTheme.primary, size: 20),
              const SizedBox(width: 8),
              Text(label,
                  style: TextStyle(
                      color: AppTheme.textSecondary, fontSize: 9)),
            ],
          ),
          const SizedBox(height: 12),
          TweenAnimationBuilder<double>(
            tween: Tween<double>(begin: 0, end: targetValue),
            duration: const Duration(milliseconds: 1500),
            builder: (context, value, child) {
              return Text('${value.toInt()}$suffix',
                  style: TextStyle(
                      color: isDark ? Colors.white : Colors.black87,
                      fontSize: 28,
                      fontWeight: FontWeight.bold));
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSensorCard(
      String label, String value, IconData icon, bool isDark,
      {Color? valueColor}) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.cardBg : Colors.white,
        borderRadius: BorderRadius.circular(32),
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
              Icon(icon, color: AppTheme.primary, size: 20),
              const SizedBox(width: 8),
              Text(label,
                  style: TextStyle(
                      color: AppTheme.textSecondary, fontSize: 9)),
            ],
          ),
          const SizedBox(height: 12),
          Text(value,
              style: TextStyle(
                  color: valueColor ?? (isDark ? Colors.white : Colors.black87),
                  fontSize: 28,
                  fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildWeatherConditionCard(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.cardBg : Colors.white,
        borderRadius: BorderRadius.circular(40),
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
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppTheme.primary.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(LucideIcons.cloudRain,
                    color: AppTheme.primary, size: 32),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Rainy Conditions',
                        style: TextStyle(
                            fontSize: 20, fontWeight: FontWeight.bold)),
                    Text('Clear skies expected soon',
                        style: TextStyle(
                            color: AppTheme.textSecondary, fontSize: 12)),
                  ],
                ),
              ),
              Column(
                children: [
                  TweenAnimationBuilder<double>(
                    tween:
                        Tween<double>(begin: 0, end: precipitationChance * 100),
                    duration: const Duration(seconds: 2),
                    builder: (context, value, child) {
                      return Text('${value.toInt()}%',
                          style: TextStyle(
                              color: AppTheme.primary,
                              fontSize: 18,
                              fontWeight: FontWeight.bold));
                    },
                  ),
                  Text('CHANCE',
                      style: TextStyle(
                          color: AppTheme.textSecondary, fontSize: 9)),
                ],
              )
            ],
          ),
          const SizedBox(height: 24),
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: TweenAnimationBuilder<double>(
              tween: Tween<double>(begin: 0, end: precipitationChance),
              duration: const Duration(seconds: 2),
              curve: Curves.easeOut,
              builder: (context, value, child) {
                return LinearProgressIndicator(
                  value: value,
                  backgroundColor: isDark ? Colors.white10 : Colors.black12,
                  valueColor: AlwaysStoppedAnimation(AppTheme.primary),
                  minHeight: 6,
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomStats(bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 20),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.cardBg : Colors.white,
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: isDark ? Colors.white10 : Colors.black12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _buildStatItem('UV INDEX', uvIndex, LucideIcons.sun, isDark),
          _buildDivider(isDark),
          _buildStatItem('VISIBILITY', visibility, LucideIcons.eye, isDark),
          _buildDivider(isDark),
          _buildStatItem(
              'ROAD TEMP', roadTemp, LucideIcons.thermometer, isDark),
        ],
      ),
    );
  }

  Widget _buildDivider(bool isDark) {
    return Container(
      height: 40,
      width: 1,
      color: isDark ? Colors.white10 : Colors.black12,
    );
  }

  Widget _buildStatItem(
      String label, String value, IconData icon, bool isDark) {
    return Column(
      children: [
        Icon(icon, color: AppTheme.textSecondary, size: 24),
        const SizedBox(height: 8),
        Text(label,
            style: TextStyle(color: AppTheme.textSecondary, fontSize: 9)),
        const SizedBox(height: 4),
        Text(value,
            style: TextStyle(
                color: isDark ? Colors.white : Colors.black87,
                fontSize: 16,
                fontWeight: FontWeight.bold)),
      ],
    );
  }
}
