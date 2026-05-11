import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'onboarding_two.dart'; 
import 'login.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  final Color neonGreen = const Color(0xFFCCFF00); 
  final Color darkGrey = const Color(0xFF1A1A1A); 

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black, 
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 30.0, vertical: 20.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween, 
            children: [
              const Spacer(flex: 2), 

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildGlowIconData(FontAwesomeIcons.mapMarkerAlt, 70),
                  _buildGlowIconData(FontAwesomeIcons.sitemap, 80),
                  _buildGlowIconData(FontAwesomeIcons.chartLine, 70),
                ],
              ),

              const Spacer(flex: 3), 

              Column(
                children: [
                  const Text(
                    "Smart Routing",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.2,
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    "AI-powered real-time traffic avoidance to get you to your destination faster",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha:0.7),
                      fontSize: 16,
                      height: 1.5,
                    ),
                  ),
                ],
              ),

              const Spacer(flex: 4), 

              Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _buildDot(true), 
                      const SizedBox(width: 8),
                      _buildDot(false),
                      const SizedBox(width: 8),
                      _buildDot(false),
                    ],
                  ),
                  const SizedBox(height: 40),

                  ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const OnboardingScreenTwo()),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: neonGreen,
                      foregroundColor: Colors.black,
                      minimumSize: const Size(double.infinity, 60),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15),
                      ),
                    ),
                    child: const Text("Next", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(height: 20),

                  TextButton(
                    onPressed: () {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(builder: (context) => const LoginScreen3()),
                      );
                    },
                    child: const Text(
                      "Skip",
                      style: TextStyle(color: Colors.grey, fontSize: 16),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildGlowIconData(IconData iconData, double size) {
    return Container(
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: neonGreen.withValues(alpha:0.6),
            blurRadius: 35,
            spreadRadius: 10,
          ),
        ],
      ),
      child: FaIcon(
        iconData,
        size: size,
        color: neonGreen,
      ),
    );
  }

  Widget _buildDot(bool isActive) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      height: 10,
      width: 10,
      decoration: BoxDecoration(
        color: isActive ? neonGreen : darkGrey,
        shape: BoxShape.circle,
      ),
    );
  }
}
