import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../services/auth_service.dart';
import '../../main.dart' show navigatorKey;

class ApiClient {
  static http.Client client = http.Client();

  static Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    
    return {
      'Content-Type': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  static Future<http.Response> _handleResponse(
      http.Response response, Future<http.Response> Function() retry) async {
    if (response.statusCode == 401) {
      final success = await AuthService.refreshToken();
      if (success) {
        return await retry();
      } else {
        await AuthService.logout();
        navigatorKey.currentState?.pushNamedAndRemoveUntil('/splash', (route) => false);
      }
    }
    return response;
  }

  static Future<http.Response> get(String url) async {
    final headers = await _getHeaders();
    final response = await client.get(Uri.parse(url), headers: headers);
    return await _handleResponse(response, () => get(url));
  }

  static Future<http.Response> post(String url, Map<String, dynamic> body) async {
    final headers = await _getHeaders();
    final response = await client.post(
      Uri.parse(url),
      headers: headers,
      body: jsonEncode(body),
    );
    return await _handleResponse(response, () => post(url, body));
  }

  static Future<http.Response> put(String url, Map<String, dynamic> body) async {
    final headers = await _getHeaders();
    final response = await client.put(
      Uri.parse(url),
      headers: headers,
      body: jsonEncode(body),
    );
    return await _handleResponse(response, () => put(url, body));
  }

  static Future<http.Response> patch(String url, Map<String, dynamic> body) async {
    final headers = await _getHeaders();
    final response = await client.patch(
      Uri.parse(url),
      headers: headers,
      body: jsonEncode(body),
    );
    return await _handleResponse(response, () => patch(url, body));
  }

  static Future<http.Response> delete(String url) async {
    final headers = await _getHeaders();
    final response = await client.delete(Uri.parse(url), headers: headers);
    return await _handleResponse(response, () => delete(url));
  }

  static Future<http.Response> upload(String url, File file, {String folder = 'misc'}) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');

    var request = http.MultipartRequest('POST', Uri.parse('$url?folder=$folder'));
    
    if (token != null && token.isNotEmpty) {
      request.headers['Authorization'] = 'Bearer $token';
    }

    request.files.add(await http.MultipartFile.fromPath('file', file.path));

    var streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);
    return await _handleResponse(response, () => upload(url, file, folder: folder));
  }
}
