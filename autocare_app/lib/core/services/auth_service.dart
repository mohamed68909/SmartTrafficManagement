import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../network/api_constants.dart';

class AuthService {
  // Login Method
  static Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse(ApiConstants.loginUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final data = body['data'];
        
        // Save tokens
        if (data != null) {
          final prefs = await SharedPreferences.getInstance();
          if (data['accessToken'] != null) {
            await prefs.setString('jwt_token', data['accessToken']);
          }
          if (data['refreshToken'] != null) {
            await prefs.setString('refresh_token', data['refreshToken']);
          }
          if (data['user'] != null && data['user']['id'] != null) {
             await prefs.setString('user_id', data['user']['id'].toString());
          }
        }
        return {'success': true, 'data': body};
      } else {
        final errorData = jsonDecode(response.body);
        return {'success': false, 'message': errorData['message'] ?? 'Login failed. Please check your credentials.'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error. Make sure the local server is running.'};
    }
  }

  // Register Method
  static Future<Map<String, dynamic>> register({
    required String firstName,
    required String lastName,
    required String email,
    required String phoneNumber,
    required String password,
  }) async {
    try {
      final response = await http.post(
        Uri.parse(ApiConstants.registerUrl),
        headers: {
          'Content-Type': 'application/json',
          'X-Platform': 'Mobile'
        },
        body: jsonEncode({
          'firstName': firstName,
          'lastName': lastName,
          'email': email,
          'phoneNumber': phoneNumber,
          'password': password,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final body = jsonDecode(response.body);
        final data = body['data'];

        // Save tokens if returned upon registration
        if (data != null) {
          final prefs = await SharedPreferences.getInstance();
          if (data['accessToken'] != null) {
            await prefs.setString('jwt_token', data['accessToken']);
          }
          if (data['refreshToken'] != null) {
            await prefs.setString('refresh_token', data['refreshToken']);
          }
          if (data['user'] != null && data['user']['id'] != null) {
             await prefs.setString('user_id', data['user']['id'].toString());
          }
        }
        return {'success': true, 'data': body};
      } else {
        final errorData = jsonDecode(response.body);
        return {'success': false, 'message': errorData['message'] ?? 'Registration failed.'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error. Please try again later.'};
    }
  }

  // Refresh Token Method
  static Future<bool> refreshToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final refreshToken = prefs.getString('refresh_token');
      
      if (refreshToken == null) return false;

      final response = await http.post(
        Uri.parse(ApiConstants.refreshTokenUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'refreshToken': refreshToken}),
      );

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final data = body['data'];
        
        if (data != null && data['accessToken'] != null) {
          await prefs.setString('jwt_token', data['accessToken']);
          if (data['refreshToken'] != null) {
            await prefs.setString('refresh_token', data['refreshToken']);
          }
          return true;
        }
      }
      return false;
    } catch (e) {
      return false;
    }
  }
  
  // Logout Method
  static Future<void> logout() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');
      final refreshToken = prefs.getString('refresh_token');

      if (token != null && refreshToken != null) {
        await http.post(
          Uri.parse(ApiConstants.logoutUrl),
          headers: {
            'Authorization': 'Bearer $token',
            'Content-Type': 'application/json',
          },
          body: jsonEncode({'refreshToken': refreshToken}),
        );
      }
    } catch (e) {
      // Ignore error during logout
    } finally {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('jwt_token');
      await prefs.remove('refresh_token');
      await prefs.remove('user_id');
    }
  }

  // Send OTP
  static Future<Map<String, dynamic>> sendOtp(String email) async {
    try {
      final response = await http.post(
        Uri.parse(ApiConstants.sendOtpUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email}),
      );

      if (response.statusCode == 200) {
        return {'success': true, 'message': 'OTP sent successfully.'};
      } else {
        final data = jsonDecode(response.body);
        return {'success': false, 'message': data['message'] ?? 'Failed to send OTP.'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error.'};
    }
  }

  // Verify OTP
  static Future<Map<String, dynamic>> verifyOtp(String email, String code) async {
    try {
      final response = await http.post(
        Uri.parse(ApiConstants.verifyOtpUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'otpCode': code}),
      );

      if (response.statusCode == 200) {
        return {'success': true, 'message': 'OTP verified successfully.'};
      } else {
        final data = jsonDecode(response.body);
        return {'success': false, 'message': data['message'] ?? 'Invalid OTP.'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error.'};
    }
  }

  // Get Profile Method (Me)
  static Future<Map<String, dynamic>?> getProfile() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');
      
      if (token == null) return null;
      
      final response = await http.get(
        Uri.parse(ApiConstants.profileUrl),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else if (response.statusCode == 401) {
        // Try refresh token
        final refreshed = await refreshToken();
        if (refreshed) return getProfile();
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // Update Profile
  static Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> profileData) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');
      
      if (token == null) return {'success': false, 'message': 'Not authenticated'};
      
      final response = await http.put(
        Uri.parse(ApiConstants.updateProfileUrl),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode(profileData),
      );

      if (response.statusCode == 200) {
        return {'success': true, 'data': jsonDecode(response.body)};
      } else {
        final data = jsonDecode(response.body);
        return {'success': false, 'message': data['message'] ?? 'Update failed.'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error.'};
    }
  }

  // Change Password
  static Future<Map<String, dynamic>> changePassword(String currentPassword, String newPassword) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');
      
      if (token == null) return {'success': false, 'message': 'Not authenticated'};
      
      final response = await http.patch(
        Uri.parse(ApiConstants.changePasswordUrl),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        }),
      );

      if (response.statusCode == 200) {
        return {'success': true, 'message': 'Password changed successfully.'};
      } else {
        final data = jsonDecode(response.body);
        return {'success': false, 'message': data['message'] ?? 'Failed to change password.'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error.'};
    }
  }

  // Google Login
  static Future<Map<String, dynamic>> googleLogin(String idToken) async {
    try {
      final response = await http.post(
        Uri.parse(ApiConstants.googleLoginUrl),
        headers: {
          'Content-Type': 'application/json',
          'X-Platform': 'Mobile'
        },
        body: jsonEncode({'idToken': idToken}),
      );

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final data = body['data'];
        
        if (data != null) {
          final prefs = await SharedPreferences.getInstance();
          if (data['accessToken'] != null) {
            await prefs.setString('jwt_token', data['accessToken']);
          }
          if (data['refreshToken'] != null) {
            await prefs.setString('refresh_token', data['refreshToken']);
          }
          if (data['user'] != null && data['user']['id'] != null) {
             await prefs.setString('user_id', data['user']['id'].toString());
          }
        }
        return {'success': true, 'data': body};
      } else {
        final errorData = jsonDecode(response.body);
        return {'success': false, 'message': errorData['message'] ?? 'Google login failed.'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error.'};
    }
  }

  // Forgot Password
  static Future<Map<String, dynamic>> forgotPassword(String email) async {
    try {
      final response = await http.post(
        Uri.parse(ApiConstants.forgotPasswordUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email}),
      );

      if (response.statusCode == 200) {
        return {'success': true, 'message': 'Reset link/OTP sent to your email.'};
      } else {
        final data = jsonDecode(response.body);
        return {'success': false, 'message': data['message'] ?? 'Failed to initiate password reset.'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error.'};
    }
  }

  // Reset Password
  static Future<Map<String, dynamic>> resetPassword(String email, String token, String newPassword) async {
    try {
      final response = await http.post(
        Uri.parse(ApiConstants.resetPasswordUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'token': token,
          'newPassword': newPassword,
        }),
      );

      if (response.statusCode == 200) {
        return {'success': true, 'message': 'Password reset successfully.'};
      } else {
        final data = jsonDecode(response.body);
        return {'success': false, 'message': data['message'] ?? 'Failed to reset password.'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error.'};
    }
  }

  // Check if user is logged in
  static Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    return token != null && token.isNotEmpty;
  }
}
