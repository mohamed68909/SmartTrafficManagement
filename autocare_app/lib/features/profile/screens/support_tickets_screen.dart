import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/shared_widgets.dart';
import '../../../core/services/support_service.dart';
import 'chat_screen.dart';

class SupportTicketsScreen extends StatefulWidget {
  const SupportTicketsScreen({super.key});

  @override
  State<SupportTicketsScreen> createState() => _SupportTicketsScreenState();
}

class _SupportTicketsScreenState extends State<SupportTicketsScreen> {
  List<dynamic> _tickets = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadTickets();
  }

  Future<void> _loadTickets() async {
    setState(() => _isLoading = true);
    final data = await SupportService.getMyTickets();
    setState(() {
      _tickets = data;
      _isLoading = false;
    });
  }

  void _showCreateTicketDialog() {
    final subjectCtrl = TextEditingController();
    final messageCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.surface,
        title: const Text('Open New Ticket', style: TextStyle(color: AppColors.white)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: subjectCtrl,
              style: const TextStyle(color: AppColors.white),
              decoration: const InputDecoration(labelText: 'Subject', labelStyle: TextStyle(color: AppColors.textSecondary)),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: messageCtrl,
              maxLines: 3,
              style: const TextStyle(color: AppColors.white),
              decoration: const InputDecoration(labelText: 'Message', labelStyle: TextStyle(color: AppColors.textSecondary)),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel', style: TextStyle(color: AppColors.textMuted))),
          ElevatedButton(
            onPressed: () async {
              if (subjectCtrl.text.trim().isEmpty || messageCtrl.text.trim().isEmpty) return;
              Navigator.pop(context);
              setState(() => _isLoading = true);
              final result = await SupportService.openTicket(subject: subjectCtrl.text.trim(), message: messageCtrl.text.trim());
              if (result['success'] == true) {
                _loadTickets();
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Ticket opened successfully'), backgroundColor: Colors.green));
                }
              } else {
                setState(() => _isLoading = false);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(result['message'] ?? 'Failed to open ticket'), backgroundColor: Colors.red));
                }
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.accent),
            child: const Text('Submit', style: TextStyle(color: AppColors.background)),
          )
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My Support Tickets'),
        backgroundColor: AppColors.surface,
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.accent))
          : _tickets.isEmpty
              ? _buildEmptyState()
              : RefreshIndicator(
                  onRefresh: _loadTickets,
                  color: AppColors.accent,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _tickets.length,
                    itemBuilder: (context, index) {
                      final ticket = _tickets[index];
                      return _TicketCard(
                        ticket: ticket,
                        onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => ChatScreen(
                              ticketId: ticket['id'].toString(),
                              ticketSubject: ticket['subject'] ?? 'Support',
                            ),
                          ),
                        ).then((_) => _loadTickets()),
                      );
                    },
                  ),
                ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showCreateTicketDialog,
        backgroundColor: AppColors.accent,
        child: const Icon(Icons.add, color: AppColors.background),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.support_agent_rounded, size: 64, color: AppColors.textMuted.withValues(alpha:0.3)),
          const SizedBox(height: 16),
          const Text('No support tickets yet', style: TextStyle(color: AppColors.textSecondary, fontSize: 16)),
          const SizedBox(height: 8),
          const Text('Need help? Open a new ticket below.', style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
        ],
      ),
    );
  }
}

class _TicketCard extends StatelessWidget {
  final dynamic ticket;
  final VoidCallback onTap;

  const _TicketCard({required this.ticket, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final bool isOpen = ticket['status'] == 'Open';
    final color = isOpen ? AppColors.accent : AppColors.textMuted;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: AppCard(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha:0.1),
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: color.withValues(alpha:0.3)),
                  ),
                  child: Text(
                    ticket['status']?.toString().toUpperCase() ?? 'UNKNOWN',
                    style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ),
                Text(
                  ticket['createdAt']?.toString().split('T')[0] ?? '',
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              ticket['subject'] ?? 'No Subject',
              style: const TextStyle(color: AppColors.white, fontSize: 15, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Text(
              ticket['description'] ?? '',
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
            ),
            const SizedBox(height: 12),
            const Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Text('View Chat', style: TextStyle(color: AppColors.accent, fontSize: 12, fontWeight: FontWeight.w600)),
                SizedBox(width: 4),
                Icon(Icons.arrow_forward_ios_rounded, size: 10, color: AppColors.accent),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
