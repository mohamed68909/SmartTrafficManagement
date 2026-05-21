import 'package:flutter/material.dart';

class UserProvider extends ChangeNotifier {
  String _firstName = 'Ahmed';
  String _lastName = 'Hassan';
  String _email = 'ahmed.hassan@email.com';
  String _phone = '+20 106 152 8756';
  String _dob = '15/05/1990';
  String? _imagePath;

  String get firstName => _firstName;
  String get lastName => _lastName;
  String get email => _email;
  String get phone => _phone;
  String get dob => _dob;
  String? get imagePath => _imagePath;

  void updateProfile({
    required String firstName,
    required String lastName,
    required String email,
    required String phone,
    required String dob,
    String? imagePath,
  }) {
    _firstName = firstName;
    _lastName = lastName;
    _email = email;
    _phone = phone;
    _dob = dob;
    if (imagePath != null) _imagePath = imagePath;
    notifyListeners();
  }
}

final userProvider = UserProvider();
