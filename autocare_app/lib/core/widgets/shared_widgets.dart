// lib/core/widgets/shared_widgets.dart
import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

// ─── Section Header ───────────────────────────────────────────────────────────
class SectionHeader extends StatelessWidget {
  final String title;
  final String? actionLabel;
  final VoidCallback? onAction;

  const SectionHeader({
    super.key,
    required this.title,
    this.actionLabel,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Flexible(
          child: Text(
            title,
            style: Theme.of(context).textTheme.headlineSmall,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        if (actionLabel != null) ...[
          const SizedBox(width: 8),
          GestureDetector(
            onTap: onAction,
            child: Text(
              actionLabel!,
              style: const TextStyle(
                color: AppColors.accent,
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ],
    );
  }
}

// ─── App Card ─────────────────────────────────────────────────────────────────
class AppCard extends StatelessWidget {
  final Widget child;
  final EdgeInsets? padding;
  final VoidCallback? onTap;
  final Color? borderColor;

  const AppCard({
    super.key,
    required this.child,
    this.padding,
    this.onTap,
    this.borderColor,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: padding ?? const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: borderColor ?? AppColors.cardBorder,
            width: 1,
          ),
        ),
        child: child,
      ),
    );
  }
}

// ─── Accent Button ────────────────────────────────────────────────────────────
class AccentButton extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  final bool isLoading;
  final double? width;
  final double height;
  final IconData? icon;

  const AccentButton({
    super.key,
    required this.label,
    required this.onTap,
    this.isLoading = false,
    this.width,
    this.height = 56,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width ?? double.infinity,
      height: height,
      child: ElevatedButton(
        onPressed: isLoading ? null : onTap,
        child: isLoading
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: AppColors.background,
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (icon != null) ...[
                    Icon(icon, size: 18, color: AppColors.background),
                    const SizedBox(width: 8),
                  ],
                  Text(
                    label,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: AppColors.background,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
class StatusBadge extends StatelessWidget {
  final String label;
  final Color color;

  const StatusBadge({super.key, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha:0.12),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withValues(alpha:0.3)),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.3,
        ),
      ),
    );
  }
}

// ─── Emergency Banner ─────────────────────────────────────────────────────────
class EmergencyBanner extends StatelessWidget {
  final String title;
  final String subtitle;
  final String buttonLabel;
  final VoidCallback onTap;

  const EmergencyBanner({
    super.key,
    required this.title,
    required this.subtitle,
    required this.buttonLabel,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.accent,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.warning_amber_rounded,
                        color: AppColors.background, size: 18),
                    const SizedBox(width: 6),
                    Flexible(
                      child: Text(
                        title,
                        style: const TextStyle(
                          color: AppColors.background,
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.5,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: TextStyle(
                    color: AppColors.background.withValues(alpha:0.7),
                    fontSize: 12,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          ElevatedButton(
            onPressed: onTap,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.background,
              foregroundColor: AppColors.accent,
              minimumSize: Size.zero,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              textStyle: const TextStyle(
                fontFamily: 'SpaceGrotesk',
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
            child: Text(buttonLabel),
          ),
        ],
      ),
    );
  }
}

// ─── Neon Divider ────────────────────────────────────────────────────────────
class NeonDivider extends StatelessWidget {
  const NeonDivider({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 1,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.transparent,
            AppColors.accent.withValues(alpha:0.3),
            Colors.transparent,
          ],
        ),
      ),
    );
  }
}

// ─── App Bar ─────────────────────────────────────────────────────────────────
PreferredSizeWidget buildAppBar(
  BuildContext context, {
  required String title,
  List<Widget>? actions,
  bool showBack = false,
}) {
  return AppBar(
    backgroundColor: AppColors.background,
    elevation: 0,
    automaticallyImplyLeading: showBack,
    centerTitle: false,
    title: Text(
      title,
      style: const TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.w700,
        color: AppColors.white,
        letterSpacing: -0.3,
      ),
    ),
    actions: actions,
  );
}

// ─── Success Dialog ───────────────────────────────────────────────────────────
void showSuccessDialog(
  BuildContext context, {
  required String title,
  required String message,
  required VoidCallback onDone,
}) {
  showDialog(
    context: context,
    barrierDismissible: false,
    builder: (ctx) => Dialog(
      backgroundColor: AppColors.surface,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: AppColors.accent.withValues(alpha:0.15),
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.accent, width: 2),
              ),
              child: const Icon(Icons.check_rounded,
                  color: AppColors.accent, size: 36),
            ),
            const SizedBox(height: 20),
            Text(
              title,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: AppColors.white,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              message,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            AccentButton(label: 'Back to Dashboard', onTap: onDone),
          ],
        ),
      ),
    ),
  );
}

// ─── Checkout Stepper ─────────────────────────────────────────────────────────
/// Shows a 3-step progress bar for the checkout flow.
/// [activeStep]: 0 = Address, 1 = Payment, 2 = Confirm
Widget buildCheckoutStepper(int activeStep) {
  const steps = ['Address', 'Payment', 'Confirm'];
  return Padding(
    padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
    child: Row(
      children: steps.asMap().entries.map((entry) {
        final i      = entry.key;
        final label  = entry.value;
        final isDone = i < activeStep;
        final isActive = i == activeStep;
        return Expanded(
          child: Row(
            children: [
              Expanded(
                child: Column(
                  children: [
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      height: 3,
                      decoration: BoxDecoration(
                        color: isDone || isActive
                            ? AppColors.accent
                            : AppColors.border,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      label,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: isActive ? FontWeight.w700 : FontWeight.w400,
                        color: isActive || isDone
                            ? AppColors.accent
                            : AppColors.textMuted,
                      ),
                    ),
                  ],
                ),
              ),
              if (i < steps.length - 1) const SizedBox(width: 4),
            ],
          ),
        );
      }).toList(),
    ),
  );
}

