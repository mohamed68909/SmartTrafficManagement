import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'login.dart'; 

class OnboardingScreenTwo extends StatelessWidget {
  const OnboardingScreenTwo({super.key});

  final Color neonGreen = const Color(0xFFCCFF00);
  final Color darkGrey = const Color(0xFF1A1A1A);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black, 
      body: SafeArea(
        child: SingleChildScrollView(
          child: ConstrainedBox(
            constraints: BoxConstraints(
              minHeight: MediaQuery.of(context).size.height - 
                  MediaQuery.of(context).padding.top - 
                  MediaQuery.of(context).padding.bottom - 40,
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 30.0, vertical: 20.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Spacer(flex: 2),

              _buildGlowIconGroupData(),

              const Spacer(flex: 3),

              Column(
                children: [
                  const Text(
                    "Instant Emergency Assist",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 30,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    "24/7 roadside assistance including towing, fuel delivery, and live mechanic support",
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
                      _buildDot(false),
                      const SizedBox(width: 8),
                      _buildDot(true),
                      const SizedBox(width: 8),
                      _buildDot(false),
                    ],
                  ),
                  const SizedBox(height: 40),

                  ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const LoginScreen3(),
                        ),
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
                    child: const Text(
                      "Get Started",
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  TextButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const LoginScreen3(),
                        ),
                      );
                    },
                    child: const Text(
                      "Skip",
                      style: TextStyle(
                        color: Colors.grey,
                        fontSize: 16,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    ),
  ),
);
  }

  Widget _buildGlowIconGroupData() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _singleGlowIcon(FontAwesomeIcons.truck, 80),
        const SizedBox(width: 25), 
        Column(
          children: [
            _singleGlowIcon(FontAwesomeIcons.wrench, 35),
            const SizedBox(height: 15),
            _singleGlowIcon(FontAwesomeIcons.phone, 35),
          ],
        ),
      ],
    );
  }

  Widget _singleGlowIcon(IconData icon, double size) {
    return FaIcon(
      icon,
      size: size,
      color: neonGreen,
      shadows: [
        Shadow(
          color: neonGreen.withValues(alpha:0.8),
          blurRadius: 25,
        ),
      ],
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
