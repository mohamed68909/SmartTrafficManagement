import 'package:flutter/foundation.dart';
import 'package:signalr_netcore/signalr_client.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../network/api_constants.dart';

class SignalRService {
  static final SignalRService _instance = SignalRService._internal();
  factory SignalRService() => _instance;
  SignalRService._internal();

  HubConnection? _hubConnection;
  bool _isConnecting = false;

  HubConnection? get connection => _hubConnection;

  Future<void> initConnection() async {
    if (_hubConnection != null && _hubConnection!.state == HubConnectionState.Connected) {
      return;
    }
    if (_isConnecting) return;
    _isConnecting = true;

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');

      // Swap /api with /hubs/traffic
      final String hubUrl = ApiConstants.baseUrl.replaceAll('/api', '/hubs/traffic');

      final httpOptions = HttpConnectionOptions(
        accessTokenFactory: () async => token ?? '',
      );

      _hubConnection = HubConnectionBuilder()
          .withUrl(hubUrl, options: httpOptions)
          .withAutomaticReconnect()
          .build();

      _hubConnection!.onclose(({error}) {
        debugPrint('SignalR: Connection closed: $error');
      });

      _hubConnection!.onreconnecting(({error}) {
        debugPrint('SignalR: Reconnecting: $error');
      });

      _hubConnection!.onreconnected(({connectionId}) {
        debugPrint('SignalR: Reconnected with connectionId: $connectionId');
      });

      await _hubConnection!.start();
      debugPrint('SignalR: Connection started successfully');
    } catch (e) {
      debugPrint('SignalR: Error starting connection: $e');
    } finally {
      _isConnecting = false;
    }
  }

  Future<void> stopConnection() async {
    try {
      if (_hubConnection != null && _hubConnection!.state == HubConnectionState.Connected) {
        await _hubConnection!.stop();
        debugPrint('SignalR: Connection stopped');
      }
    } catch (e) {
      debugPrint('SignalR: Error stopping connection: $e');
    }
  }

  /// Join a SignalR group for chat
  Future<void> joinTicketRoom(String ticketId) async {
    if (_hubConnection == null || _hubConnection!.state != HubConnectionState.Connected) {
      await initConnection();
    }
    try {
      await _hubConnection?.invoke('JoinTicketRoom', args: [ticketId]);
      debugPrint('SignalR: Joined room $ticketId');
    } catch (e) {
      debugPrint('SignalR: Error joining ticket room: $e');
    }
  }

  /// Listen to message events from the hub
  void registerMessageListener(Function(dynamic) onMessageReceived) {
    _hubConnection?.on('ReceiveMessage', (arguments) {
      if (arguments != null && arguments.isNotEmpty) {
        onMessageReceived(arguments[0]);
      }
    });
  }

  /// Unregister message events from the hub
  void unregisterMessageListener() {
    _hubConnection?.off('ReceiveMessage');
  }
}
