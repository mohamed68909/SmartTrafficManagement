import 'package:flutter/material.dart';
import '../../../shell.dart'; // Use AppShell for proper bottom navigation

class MainWrapper extends StatelessWidget {
  const MainWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    return const AppShell(); // Use AppShell with proper bottom navigation
  }
}
