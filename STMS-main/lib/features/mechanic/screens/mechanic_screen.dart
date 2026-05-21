// lib/features/mechanic/screens/mechanic_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:camera/camera.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/providers/app_providers.dart';
import '../../../../core/user_provider.dart';

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

  // Camera
  CameraController? _cameraController;
  bool _isCameraInitialized = false;
  bool _isCameraPermissionGranted = false;
  String? _cameraError;

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

    // Request camera permission and init camera
    _requestCameraPermission();

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

  Future<void> _requestCameraPermission() async {
    final status = await Permission.camera.request();
    if (mounted) {
      setState(() {
        _isCameraPermissionGranted = status.isGranted;
      });
      if (status.isGranted) {
        await _initCamera();
      } else if (status.isPermanentlyDenied) {
        setState(() {
          _cameraError = 'Camera permission permanently denied. Please enable it from Settings.';
        });
        _showPermissionDeniedDialog();
      } else {
        setState(() {
          _cameraError = 'Camera permission is required for the mechanic to see the issue.';
        });
      }
    }
  }

  void _showPermissionDeniedDialog() {
    if (!mounted) return;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Camera Permission Required',
            style: TextStyle(color: AppColors.white)),
        content: const Text(
          'The camera is needed so the mechanic can see your car issue. Please enable camera access in your device settings.',
          style: TextStyle(color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel',
                style: TextStyle(color: AppColors.textSecondary)),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              openAppSettings();
            },
            child: const Text('Open Settings',
                style: TextStyle(
                    color: AppColors.accent, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }

  Future<void> _initCamera() async {
    try {
      final cameras = await availableCameras();
      if (cameras.isEmpty) {
        setState(() {
          _cameraError = 'No camera found on this device.';
        });
        return;
      }

      // Use the back camera (first one usually)
      final backCamera = cameras.firstWhere(
        (cam) => cam.lensDirection == CameraLensDirection.back,
        orElse: () => cameras.first,
      );

      _cameraController = CameraController(
        backCamera,
        ResolutionPreset.medium,
        enableAudio: false,
      );

      await _cameraController!.initialize();
      if (mounted) {
        setState(() {
          _isCameraInitialized = true;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _cameraError = 'Failed to initialize camera: $e';
        });
      }
    }
  }

  Future<void> _toggleCamera(bool enable) async {
    if (enable) {
      if (!_isCameraPermissionGranted) {
        await _requestCameraPermission();
        return;
      }
      if (_cameraController == null) {
        await _initCamera();
      } else if (!_isCameraInitialized) {
        await _initCamera();
      }
    } else {
      // Pause the camera preview when video is off
      if (_cameraController != null && _isCameraInitialized) {
        // We keep the controller alive but just toggle the UI
      }
    }
    ref.read(videoEnabledProvider.notifier).state = enable;
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

  String get _userName {
    final first = userProvider.firstName;
    final last = userProvider.lastName;
    if (first.isEmpty && last.isEmpty) return 'User';
    if (last.isNotEmpty) {
      return '$first ${last[0]}.';
    }
    return first;
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _scanController.dispose();
    _cameraController?.dispose();
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
          // ── Background: Camera feed or fallback ──────────────────────────
          _buildVideoBackground(videoEnabled),

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
                  // User info (dynamic name)
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 7),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha:0.5),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                          color: Colors.white.withValues(alpha:0.15)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.engineering_rounded,
                            color: AppColors.accent, size: 16),
                        const SizedBox(width: 6),
                        Text(
                          _userName,
                          style: const TextStyle(
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

  Widget _buildVideoBackground(bool videoEnabled) {
    return Container(
      width: double.infinity,
      height: double.infinity,
      decoration: const BoxDecoration(color: Color(0xFF050810)),
      child: Stack(
        children: [
          // Show camera preview or fallback
          if (videoEnabled && _isCameraInitialized && _cameraController != null)
            SizedBox.expand(
              child: FittedBox(
                fit: BoxFit.cover,
                child: SizedBox(
                  width: _cameraController!.value.previewSize?.height ?? 1,
                  height: _cameraController!.value.previewSize?.width ?? 1,
                  child: CameraPreview(_cameraController!),
                ),
              ),
            )
          else if (videoEnabled && !_isCameraInitialized && _cameraError != null)
            // Show error message
            Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.videocam_off_rounded,
                        color: AppColors.accent.withValues(alpha: 0.4), size: 64),
                    const SizedBox(height: 16),
                    Text(
                      _cameraError!,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 13,
                      ),
                    ),
                    const SizedBox(height: 16),
                    GestureDetector(
                      onTap: _requestCameraPermission,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 20, vertical: 10),
                        decoration: BoxDecoration(
                          color: AppColors.accent.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                              color: AppColors.accent.withValues(alpha: 0.5)),
                        ),
                        child: const Text(
                          'Retry',
                          style: TextStyle(
                            color: AppColors.accent,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            )
          else if (!videoEnabled)
            // Camera off - show car icon placeholder
            Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Opacity(
                    opacity: 0.15,
                    child: Icon(
                      Icons.videocam_off_rounded,
                      size: 120,
                      color: AppColors.accent,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Camera is off',
                    style: TextStyle(
                      color: AppColors.textMuted,
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            )
          else
            // Loading camera
            Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  SizedBox(
                    width: 40,
                    height: 40,
                    child: CircularProgressIndicator(
                      color: AppColors.accent,
                      strokeWidth: 2,
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Starting camera...',
                    style: TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 13,
                    ),
                  ),
                ],
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
              onTap: () => _toggleCamera(!videoEnabled),
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
