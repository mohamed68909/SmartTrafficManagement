import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'registration_screen.dart';
import 'forgot_password_screen.dart';
import '../../maps/screens/map_screen.dart';
import '../../../core/services/auth_service.dart';

class LoginScreen3 extends StatefulWidget {
  const LoginScreen3({super.key});

  @override
  State<LoginScreen3> createState() => _LoginScreen3State();
}

class _LoginScreen3State extends State<LoginScreen3> {
  final Color neonGreen = const Color(0xFFCCFF00);
  final Color darkGrey = const Color(0xFF1E1E1E);

  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _isLoading        = false;
  bool _isGoogleLoading  = false;
  bool _obscurePass      = true;

  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
    serverClientId: 'YOUR_WEB_CLIENT_ID_HERE.apps.googleusercontent.com', // Must match backend ClientId
  );

  // ── Google Sign-In handler ────────────────────────────────────────────────
  Future<void> _handleGoogleSignIn() async {
    setState(() => _isGoogleLoading = true);
    try {
      final account = await _googleSignIn.signIn();
      if (account == null) {
        // User cancelled the flow
        setState(() => _isGoogleLoading = false);
        return;
      }

      final auth     = await account.authentication;
      final idToken  = auth.idToken;

      if (idToken == null) {
        _snack('Google Sign-In failed: no ID token received.');
        setState(() => _isGoogleLoading = false);
        return;
      }

      final result = await AuthService.googleLogin(idToken);

      if (!mounted) return;
      setState(() => _isGoogleLoading = false);

      if (result['success'] == true) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const MapScreen9()),
        );
      } else {
        _snack(result['message'] ?? 'Google Sign-In failed.');
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isGoogleLoading = false);
        _snack('Google Sign-In error: ${e.toString()}');
      }
    }
  }

  void _snack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: const Color(0xFF1E1E1E)),
    );
  }

  void _handleLogin() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter email and password')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    final result = await AuthService.login(email, password);

    if (!mounted) return;

    setState(() {
      _isLoading = false;
    });

    if (result['success']) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const MapScreen9()),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result['message'] ?? 'Login failed')),
      );
    }
  }

  void _goToForgotPassword() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const ForgotPasswordScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 25.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 50),
              Center(
                child: Column(
                  children: [
                    Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: neonGreen.withValues(alpha:0.5),
                            blurRadius: 50,
                            spreadRadius: 10,
                          ),
                        ],
                        image: const DecorationImage(
                          image: AssetImage('assets/icon/smart.png'),
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    const SizedBox(height: 25),
                    const Text(
                      "Welcome Back",
                      style: TextStyle(
                          color: Colors.white,
                          fontSize: 32,
                          fontWeight: FontWeight.bold),
                    ),
                    const Text(
                      "Sign in to continue",
                      style: TextStyle(color: Colors.white54, fontSize: 16),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 50),
              const Text("Email",
                  style: TextStyle(
                      color: Colors.white, fontWeight: FontWeight.bold)),
              const SizedBox(height: 10),
              _buildTextField(hint: "your@email.com", controller: _emailController),
              const SizedBox(height: 25),
              const Text("Password",
                  style: TextStyle(
                      color: Colors.white, fontWeight: FontWeight.bold)),
              const SizedBox(height: 10),
              _buildTextField(
                hint: "Enter your password",
                isPassword: _obscurePass,
                controller: _passwordController,
                suffixIcon: IconButton(
                  icon: Icon(
                    _obscurePass ? Icons.visibility_off : Icons.visibility,
                    color: Colors.white38,
                  ),
                  onPressed: () => setState(() => _obscurePass = !_obscurePass),
                ),
              ),
              const SizedBox(height: 15),
              Align(
                alignment: Alignment.centerLeft,
                child: TextButton(
                  onPressed: _goToForgotPassword,
                  child: Text(
                    "Forgot Password?",
                    style: TextStyle(
                        color: neonGreen, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
              const SizedBox(height: 10),
              ElevatedButton(
                onPressed: _isLoading ? null : _handleLogin,
                style: ElevatedButton.styleFrom(
                  backgroundColor: neonGreen,
                  disabledBackgroundColor: neonGreen.withValues(alpha: 0.5),
                  minimumSize: const Size(double.infinity, 60),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15)),
                ),
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.black)
                    : const Text(
                        "Login",
                        style: TextStyle(
                            color: Colors.black,
                            fontWeight: FontWeight.w900,
                            fontSize: 18),
                      ),
              ),
              const SizedBox(height: 40),
              Row(
                children: [
                  const Expanded(child: Divider(color: Colors.white12)),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    child: Text("Or continue with",
                        style: TextStyle(color: Colors.white.withValues(alpha:0.3))),
                  ),
                  const Expanded(child: Divider(color: Colors.white12)),
                ],
              ),
              const SizedBox(height: 30),
              Row(
                children: [
                  Expanded(
                    child: _buildSocialButton(
                      "Google",
                      FontAwesomeIcons.google,
                      Colors.redAccent,
                      onTap: _isGoogleLoading ? null : _handleGoogleSignIn,
                      isLoading: _isGoogleLoading,
                    ),
                  ),
                  const SizedBox(width: 20),
                  Expanded(
                    child: _buildSocialButton(
                      "Apple",
                      Icons.apple,
                      Colors.white,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 40),
              Center(
                child: GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (context) => const RegistrationScreen()),
                    );
                  },
                  child: RichText(
                    text: TextSpan(
                      style:
                          const TextStyle(color: Colors.white54, fontSize: 14),
                      children: [
                        const TextSpan(text: "Don't have an account? "),
                        TextSpan(
                          text: "Sign Up",
                          style: TextStyle(
                              color: neonGreen, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({
    required String hint,
    bool isPassword = false,
    TextEditingController? controller,
    Widget? suffixIcon,
  }) {
    return TextField(
      controller: controller,
      obscureText: isPassword,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Colors.white24, fontSize: 14),
        filled: true,
        fillColor: darkGrey,
        suffixIcon: suffixIcon,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(15),
          borderSide: BorderSide.none,
        ),
      ),
    );
  }

  Widget _buildSocialButton(
    String label,
    IconData icon,
    Color iconColor, {
    VoidCallback? onTap,
    bool isLoading = false,
  }) {
    return Container(
      height: 65,
      decoration: BoxDecoration(
        color: darkGrey,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(
          color: onTap != null
              ? iconColor.withValues(alpha: 0.3)
              : Colors.white10,
          width: 1,
        ),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(15),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            isLoading
                ? SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(iconColor),
                    ),
                  )
                : Icon(icon, color: iconColor, size: 22),
            const SizedBox(width: 10),
            Text(
              label,
              style: TextStyle(
                color: onTap != null ? Colors.white : Colors.white38,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
