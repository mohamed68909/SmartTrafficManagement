// lib/features/profile/screens/live_chat_screen.dart
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/shared_widgets.dart';
import '../../../../core/network/api_constants.dart';

class LiveChatScreen extends StatefulWidget {
  const LiveChatScreen({super.key});

  @override
  State<LiveChatScreen> createState() => _LiveChatScreenState();
}

class _ChatMessage {
  final String text;
  final bool isMe;
  final DateTime time;
  _ChatMessage({required this.text, required this.isMe, required this.time});
}

class _LiveChatScreenState extends State<LiveChatScreen> {
  final _controller = TextEditingController();
  final _scrollCtrl = ScrollController();
  final List<_ChatMessage> _messages = [];
  bool _isLoading = true;
  bool _isSending = false;
  String? _ticketId;
  String? _token;

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('jwt_token');
    if (_token == null) {
      setState(() => _isLoading = false);
      return;
    }
    await _openOrFetchTicket();
    setState(() => _isLoading = false);
  }

  Future<void> _openOrFetchTicket() async {
    try {
      // First try to get existing open ticket
      final myTicketsResp = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/support/tickets/my'),
        headers: {'Authorization': 'Bearer $_token'},
      );
      if (myTicketsResp.statusCode == 200) {
        final body = jsonDecode(myTicketsResp.body);
        final tickets = body['data'] as List<dynamic>? ?? [];
        final openTicket = tickets.firstWhere(
          (t) => t['status'] == 'Open',
          orElse: () => null,
        );
        if (openTicket != null) {
          _ticketId = openTicket['id'];
          await _loadHistory();
          return;
        }
      }

      // Open a new ticket
      final openResp = await http.post(
        Uri.parse('${ApiConstants.baseUrl}/support/tickets/open'),
        headers: {'Authorization': 'Bearer $_token', 'Content-Type': 'application/json'},
        body: jsonEncode({'subject': 'Live Support Chat', 'message': 'Hello, I need help.'}),
      );
      if (openResp.statusCode == 200 || openResp.statusCode == 201) {
        final body = jsonDecode(openResp.body);
        _ticketId = body['data']?['id'];
        // Seed welcome message
        setState(() {
          _messages.add(_ChatMessage(
            text: '👋 Hi! Welcome to AutoCare Support. How can we help you today?',
            isMe: false,
            time: DateTime.now(),
          ));
        });
      }
    } catch (e) {
      // keep empty chat if network error
    }
  }

  Future<void> _loadHistory() async {
    if (_ticketId == null) return;
    try {
      final resp = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/chat/history/$_ticketId'),
        headers: {'Authorization': 'Bearer $_token'},
      );
      if (resp.statusCode == 200) {
        final body = jsonDecode(resp.body);
        final msgs = body['data'] as List<dynamic>? ?? [];
        final prefs = await SharedPreferences.getInstance();
        final myId = prefs.getString('user_id') ?? '';
        setState(() {
          _messages.clear();
          for (final m in msgs) {
            _messages.add(_ChatMessage(
              text: m['message'] ?? '',
              isMe: m['senderId'] == myId,
              time: DateTime.tryParse(m['sentOnUtc'] ?? '') ?? DateTime.now(),
            ));
          }
        });
        _scrollToBottom();
      }
    } catch (e) {
      // ignore
    }
  }

  Future<void> _sendMessage() async {
    final text = _controller.text.trim();
    if (text.isEmpty || _ticketId == null) return;
    _controller.clear();

    final msg = _ChatMessage(text: text, isMe: true, time: DateTime.now());
    setState(() {
      _messages.add(msg);
      _isSending = true;
    });
    _scrollToBottom();

    try {
      await http.post(
        Uri.parse('${ApiConstants.baseUrl}/chat/send'),
        headers: {
          'Authorization': 'Bearer $_token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({'ticketId': _ticketId, 'message': text, 'type': 0}),
      );
    } catch (_) {}

    setState(() => _isSending = false);
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: buildAppBar(context, title: 'Live Chat', showBack: true,
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.success.withOpacity(0.15),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.success.withOpacity(0.4)),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                CircleAvatar(radius: 4, backgroundColor: AppColors.success),
                SizedBox(width: 5),
                Text('Support Online', style: TextStyle(color: AppColors.success, fontSize: 11, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.accent))
          : Column(
              children: [
                Expanded(
                  child: _messages.isEmpty
                      ? const Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.chat_bubble_outline_rounded, color: AppColors.textMuted, size: 48),
                              SizedBox(height: 12),
                              Text('Start a conversation', style: TextStyle(color: AppColors.textSecondary, fontSize: 14)),
                            ],
                          ),
                        )
                      : ListView.builder(
                          controller: _scrollCtrl,
                          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                          itemCount: _messages.length,
                          itemBuilder: (_, i) => _buildBubble(_messages[i]),
                        ),
                ),
                _buildInputBar(),
              ],
            ),
    );
  }

  Widget _buildBubble(_ChatMessage msg) {
    return Align(
      alignment: msg.isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: msg.isMe ? AppColors.accent : AppColors.surface,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(msg.isMe ? 16 : 4),
            bottomRight: Radius.circular(msg.isMe ? 4 : 16),
          ),
          border: msg.isMe ? null : Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: msg.isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: [
            Text(
              msg.text,
              style: TextStyle(
                color: msg.isMe ? AppColors.background : AppColors.white,
                fontSize: 14,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '${msg.time.hour.toString().padLeft(2,'0')}:${msg.time.minute.toString().padLeft(2,'0')}',
              style: TextStyle(
                color: msg.isMe ? AppColors.background.withOpacity(0.6) : AppColors.textMuted,
                fontSize: 10,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInputBar() {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _controller,
              style: const TextStyle(color: AppColors.white, fontSize: 14),
              maxLines: null,
              decoration: InputDecoration(
                hintText: 'Type a message...',
                hintStyle: TextStyle(color: AppColors.textMuted),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                  borderSide: BorderSide(color: AppColors.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                  borderSide: BorderSide(color: AppColors.border),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                  borderSide: const BorderSide(color: AppColors.accent),
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                filled: true,
                fillColor: AppColors.background,
              ),
              onSubmitted: (_) => _sendMessage(),
            ),
          ),
          const SizedBox(width: 10),
          GestureDetector(
            onTap: _isSending ? null : _sendMessage,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 46,
              height: 46,
              decoration: BoxDecoration(
                color: _isSending ? AppColors.border : AppColors.accent,
                shape: BoxShape.circle,
              ),
              child: _isSending
                  ? const Padding(
                      padding: EdgeInsets.all(12),
                      child: CircularProgressIndicator(color: AppColors.background, strokeWidth: 2),
                    )
                  : const Icon(Icons.send_rounded, color: AppColors.background, size: 20),
            ),
          ),
        ],
      ),
    );
  }
}
