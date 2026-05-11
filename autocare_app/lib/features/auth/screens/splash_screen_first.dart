import 'package:flutter/material.dart';
import 'dart:async';
import 'onboarding (1).dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  double _progressValue = 0.0;

  @override
  void initState() {
    super.initState();
    Timer.periodic(const Duration(milliseconds: 40), (timer) {
      if (mounted) {
        setState(() {
          if (_progressValue < 1.0) {
            _progressValue += 0.01; 
          } else {
            timer.cancel(); 
            
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (context) => const OnboardingScreen()),
            );
          }
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    const neonGreen = Color(0xFFCCFF00); 
    const scaffoldBg = Color(0xFF0E1108); 

    return Scaffold(
      backgroundColor: scaffoldBg,
      body: Stack(
        children: [
          Center(
            child: Container(
              width: 350,
              height: 350,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white.withValues(alpha:0.05), width: 1),
              ),
            ),
          ),
          
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: neonGreen.withValues(alpha:0.3),
                        blurRadius: 70,
                        spreadRadius: 5,
                      ),
                    ],
                  ),
                  child: CircleAvatar(
                    radius: 90,
                    backgroundColor: neonGreen,
                    child: ClipOval(
                      child: Image.asset(
                        'assets/icon/smart.png',
                        fit: BoxFit.cover,
                        width: 180,
                        height: 180,
                      ),
                    ),
                  ),
                ),
                
                const SizedBox(height: 50),
                
                const Text(
                  "SMART TRAFFIC",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 32,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 2,
                  ),
                ),
                const Text(
                  "MANAGEMENT",
                  style: TextStyle(
                    color: neonGreen,
                    fontSize: 30,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1.5,
                  ),
                ),
                const Text(
                  "SYSTEM",
                  style: TextStyle(
                    color: neonGreen,
                    fontSize: 28,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                
                const SizedBox(height: 15),
                
                const Text(
                  "HIGH-TECH URBAN MOBILITY",
                  style: TextStyle(
                    color: Color(0xFF6B7A3D),
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    letterSpacing: 1.2,
                  ),
                ),
                
                const SizedBox(height: 100),

                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 50),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            "INITIALIZING NEURAL GRID", 
                            style: TextStyle(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                          Text(
                            "${(_progressValue * 100).toInt()}%", 
                            style: const TextStyle(color: neonGreen, fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      LinearProgressIndicator(
                        value: _progressValue,
                        backgroundColor: Colors.white10,
                        valueColor: const AlwaysStoppedAnimation<Color>(neonGreen),
                        minHeight: 3,
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(height: 40),
                
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.sensors, color: neonGreen.withValues(alpha:0.5), size: 18),
                    const SizedBox(width: 25),
                    Icon(Icons.traffic, color: neonGreen.withValues(alpha:0.5), size: 18),
                    const SizedBox(width: 25),
                    Icon(Icons.router, color: neonGreen.withValues(alpha:0.5), size: 18),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
