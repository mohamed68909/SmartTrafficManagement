import 'package:flutter/material.dart';
import 'dart:async';
// 1. استيراد صفحة الخريطة (تأكد من صحة مسار الملف عندك)
import '../../maps/screens/map_screen(9).dart';

class OTP6 extends StatefulWidget {
  final String phoneNumber;
  const OTP6({super.key, required this.phoneNumber});

  @override
  State<OTP6> createState() => _OTP6State();
}

class _OTP6State extends State<OTP6> {
  final Color neonGreen = const Color(0xFFCCFF00);
  final Color darkGrey = const Color(0xFF1E1E1E);
  Timer? _timer;
  int _start = 29;

  @override
  void initState() {
    super.initState();
    startTimer();
  }

  void startTimer() {
    _start = 29;
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_start == 0) {
        setState(() => timer.cancel());
      } else {
        setState(() => _start--);
      }
    });
  }

  // --- دالة إظهار المربع الصغير (Resend Dialog) ---
  void _showResendDialog() {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: const Color(0xFF121212),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(color: neonGreen.withValues(alpha:0.5)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.refresh, color: neonGreen, size: 40),
              const SizedBox(height: 15),
              const Text(
                "Resend Code?",
                style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 10),
              const Text(
                "We will send a new 4-digit code to your number.",
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white54, fontSize: 14),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text("Cancel",
                          style: TextStyle(color: Colors.white38)),
                    ),
                  ),
                  Expanded(
                    child: ElevatedButton(
                      style:
                          ElevatedButton.styleFrom(backgroundColor: neonGreen),
                      onPressed: () {
                        Navigator.pop(context);
                        setState(() => startTimer());
                      },
                      child: const Text("Resend",
                          style: TextStyle(
                              color: Colors.black,
                              fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              )
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    String maskedPhone = widget.phoneNumber.length > 2
        ? "XXXX XXX XX${widget.phoneNumber.substring(widget.phoneNumber.length - 2)}"
        : widget.phoneNumber;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leadingWidth: 100,
        leading: InkWell(
          onTap: () => Navigator.pop(context),
          child: const Row(
            children: [
              SizedBox(width: 15),
              Icon(Icons.arrow_back_ios, color: Colors.white, size: 18),
              SizedBox(width: 5),
              Text(
                "Back",
                style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w500),
              ),
            ],
          ),
        ),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 25.0),
          child: Column(
            children: [
              const SizedBox(height: 40),
              const Text(
                "Verify Your Phone",
                style: TextStyle(
                    color: Colors.white,
                    fontSize: 32,
                    fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 15),
              const Text("Enter the 4-digit code sent to",
                  style: TextStyle(color: Colors.white54, fontSize: 16)),
              Text(
                "+20 $maskedPhone",
                style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 50),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _otpBox(first: true, last: false),
                  _otpBox(first: false, last: false),
                  _otpBox(first: false, last: false),
                  _otpBox(first: false, last: true),
                ],
              ),

              const SizedBox(height: 40),
              GestureDetector(
                onTap: _showResendDialog,
                child: const Text(
                  "Didn't receive the code?",
                  style: TextStyle(
                      color: Colors.white54,
                      fontSize: 16,
                      decoration: TextDecoration.underline),
                ),
              ),
              const SizedBox(height: 15),
              Text(
                "00:${_start.toString().padLeft(2, '0')}",
                style: TextStyle(
                    color: neonGreen,
                    fontSize: 24,
                    fontWeight: FontWeight.bold),
              ),

              const SizedBox(height: 100),

              // --- زرار الـ Verify المحدث للتحويل للخريطة ---
              ElevatedButton(
                onPressed: () {
                  // الانتقال لصفحة الخريطة ومسح صفحة الـ OTP من الذاكرة
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const MapScreen9(),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: neonGreen,
                  minimumSize: const Size(double.infinity, 65),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(25)),
                ),
                child: const Text("Verify",
                    style: TextStyle(
                        color: Colors.black,
                        fontWeight: FontWeight.w900,
                        fontSize: 18)),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _otpBox({required bool first, last}) {
    return Container(
      height: 80,
      width: 65,
      decoration: BoxDecoration(
        color: darkGrey,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: Colors.white10),
      ),
      child: TextField(
        autofocus: true,
        onChanged: (value) {
          if (value.length == 1 && last == false)
            FocusScope.of(context).nextFocus();
          if (value.isEmpty && first == false)
            FocusScope.of(context).previousFocus();
        },
        textAlign: TextAlign.center,
        style: const TextStyle(
            fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
        keyboardType: TextInputType.number,
        maxLength: 1,
        decoration:
            const InputDecoration(counterText: "", border: InputBorder.none),
      ),
    );
  }
}
