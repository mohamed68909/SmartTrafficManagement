import 'package:flutter/material.dart';
import '../../../core/services/auth_service.dart';
import 'login(3).dart';

/// Full 3-step forgot-password flow:
///   Step 1 → Enter email  (calls forgotPassword)
///   Step 2 → Enter OTP    (calls verifyOtp)
///   Step 3 → New password (calls resetPassword)
class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  // ── Theme ──────────────────────────────────────────────────────────────────
  final Color _neonGreen = const Color(0xFFCCFF00);

  // ── State ──────────────────────────────────────────────────────────────────
  int    _step          = 1;   // 1 = email, 2 = OTP, 3 = new password
  bool   _isLoading     = false;
  String _email         = '';
  String _otpToken      = '';  // reset token returned / confirmed at step 2

  // ── Controllers ────────────────────────────────────────────────────────────
  final _emailCtrl    = TextEditingController();
  final _otpCtrl      = TextEditingController();
  final _passCtrl     = TextEditingController();
  final _confirmCtrl  = TextEditingController();

  bool _obscurePass    = true;
  bool _obscureConfirm = true;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _otpCtrl.dispose();
    _passCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  // ── Step handlers ──────────────────────────────────────────────────────────

  Future<void> _submitEmail() async {
    final email = _emailCtrl.text.trim();
    if (email.isEmpty || !email.contains('@')) {
      _snack('Please enter a valid email address.');
      return;
    }

    setState(() => _isLoading = true);
    final result = await AuthService.forgotPassword(email);
    if (!mounted) return;
    setState(() => _isLoading = false);

    if (result['success'] == true) {
      _email = email;
      setState(() => _step = 2);
    } else {
      _snack(result['message'] ?? 'Failed to send reset code.');
    }
  }

  Future<void> _submitOtp() async {
    final code = _otpCtrl.text.trim();
    if (code.length < 4) {
      _snack('Please enter the full OTP code.');
      return;
    }

    setState(() => _isLoading = true);
    final result = await AuthService.verifyOtp(_email, code);
    if (!mounted) return;
    setState(() => _isLoading = false);

    if (result['success'] == true) {
      _otpToken = code;          // backend uses the same code as the reset token
      setState(() => _step = 3);
    } else {
      _snack(result['message'] ?? 'Invalid or expired code.');
    }
  }

  Future<void> _submitNewPassword() async {
    if (_passCtrl.text.length < 6) {
      _snack('Password must be at least 6 characters.');
      return;
    }
    if (_passCtrl.text != _confirmCtrl.text) {
      _snack('Passwords do not match.');
      return;
    }

    setState(() => _isLoading = true);
    final result = await AuthService.resetPassword(
      _email, _otpToken, _passCtrl.text,
    );
    if (!mounted) return;
    setState(() => _isLoading = false);

    if (result['success'] == true) {
      _snack('Password reset successfully! Please log in.');
      await Future.delayed(const Duration(seconds: 1));
      if (!mounted) return;
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen3()),
        (_) => false,
      );
    } else {
      _snack(result['message'] ?? 'Failed to reset password.');
    }
  }

  void _snack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: const Color(0xFF1E1E1E)),
    );
  }

  // ── Build ──────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios, color: _neonGreen),
          onPressed: () {
            if (_step > 1) {
              setState(() => _step--);
            } else {
              Navigator.pop(context);
            }
          },
        ),
        title: Text(
          _stepTitle(),
          style: const TextStyle(
            color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18,
          ),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 25, vertical: 30),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Progress indicator ────────────────────────────────────────
              _buildStepIndicator(),
              const SizedBox(height: 35),

              // ── Step content ──────────────────────────────────────────────
              if (_step == 1) _buildEmailStep(),
              if (_step == 2) _buildOtpStep(),
              if (_step == 3) _buildNewPasswordStep(),
            ],
          ),
        ),
      ),
    );
  }

  // ── Step indicator ─────────────────────────────────────────────────────────

  Widget _buildStepIndicator() {
    return Row(
      children: List.generate(3, (i) {
        final active  = i + 1 <= _step;
        return Expanded(
          child: Container(
            margin: EdgeInsets.only(right: i < 2 ? 8 : 0),
            height: 4,
            decoration: BoxDecoration(
              color: active ? _neonGreen : const Color(0xFF2A2A2A),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
        );
      }),
    );
  }

  String _stepTitle() {
    switch (_step) {
      case 1: return 'Forgot Password';
      case 2: return 'Enter OTP';
      case 3: return 'New Password';
      default: return '';
    }
  }

  // ── Step 1: Email ──────────────────────────────────────────────────────────

  Widget _buildEmailStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Enter your registered email and we will send you a reset code.',
          style: TextStyle(color: Colors.white54, fontSize: 15, height: 1.5),
        ),
        const SizedBox(height: 30),
        _buildLabel('EMAIL ADDRESS'),
        _buildInputField(
          controller: _emailCtrl,
          hint: 'your@email.com',
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 30),
        _buildPrimaryButton(
          label: 'SEND RESET CODE',
          onPressed: _isLoading ? null : _submitEmail,
        ),
      ],
    );
  }

  // ── Step 2: OTP ────────────────────────────────────────────────────────────

  Widget _buildOtpStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        RichText(
          text: TextSpan(
            style: const TextStyle(color: Colors.white54, fontSize: 15, height: 1.5),
            children: [
              const TextSpan(text: 'A reset code was sent to\n'),
              TextSpan(
                text: _email,
                style: TextStyle(color: _neonGreen, fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ),
        const SizedBox(height: 30),
        _buildLabel('RESET CODE'),
        _buildInputField(
          controller: _otpCtrl,
          hint: '••••••',
          keyboardType: TextInputType.number,
          maxLength: 10,
        ),
        const SizedBox(height: 30),
        _buildPrimaryButton(
          label: 'VERIFY CODE',
          onPressed: _isLoading ? null : _submitOtp,
        ),
        const SizedBox(height: 15),
        Center(
          child: TextButton(
            onPressed: _isLoading ? null : _submitEmail,
            child: Text(
              "Didn't receive a code? Resend",
              style: TextStyle(color: _neonGreen.withValues(alpha: 0.7)),
            ),
          ),
        ),
      ],
    );
  }

  // ── Step 3: New Password ───────────────────────────────────────────────────

  Widget _buildNewPasswordStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Create a strong new password for your account.',
          style: TextStyle(color: Colors.white54, fontSize: 15, height: 1.5),
        ),
        const SizedBox(height: 30),
        _buildLabel('NEW PASSWORD'),
        _buildInputField(
          controller: _passCtrl,
          hint: '••••••••',
          obscure: _obscurePass,
          suffixIcon: IconButton(
            icon: Icon(
              _obscurePass ? Icons.visibility_off : Icons.visibility,
              color: Colors.white38,
            ),
            onPressed: () => setState(() => _obscurePass = !_obscurePass),
          ),
        ),
        const SizedBox(height: 20),
        _buildLabel('CONFIRM PASSWORD'),
        _buildInputField(
          controller: _confirmCtrl,
          hint: '••••••••',
          obscure: _obscureConfirm,
          suffixIcon: IconButton(
            icon: Icon(
              _obscureConfirm ? Icons.visibility_off : Icons.visibility,
              color: Colors.white38,
            ),
            onPressed: () => setState(() => _obscureConfirm = !_obscureConfirm),
          ),
        ),
        const SizedBox(height: 30),
        _buildPrimaryButton(
          label: 'RESET PASSWORD',
          onPressed: _isLoading ? null : _submitNewPassword,
        ),
      ],
    );
  }

  // ── Shared UI helpers ──────────────────────────────────────────────────────

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        text,
        style: const TextStyle(
          color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2,
        ),
      ),
    );
  }

  Widget _buildInputField({
    required TextEditingController controller,
    required String hint,
    bool obscure = false,
    TextInputType? keyboardType,
    Widget? suffixIcon,
    int? maxLength,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 5),
      child: TextField(
        controller: controller,
        obscureText: obscure,
        keyboardType: keyboardType,
        maxLength: maxLength,
        style: const TextStyle(color: Colors.white),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(color: Colors.white24, fontSize: 14),
          filled: true,
          fillColor: const Color(0xFF1E1E1E),
          counterText: '',
          suffixIcon: suffixIcon,
          contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(15),
            borderSide: BorderSide.none,
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(15),
            borderSide: BorderSide(color: _neonGreen, width: 1.5),
          ),
        ),
      ),
    );
  }

  Widget _buildPrimaryButton({
    required String label,
    required VoidCallback? onPressed,
  }) {
    return SizedBox(
      width: double.infinity,
      height: 58,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: _neonGreen,
          disabledBackgroundColor: _neonGreen.withValues(alpha: 0.4),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
        ),
        child: _isLoading
            ? const CircularProgressIndicator(color: Colors.black)
            : Text(
                label,
                style: const TextStyle(
                  color: Colors.black, fontWeight: FontWeight.w900, fontSize: 16,
                ),
              ),
      ),
    );
  }
}
