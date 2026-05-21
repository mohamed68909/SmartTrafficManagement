// lib/features/maintenance/screens/car_diagnostic_screen.dart
import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/shared_widgets.dart';
import '../../../../core/services/diagnostic_service.dart';

/// Expert-System driven car-diagnostic wizard.
/// Flow: GET /diagnostics/start → POST /diagnostics/answer (repeat until isComplete).
class CarDiagnosticScreen extends StatefulWidget {
  const CarDiagnosticScreen({super.key});

  @override
  State<CarDiagnosticScreen> createState() => _CarDiagnosticScreenState();
}

class _CarDiagnosticScreenState extends State<CarDiagnosticScreen>
    with TickerProviderStateMixin {
  // ── State ──────────────────────────────────────────────────────────────────
  DiagnosticQuestion? _currentQuestion;
  DiagnosticResult? _finalResult;
  bool _isLoading = true;
  bool _hasError = false;
  String? _selectedAnswerId; // tapped answer while waiting for response

  final List<String> _breadcrumb = []; // question texts for progress display
  int _stepCount = 0;

  late final AnimationController _fadeCtrl;
  late final Animation<double> _fadeAnim;
  late final AnimationController _slideCtrl;
  late final Animation<Offset> _slideAnim;

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  @override
  void initState() {
    super.initState();
    _fadeCtrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 400));
    _fadeAnim = CurvedAnimation(parent: _fadeCtrl, curve: Curves.easeOut);
    _slideCtrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 350));
    _slideAnim = Tween<Offset>(
            begin: const Offset(0, 0.08), end: Offset.zero)
        .animate(CurvedAnimation(parent: _slideCtrl, curve: Curves.easeOut));

    _loadStart();
  }

  @override
  void dispose() {
    _fadeCtrl.dispose();
    _slideCtrl.dispose();
    super.dispose();
  }

  // ── API calls ──────────────────────────────────────────────────────────────
  Future<void> _loadStart() async {
    setState(() {
      _isLoading = true;
      _hasError = false;
      _finalResult = null;
      _currentQuestion = null;
      _breadcrumb.clear();
      _stepCount = 0;
      _selectedAnswerId = null;
    });

    final q = await DiagnosticService.startDiagnostic();
    if (!mounted) return;

    if (q == null) {
      setState(() {
        _isLoading = false;
        _hasError = true;
      });
      return;
    }

    setState(() {
      _currentQuestion = q;
      _isLoading = false;
    });
    _animate();
  }

  Future<void> _submitAnswer(DiagnosticAnswer answer) async {
    if (_selectedAnswerId != null) return; // debounce

    setState(() => _selectedAnswerId = answer.id);

    if (_currentQuestion != null) {
      _breadcrumb.add(_currentQuestion!.text);
    }

    final step = await DiagnosticService.submitAnswer(answer.id);
    if (!mounted) return;

    if (step == null) {
      setState(() => _selectedAnswerId = null);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Network error — please try again.'),
          backgroundColor: AppColors.surface,
        ),
      );
      return;
    }

    setState(() {
      _stepCount++;
      _selectedAnswerId = null;
      if (step.isComplete) {
        _finalResult = step.result;
        _currentQuestion = null;
      } else {
        _currentQuestion = step.nextQuestion;
      }
    });
    _animate();
  }

  void _animate() {
    _fadeCtrl.forward(from: 0);
    _slideCtrl.forward(from: 0);
  }

  // ── Urgency helpers ────────────────────────────────────────────────────────
  Color _urgencyColor(String urgency) {
    switch (urgency.toLowerCase()) {
      case 'high':
        return AppColors.error;
      case 'medium':
        return const Color(0xFFFFAA00);
      default:
        return AppColors.success;
    }
  }

  IconData _serviceIcon(String serviceType) {
    switch (serviceType.toLowerCase()) {
      case 'towing':
        return Icons.local_shipping_rounded;
      case 'emergency':
        return Icons.emergency_rounded;
      default:
        return Icons.build_rounded;
    }
  }

  // ── Build ──────────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: buildAppBar(
        context,
        title: 'Car Diagnostics',
        showBack: true,
        actions: [
          if (!_isLoading && !_hasError)
            IconButton(
              icon: const Icon(Icons.refresh_rounded, color: AppColors.textSecondary),
              onPressed: _loadStart,
              tooltip: 'Restart',
            ),
        ],
      ),
      body: _isLoading
          ? _buildLoading()
          : _hasError
              ? _buildError()
              : _finalResult != null
                  ? _buildResult()
                  : _buildQuestion(),
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  Widget _buildLoading() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: AppColors.accent.withValues(alpha: 0.1),
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.accent.withValues(alpha: 0.3)),
            ),
            child: const CircularProgressIndicator(
              color: AppColors.accent,
              strokeWidth: 2,
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            'Loading Expert System…',
            style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
          ),
        ],
      ),
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  Widget _buildError() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: AppColors.error.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.wifi_off_rounded,
                  color: AppColors.error, size: 32),
            ),
            const SizedBox(height: 20),
            const Text(
              'Could Not Connect',
              style: TextStyle(
                  color: AppColors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 8),
            const Text(
              'Unable to reach the Expert System.\nCheck your connection and try again.',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 28),
            AccentButton(label: 'Try Again', onTap: _loadStart),
          ],
        ),
      ),
    );
  }

  // ── Question panel ─────────────────────────────────────────────────────────
  Widget _buildQuestion() {
    final q = _currentQuestion!;
    return FadeTransition(
      opacity: _fadeAnim,
      child: SlideTransition(
        position: _slideAnim,
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Progress indicator
              _buildProgressBar(),
              const SizedBox(height: 24),

              // Step label
              Text(
                'Step ${_stepCount + 1}',
                style: const TextStyle(
                  color: AppColors.accent,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.2,
                ),
              ),
              const SizedBox(height: 8),

              // Question card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: AppColors.accent.withValues(alpha: 0.2)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: AppColors.accent.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.help_outline_rounded,
                          color: AppColors.accent, size: 22),
                    ),
                    const SizedBox(height: 14),
                    Text(
                      q.text,
                      style: const TextStyle(
                        color: AppColors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        height: 1.35,
                        letterSpacing: -0.3,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Answer buttons
              const Text(
                'SELECT YOUR ANSWER',
                style: TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 1.2,
                ),
              ),
              const SizedBox(height: 12),
              ...q.answers.map((a) => _buildAnswerTile(a)),

              // Breadcrumb trail
              if (_breadcrumb.isNotEmpty) ...[
                const SizedBox(height: 28),
                _buildBreadcrumb(),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAnswerTile(DiagnosticAnswer answer) {
    final isSelected = _selectedAnswerId == answer.id;
    final isWaiting = _selectedAnswerId != null;

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.accent.withValues(alpha: 0.12)
              : AppColors.surfaceVariant,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? AppColors.accent : AppColors.border,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            borderRadius: BorderRadius.circular(14),
            onTap: isWaiting ? null : () => _submitAnswer(answer),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              child: Row(
                children: [
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    width: 22,
                    height: 22,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isSelected
                          ? AppColors.accent
                          : Colors.transparent,
                      border: Border.all(
                        color: isSelected
                            ? AppColors.accent
                            : AppColors.textMuted,
                        width: 1.5,
                      ),
                    ),
                    child: isSelected
                        ? const Icon(Icons.check_rounded,
                            size: 14, color: AppColors.background)
                        : null,
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Text(
                      answer.text,
                      style: TextStyle(
                        color: isSelected
                            ? AppColors.accent
                            : AppColors.white,
                        fontSize: 14,
                        fontWeight: isSelected
                            ? FontWeight.w700
                            : FontWeight.w500,
                      ),
                    ),
                  ),
                  if (isSelected)
                    const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: AppColors.accent,
                      ),
                    )
                  else
                    const Icon(Icons.chevron_right_rounded,
                        color: AppColors.textMuted, size: 20),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildProgressBar() {
    // Estimate: tree has ~14 questions max
    const maxSteps = 14;
    final progress = (_stepCount / maxSteps).clamp(0.0, 1.0);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Diagnosis Progress',
              style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 12,
                  fontWeight: FontWeight.w500),
            ),
            Text(
              '${(_stepCount / maxSteps * 100).round()}%',
              style: const TextStyle(
                  color: AppColors.accent,
                  fontSize: 12,
                  fontWeight: FontWeight.w700),
            ),
          ],
        ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: progress,
            backgroundColor: AppColors.border,
            color: AppColors.accent,
            minHeight: 5,
          ),
        ),
      ],
    );
  }

  Widget _buildBreadcrumb() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'PATH SO FAR',
          style: TextStyle(
            color: AppColors.textMuted,
            fontSize: 11,
            fontWeight: FontWeight.w600,
            letterSpacing: 1.1,
          ),
        ),
        const SizedBox(height: 8),
        ..._breadcrumb.asMap().entries.map(
              (e) => Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(top: 3),
                      child: Container(
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(
                          color: AppColors.textMuted,
                          shape: BoxShape.circle,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        e.value,
                        style: const TextStyle(
                            color: AppColors.textMuted, fontSize: 12),
                      ),
                    ),
                  ],
                ),
              ),
            ),
      ],
    );
  }

  // ── Result panel ───────────────────────────────────────────────────────────
  Widget _buildResult() {
    final r = _finalResult!;
    final urgColor = _urgencyColor(r.urgency);
    final svcIcon = _serviceIcon(r.recommendedServiceType);

    return FadeTransition(
      opacity: _fadeAnim,
      child: SlideTransition(
        position: _slideAnim,
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 40),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: AppColors.accent.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.fact_check_rounded,
                        color: AppColors.accent, size: 24),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Diagnosis Complete',
                          style: TextStyle(
                            color: AppColors.accent,
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1.1,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Expert System Result',
                          style: TextStyle(
                            color: AppColors.textSecondary,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Main result card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: urgColor.withValues(alpha: 0.3)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            r.title,
                            style: const TextStyle(
                              color: AppColors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.w800,
                              letterSpacing: -0.5,
                              height: 1.2,
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        StatusBadge(
                          label: r.urgency.toUpperCase(),
                          color: urgColor,
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    const Divider(color: AppColors.border, height: 1),
                    const SizedBox(height: 14),
                    Text(
                      r.description,
                      style: const TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 14,
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // Tip card
              if (r.tip != null && r.tip!.isNotEmpty)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.accent.withValues(alpha: 0.06),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                        color: AppColors.accent.withValues(alpha: 0.2)),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.lightbulb_outline_rounded,
                          color: AppColors.accent, size: 18),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          r.tip!,
                          style: const TextStyle(
                            color: AppColors.accent,
                            fontSize: 13,
                            height: 1.45,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              const SizedBox(height: 14),

              // Recommended service chip
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surfaceVariant,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: AppColors.accent.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(svcIcon,
                          color: AppColors.accent, size: 20),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'RECOMMENDED SERVICE',
                            style: TextStyle(
                              color: AppColors.textMuted,
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              letterSpacing: 1.1,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            r.recommendedServiceType,
                            style: const TextStyle(
                              color: AppColors.white,
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),

              // CTA buttons
              AccentButton(
                label: 'REQUEST ${r.recommendedServiceType.toUpperCase()}',
                icon: svcIcon,
                onTap: () => Navigator.pop(context, r.recommendedServiceType),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: OutlinedButton.icon(
                  icon: const Icon(Icons.restart_alt_rounded,
                      color: AppColors.textSecondary, size: 18),
                  label: const Text(
                    'Run Again',
                    style: TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.border),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14)),
                  ),
                  onPressed: _loadStart,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
