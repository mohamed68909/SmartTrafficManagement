// lib/features/store/screens/payment_success_screen.dart
// Route: /store/payment-success
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:math' as math;
import '../../../../core/theme/app_theme.dart';
import '../../../../core/providers/app_providers.dart';
import '../../../../core/widgets/shared_widgets.dart';
import '../../history/screens/history_screen.dart';

class PaymentSuccessScreen extends ConsumerStatefulWidget {
  final double total;
  final String paymentMethod;
  final String orderId;

  const PaymentSuccessScreen({
    super.key,
    required this.total,
    required this.paymentMethod,
    required this.orderId,
  });

  @override
  ConsumerState<PaymentSuccessScreen> createState() =>
      _PaymentSuccessScreenState();
}

class _PaymentSuccessScreenState extends ConsumerState<PaymentSuccessScreen>
    with TickerProviderStateMixin {
  late AnimationController _checkController;
  late AnimationController _confettiController;
  late AnimationController _fadeController;
  late Animation<double> _checkScale;
  late Animation<double> _checkOpacity;
  late Animation<double> _fadeIn;
  late Animation<double> _slideUp;

  final List<_ConfettiParticle> _particles = [];

  @override
  void initState() {
    super.initState();

    // Generate confetti particles
    final rng = math.Random();
    for (int i = 0; i < 30; i++) {
      _particles.add(_ConfettiParticle(
        x: rng.nextDouble(),
        startY: -0.1 - rng.nextDouble() * 0.3,
        size: 4 + rng.nextDouble() * 6,
        speed: 0.3 + rng.nextDouble() * 0.5,
        color: [
          AppColors.accent,
          const Color(0xFFFFFFFF),
          const Color(0xFF00C853),
          const Color(0xFFFF9800),
          const Color(0xFF2196F3),
        ][rng.nextInt(5)],
        rotation: rng.nextDouble() * math.pi * 2,
        rotationSpeed: (rng.nextDouble() - 0.5) * 10,
      ));
    }

    _checkController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _confettiController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    );
    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );

    _checkScale = TweenSequence([
      TweenSequenceItem(
          tween: Tween<double>(begin: 0.0, end: 1.2)
              .chain(CurveTween(curve: Curves.elasticOut)),
          weight: 70),
      TweenSequenceItem(
          tween: Tween<double>(begin: 1.2, end: 1.0)
              .chain(CurveTween(curve: Curves.easeOut)),
          weight: 30),
    ]).animate(_checkController);

    _checkOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
          parent: _checkController,
          curve: const Interval(0.0, 0.3, curve: Curves.easeIn)),
    );

    _fadeIn = CurvedAnimation(parent: _fadeController, curve: Curves.easeOut);
    _slideUp = Tween<double>(begin: 30, end: 0).animate(
      CurvedAnimation(parent: _fadeController, curve: Curves.easeOut),
    );

    // Sequence animations
    Future.delayed(const Duration(milliseconds: 200), () {
      if (mounted) _checkController.forward();
    });
    Future.delayed(const Duration(milliseconds: 400), () {
      if (mounted) _confettiController.forward();
    });
    Future.delayed(const Duration(milliseconds: 700), () {
      if (mounted) _fadeController.forward();
    });
  }

  @override
  void dispose() {
    _checkController.dispose();
    _confettiController.dispose();
    _fadeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          // ── Confetti ─────────────────────────────────────────────────────
          AnimatedBuilder(
            animation: _confettiController,
            builder: (context, _) {
              return CustomPaint(
                size: Size(
                    MediaQuery.of(context).size.width,
                    MediaQuery.of(context).size.height),
                painter: _ConfettiPainter(
                    _particles, _confettiController.value),
              );
            },
          ),
          // ── Main content ─────────────────────────────────────────────────
          SafeArea(
            child: Column(
              children: [
                Expanded(
                  child: Center(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.symmetric(horizontal: 32),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          // Check circle
                          AnimatedBuilder(
                            animation: _checkController,
                            builder: (_, child) => Opacity(
                              opacity: _checkOpacity.value,
                              child: Transform.scale(
                                scale: _checkScale.value,
                                child: child,
                              ),
                            ),
                            child: _buildCheckCircle(),
                          ),
                          const SizedBox(height: 32),
                          // Title & subtitle
                          AnimatedBuilder(
                            animation: _fadeController,
                            builder: (_, child) => Opacity(
                              opacity: _fadeIn.value,
                              child: Transform.translate(
                                offset: Offset(0, _slideUp.value),
                                child: child,
                              ),
                            ),
                            child: _buildSuccessText(),
                          ),
                          const SizedBox(height: 28),
                          // Order details card
                          AnimatedBuilder(
                            animation: _fadeController,
                            builder: (_, child) => Opacity(
                              opacity: _fadeIn.value,
                              child: Transform.translate(
                                offset: Offset(0, _slideUp.value * 1.3),
                                child: child,
                              ),
                            ),
                            child: _buildOrderCard(),
                          ),
                          const SizedBox(height: 24),
                          // Steps
                          AnimatedBuilder(
                            animation: _fadeController,
                            builder: (_, child) => Opacity(
                              opacity: _fadeIn.value,
                              child: child,
                            ),
                            child: _buildDeliverySteps(),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                // ── Bottom actions ────────────────────────────────────────
                AnimatedBuilder(
                  animation: _fadeController,
                  builder: (_, child) => Opacity(
                    opacity: _fadeIn.value,
                    child: child,
                  ),
                  child: _buildBottomActions(context),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCheckCircle() {
    return Stack(
      alignment: Alignment.center,
      children: [
        // Outer glow ring
        Container(
          width: 130,
          height: 130,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: AppColors.accent.withValues(alpha:0.08),
          ),
        ),
        // Middle ring
        Container(
          width: 108,
          height: 108,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: AppColors.accent.withValues(alpha:0.15),
            border: Border.all(color: AppColors.accent.withValues(alpha:0.3), width: 1),
          ),
        ),
        // Inner circle
        Container(
          width: 84,
          height: 84,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: AppColors.accent,
            boxShadow: [
              BoxShadow(
                color: AppColors.accent.withValues(alpha:0.5),
                blurRadius: 30,
                spreadRadius: 5,
              ),
            ],
          ),
          child: const Icon(
            Icons.check_rounded,
            color: AppColors.background,
            size: 44,
          ),
        ),
      ],
    );
  }

  Widget _buildSuccessText() {
    final methodLabel = widget.paymentMethod == 'card'
        ? 'Stripe'
        : widget.paymentMethod == 'wallet'
            ? 'Digital Wallet'
            : 'Cash on Delivery';

    return Column(
      children: [
        const Text(
          'Payment Successful!',
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.w900,
            color: AppColors.white,
            letterSpacing: -0.8,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 10),
        Text(
          'Your order has been placed and confirmed.\nPaid via $methodLabel.',
          style: const TextStyle(
            color: AppColors.textSecondary,
            fontSize: 14,
            height: 1.5,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 16),
        // Amount pill
        Container(
          padding:
              const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
          decoration: BoxDecoration(
            color: AppColors.accent.withValues(alpha:0.1),
            borderRadius: BorderRadius.circular(30),
            border: Border.all(color: AppColors.accent.withValues(alpha:0.3)),
          ),
          child: Text(
            '${widget.total.toStringAsFixed(0)} EGP',
            style: const TextStyle(
              color: AppColors.accent,
              fontSize: 26,
              fontWeight: FontWeight.w900,
              letterSpacing: -0.5,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildOrderCard() {
    return AppCard(
      borderColor: AppColors.accent.withValues(alpha:0.25),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Order ID',
                  style: TextStyle(
                      color: AppColors.textSecondary, fontSize: 12)),
              Text(
                '#${widget.orderId}',
                style: const TextStyle(
                  color: AppColors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  fontFamily: 'monospace',
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          const NeonDivider(),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _OrderInfoItem(
                  label: 'Status',
                  value: 'Confirmed',
                  valueColor: AppColors.success),
              _OrderInfoItem(
                  label: 'Delivery',
                  value: '3–5 days',
                  valueColor: AppColors.white),
              _OrderInfoItem(
                  label: 'Points Earned',
                  value: '+${(widget.total / 10).round()} pts',
                  valueColor: AppColors.accent),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDeliverySteps() {
    const steps = [
      ('Order Confirmed', Icons.check_circle_rounded, true),
      ('Being Prepared', Icons.inventory_2_rounded, false),
      ('Out for Delivery', Icons.local_shipping_rounded, false),
      ('Delivered', Icons.home_rounded, false),
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: steps.asMap().entries.map((entry) {
          final i = entry.key;
          final (label, icon, isDone) = entry.value;
          return Expanded(
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    children: [
                      Container(
                        width: 34,
                        height: 34,
                        decoration: BoxDecoration(
                          color: isDone
                              ? AppColors.accent
                              : AppColors.surfaceVariant,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: isDone
                                ? AppColors.accent
                                : AppColors.border,
                          ),
                        ),
                        child: Icon(icon,
                            size: 16,
                            color: isDone
                                ? AppColors.background
                                : AppColors.textMuted),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        label,
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w500,
                          color: isDone
                              ? AppColors.accent
                              : AppColors.textMuted,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
                if (i < steps.length - 1)
                  Container(
                    height: 1,
                    width: 8,
                    color: AppColors.border,
                    margin: const EdgeInsets.only(bottom: 20),
                  ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildBottomActions(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: Column(
        children: [
          AccentButton(
            label: 'Back to Home',
            icon: Icons.home_rounded,
            onTap: () {
              ref.read(navIndexProvider.notifier).state = 0;
              Navigator.of(context).popUntil((route) => route.isFirst);
            },
          ),
          const SizedBox(height: 10),
          OutlinedButton.icon(
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const HistoryScreen()),
            ),
            icon: const Icon(Icons.receipt_long_rounded,
                size: 16, color: AppColors.accent),
            label: const Text('View Order Details',
                style: TextStyle(
                    color: AppColors.accent, fontWeight: FontWeight.w600)),
            style: OutlinedButton.styleFrom(
              minimumSize: const Size(double.infinity, 48),
              side: const BorderSide(color: AppColors.border),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14)),
            ),
          ),
        ],
      ),
    );
  }
}

class _OrderInfoItem extends StatelessWidget {
  final String label;
  final String value;
  final Color valueColor;

  const _OrderInfoItem(
      {required this.label, required this.value, required this.valueColor});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(label,
            style: const TextStyle(
                color: AppColors.textMuted,
                fontSize: 11,
                fontWeight: FontWeight.w400)),
        const SizedBox(height: 4),
        Text(value,
            style: TextStyle(
                color: valueColor,
                fontSize: 13,
                fontWeight: FontWeight.w700)),
      ],
    );
  }
}

// ── Confetti Painter ─────────────────────────────────────────────────────────
class _ConfettiParticle {
  final double x;
  final double startY;
  final double size;
  final double speed;
  final Color color;
  final double rotation;
  final double rotationSpeed;

  const _ConfettiParticle({
    required this.x,
    required this.startY,
    required this.size,
    required this.speed,
    required this.color,
    required this.rotation,
    required this.rotationSpeed,
  });
}

class _ConfettiPainter extends CustomPainter {
  final List<_ConfettiParticle> particles;
  final double progress;

  _ConfettiPainter(this.particles, this.progress);

  @override
  void paint(Canvas canvas, Size size) {
    for (final p in particles) {
      final y = p.startY + progress * p.speed * 1.5;
      if (y < 0 || y > 1.2) continue;

      final paint = Paint()..color = p.color.withValues(alpha:1 - progress * 0.5);
      final cx = p.x * size.width;
      final cy = y * size.height;
      final angle = p.rotation + progress * p.rotationSpeed;

      canvas.save();
      canvas.translate(cx, cy);
      canvas.rotate(angle);

      final rect = Rect.fromCenter(
          center: Offset.zero, width: p.size, height: p.size * 0.5);
      canvas.drawRect(rect, paint);
      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(_ConfettiPainter old) => old.progress != progress;
}
