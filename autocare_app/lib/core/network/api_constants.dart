import 'dart:io';
import 'package:flutter/foundation.dart';

class ApiConstants {
  // تفعيل السيرفر الحقيقي (Production)
  static const bool isProduction = false;

  static String get baseUrl {
    if (isProduction) {
      return 'https://smarttrafficmanagement.runasp.net/api';
    }
    
    // Local HTTPS URLs for backend
    if (kIsWeb) return 'https://localhost:7188/api';
    if (Platform.isAndroid) return 'https://10.0.2.2:7188/api';
    return 'https://localhost:7188/api';
  }
  
  // Auth
  static String get loginUrl => '$baseUrl/Auth/login';
  static String get registerUrl => '$baseUrl/Auth/register';
  static String get refreshTokenUrl => '$baseUrl/Auth/refresh-token';
  static String get logoutUrl => '$baseUrl/Auth/logout';
  static String get sendOtpUrl => '$baseUrl/Auth/send-otp';
  static String get verifyOtpUrl => '$baseUrl/Auth/verify-otp';
  static String get forgotPasswordUrl => '$baseUrl/Auth/forgot-password';
  static String get resetPasswordUrl => '$baseUrl/Auth/reset-password';
  static String get googleLoginUrl => '$baseUrl/Auth/google-login';
  static String get changePasswordUrl => '$baseUrl/Auth/change-password';
  static String get profileUrl => '$baseUrl/Auth/profile';
  static String get updateProfileUrl => '$baseUrl/Auth/profile/update';

  // Notifications
  static String get notificationsUrl => '$baseUrl/notifications';
  static String markNotificationReadUrl(String id) => '$baseUrl/notifications/$id/read';

  // Store
  static String get productsUrl => '$baseUrl/store/products';
  static String get categoriesUrl => '$baseUrl/store/categories';
  static String get checkoutUrl => '$baseUrl/store/checkout';

  // Garage
  static String get garageUrl => '$baseUrl/garage';

  // SOS & Emergency
  static String get sosRequestUrl => '$baseUrl/sos/request';
  static String get sosHistoryUrl => '$baseUrl/sos/history';
  static String sosStatusUrl(String id) => '$baseUrl/sos/status/$id';
  static String sosCancelUrl(String id) => '$baseUrl/sos/cancel/$id';
  static String sosAcceptUrl(String id) => '$baseUrl/sos/accept/$id';

  // Traffic
  static String get trafficReportUrl => '$baseUrl/traffic/report';
  static String get trafficIncidentsUrl => '$baseUrl/trafficincidents';
  static String trafficIncidentsByLocationUrl(String loc) => '$baseUrl/trafficincidents/by-location?location=$loc';

  // Cart
  static String get cartUrl => '$baseUrl/cart';
  static String get cartItemsUrl => '$baseUrl/cart/items';
  static String cartItemUrl(String id) => '$baseUrl/cart/items/$id';

  // Profile & Support
  static String get ratingsMyUrl => '$baseUrl/ratings/my';
  static String get supportTicketsMyUrl => '$baseUrl/support/tickets/my';
  static String supportCloseUrl(String id) => '$baseUrl/support/close/$id';
  static String chatHistoryUrl(String ticketId) => '$baseUrl/chat/history/$ticketId';
  static String get chatSendUrl => '$baseUrl/chat/send';

  // Orders
  static String get ordersUrl => '$baseUrl/orders/my';
  static String orderDetailsUrl(String id) => '$baseUrl/orders/$id';

  // Payments / Cards
  static String get cardsUrl => '$baseUrl/payments/cards';
  static String deleteCardUrl(String id) => '$baseUrl/payments/cards/$id';
  static String get stripeConfigUrl => '$baseUrl/payments/stripe/config';

  // Sensors & Upload
  static String get sensorsVehicleEnvUrl => '$baseUrl/sensors/vehicle-env';
  static String get uploadUrl => '$baseUrl/upload';
  static String get uploadMultipleUrl => '$baseUrl/upload/multiple';
}
