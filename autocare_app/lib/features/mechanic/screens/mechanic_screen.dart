// lib/features/mechanic/screens/mechanic_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/providers/app_providers.dart';

class MechanicScreen extends ConsumerStatefulWidget {
  const MechanicScreen({super.key});

  @override
  ConsumerState<MechanicScreen> createState() => _MechanicScreenState();
}

class _MechanicScreenState extends ConsumerState<MechanicScreen>
    with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late AnimationController _scanController;
  late Animation<double> _pulseAnim;
  late Animation<double> _scanAnim;
  String _statusText = 'Connecting to mechanic...';
  int _callSeconds = 0;
  bool _isConnected = false;

  @override
  void initState() {
    super.initState();
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);

    _scanController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat();

    _pulseAnim = Tween<double>(begin: 0.6, end: 1.0).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _scanAnim = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _scanController, curve: Curves.linear),
    );

    // Simulate connection sequence
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _isConnected = true;
          _statusText = 'Diagnosing... Analyzing engine sound and visual inspection';
        });
        _startCallTimer();
      }
    });
  }

  void _startCallTimer() {
    Future.doWhile(() async {
      await Future.delayed(const Duration(seconds: 1));
      if (!mounted) return false;
      setState(() => _callSeconds++);
      return mounted && _isConnected;
    });
  }

  String get _formattedTime {
    final m = (_callSeconds ~/ 60).toString().padLeft(2, '0');
    final s = (_callSeconds % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _scanController.dispose();
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final micEnabled = ref.watch(micEnabledProvider);
    final videoEnabled = ref.watch(videoEnabledProvider);

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // ── Background "video feed" ──────────────────────────────────────
          _buildVideoBackground(),

          // ── Scan line overlay when connected ─────────────────────────────
          if (_isConnected) _buildScanOverlay(),

          // ── Top bar ──────────────────────────────────────────────────────
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Back
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha:0.5),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                            color: Colors.white.withValues(alpha:0.15)),
                      ),
                      child: const Icon(Icons.arrow_back_ios_rounded,
                          color: Colors.white, size: 16),
                    ),
                  ),
                  // Call info
                  if (_isConnected)
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 7),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha:0.6),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                            color: AppColors.accent.withValues(alpha:0.4)),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 6,
                            height: 6,
                            decoration: BoxDecoration(
                              color: AppColors.success,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.success.withValues(alpha:0.5),
                                  blurRadius: 4,
                                )
                              ],
                            ),
                          ),
                          const SizedBox(width: 7),
                          Text(
                            'LIVE · $_formattedTime',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                    )
                  else
                    const SizedBox(),
                  // Mechanic info
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 7),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha:0.5),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                          color: Colors.white.withValues(alpha:0.15)),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.engineering_rounded,
                            color: AppColors.accent, size: 16),
                        SizedBox(width: 6),
                        Text(
                          'Ahmed K.',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Picture-in-picture (user camera) ─────────────────────────────
          Positioned(
            top: MediaQuery.of(context).padding.top + 70,
            right: 16,
            child: _buildPipCamera(videoEnabled),
          ),

          // ── AI diagnostics panel ─────────────────────────────────────────
          if (_isConnected) _buildDiagnosticsPanel(),

          // ── Bottom status banner + controls ─────────────────────────────
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Status banner
                _buildStatusBanner(),
                // Controls
                _buildControls(micEnabled, videoEnabled, context),
              ],
            ),
          ),

          // ── Connecting overlay ────────────────────────────────────────────
          if (!_isConnected) _buildConnectingOverlay(),
        ],
      ),
    );
  }

  Widget _buildVideoBackground() {
    return Container(
      width: double.infinity,
      height: double.infinity,
      decoration: const BoxDecoration(color: Color(0xFF050810)),
      child: Stack(
        children: [
          // Simulated dark car engine environment
          Center(
            child: Opacity(
              opacity: 0.15,
              child: Icon(
                Icons.directions_car_rounded,
                size: 280,
                color: AppColors.accent,
              ),
            ),
          ),
          // Grid overlay for tech feel
          CustomPaint(
            size: Size.infinite,
            painter: _GridPainter(),
          ),
        ],
      ),
    );
  }

  Widget _buildScanOverlay() {
    return AnimatedBuilder(
      animation: _scanAnim,
      builder: (context, _) {
        return Positioned(
          top: MediaQuery.of(context).size.height * _scanAnim.value - 2,
          left: 0,
          right: 0,
          child: Container(
            height: 2,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Colors.transparent,
                  AppColors.accent.withValues(alpha:0.6),
                  AppColors.accent,
                  AppColors.accent.withValues(alpha:0.6),
                  Colors.transparent,
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildPipCamera(bool videoEnabled) {
    return Container(
      width: 100,
      height: 140,
      decoration: BoxDecoration(
        color: videoEnabled ? const Color(0xFF0A1020) : Colors.black,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.accent.withValues(alpha:0.5), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: AppColors.accent.withValues(alpha:0.15),
            blurRadius: 12,
            spreadRadius: 2,
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Stack(
          children: [
            if (videoEnabled)
              Center(
                child: Icon(
                  Icons.person_rounded,
                  color: AppColors.accent.withValues(alpha:0.3),
                  size: 48,
                ),
              )
            else
              Container(
                color: Colors.black,
                child: const Center(
                  child: Icon(Icons.videocam_off_rounded,
                      color: AppColors.textMuted, size: 28),
                ),
              ),
            // Corner label
            Positioned(
              bottom: 6,
              left: 0,
              right: 0,
              child: Center(
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha:0.7),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: const Text(
                    'You',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.w600),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDiagnosticsPanel() {
    return Positioned(
      left: 16,
      bottom: 220,
      child: AnimatedBuilder(
        animation: _pulseAnim,
        builder: (context, child) => Opacity(
          opacity: _pulseAnim.value,
          child: child,
        ),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.black.withValues(alpha:0.7),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.accent.withValues(alpha:0.3)),
          ),
          child: const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.analytics_rounded,
                      color: AppColors.accent, size: 14),
                  SizedBox(width: 6),
                  Text(
                    'AI DIAGNOSTICS',
                    style: TextStyle(
                      color: AppColors.accent,
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1,
                    ),
                  ),
                ],
              ),
              SizedBox(height: 8),
              _DiagRow(label: 'Engine Sound', value: 'Analyzing...', icon: Icons.volume_up_rounded),
              SizedBox(height: 4),
              _DiagRow(label: 'Visual Scan', value: 'In Progress', icon: Icons.remove_red_eye_rounded),
              SizedBox(height: 4),
              _DiagRow(label: 'Error Codes', value: 'Reading OBD...', icon: Icons.code_rounded),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBanner() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.black.withValues(alpha:0.75),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: AppColors.accent.withValues(alpha:0.6),
            width: 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: AppColors.accent.withValues(alpha:0.1),
              blurRadius: 12,
              spreadRadius: 0,
            ),
          ],
        ),
        child: Row(
          children: [
            AnimatedBuilder(
              animation: _pulseAnim,
              builder: (_, __) => Opacity(
                opacity: _pulseAnim.value,
                child: Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: AppColors.accent,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.accent.withValues(alpha:0.8),
                        blurRadius: 6,
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                _statusText,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildControls(
      bool micEnabled, bool videoEnabled, BuildContext context) {
    return SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(40, 0, 40, 24),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            // Video toggle
            _ControlButton(
              icon: videoEnabled ? Icons.videocam_rounded : Icons.videocam_off_rounded,
              label: videoEnabled ? 'Video' : 'Video Off',
              isActive: videoEnabled,
              onTap: () => ref.read(videoEnabledProvider.notifier).state =
                  !videoEnabled,
            ),
            // End call
            GestureDetector(
              onTap: () {
                showDialog(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    backgroundColor: AppColors.surface,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16)),
                    title: const Text('End Call?',
                        style: TextStyle(color: AppColors.white)),
                    content: const Text(
                      'Are you sure you want to end the mechanic call? You can book a repair service if needed.',
                      style: TextStyle(color: AppColors.textSecondary),
                    ),
                    actions: [
                      TextButton(
                          onPressed: () => Navigator.pop(ctx),
                          child: const Text('Cancel',
                              style:
                                  TextStyle(color: AppColors.textSecondary))),
                      TextButton(
                          onPressed: () {
                            Navigator.pop(ctx);
                            Navigator.pop(context);
                            Navigator.pushNamed(context, '/maintenance');
                          },
                          child: const Text('Book Repair',
                              style: TextStyle(
                                  color: AppColors.accent,
                                  fontWeight: FontWeight.w700))),
                      TextButton(
                          onPressed: () {
                            Navigator.pop(ctx);
                            Navigator.pop(context);
                          },
                          child: const Text('End Call',
                              style: TextStyle(
                                  color: AppColors.error,
                                  fontWeight: FontWeight.w700))),
                    ],
                  ),
                );
              },
              child: Container(
                width: 68,
                height: 68,
                decoration: BoxDecoration(
                  color: AppColors.error,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.error.withValues(alpha:0.4),
                      blurRadius: 16,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                child: const Icon(Icons.call_end_rounded,
                    color: Colors.white, size: 28),
              ),
            ),
            // Mic toggle
            _ControlButton(
              icon: micEnabled ? Icons.mic_rounded : Icons.mic_off_rounded,
              label: micEnabled ? 'Mic' : 'Muted',
              isActive: micEnabled,
              onTap: () => ref.read(micEnabledProvider.notifier).state =
                  !micEnabled,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildConnectingOverlay() {
    return Container(
      color: Colors.black.withValues(alpha:0.75),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedBuilder(
              animation: _pulseAnim,
              builder: (_, child) => Transform.scale(
                scale: _pulseAnim.value,
                child: child,
              ),
              child: Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppColors.accent.withValues(alpha:0.15),
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.accent, width: 2),
                ),
                child: const Icon(Icons.engineering_rounded,
                    color: AppColors.accent, size: 36),
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Connecting to\nAvailable Mechanic...',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w700,
                height: 1.4,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            const Text(
              'Average wait time: ~30 seconds',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
            ),
          ],
        ),
      ),
    );
  }
}

class _DiagRow extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _DiagRow(
      {required this.label, required this.value, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: AppColors.accent.withValues(alpha:0.7), size: 11),
        const SizedBox(width: 5),
        Text(label,
            style: const TextStyle(
                color: AppColors.textMuted, fontSize: 10)),
        const SizedBox(width: 6),
        Text(value,
            style: const TextStyle(
                color: AppColors.white,
                fontSize: 10,
                fontWeight: FontWeight.w600)),
      ],
    );
  }
}

class _ControlButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isActive;
  final VoidCallback onTap;

  const _ControlButton({
    required this.icon,
    required this.label,
    required this.isActive,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            width: 54,
            height: 54,
            decoration: BoxDecoration(
              color: isActive
                  ? Colors.white.withValues(alpha:0.12)
                  : AppColors.error.withValues(alpha:0.2),
              shape: BoxShape.circle,
              border: Border.all(
                color: isActive
                    ? Colors.white.withValues(alpha:0.25)
                    : AppColors.error.withValues(alpha:0.5),
              ),
            ),
            child: Icon(icon,
                color: isActive ? Colors.white : AppColors.error, size: 22),
          ),
          const SizedBox(height: 6),
          Text(label,
              style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 10,
                  fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}

class _GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFFD4FF00).withValues(alpha:0.04)
      ..strokeWidth = 0.5;

    const spacing = 40.0;
    for (double x = 0; x < size.width; x += spacing) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y < size.height; y += spacing) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(_) => false;
}
