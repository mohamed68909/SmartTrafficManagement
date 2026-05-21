import 'package:flutter/material.dart';

/// Drives [MaterialApp.themeMode] in `main.dart`; settings toggles this instance.
final themeNotifier = ValueNotifier<ThemeMode>(ThemeMode.dark);
