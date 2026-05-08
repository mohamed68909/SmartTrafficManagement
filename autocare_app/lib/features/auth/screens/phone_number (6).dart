import 'package:flutter/material.dart';
import 'package:intl_phone_field/intl_phone_field.dart';
import 'package:intl_phone_field/country_picker_dialog.dart';
// تأكد أن مسار الملف واسمه صح (بالأقواس زي ما تحب)
import 'OTP(6).dart'; 

class PhoneNumberScreen extends StatefulWidget {
  const PhoneNumberScreen({super.key});

  @override
  State<PhoneNumberScreen> createState() => _PhoneNumberScreenState();
}

class _PhoneNumberScreenState extends State<PhoneNumberScreen> {
  final Color neonGreen = const Color(0xFFCCFF00);
  final Color darkGrey = const Color(0xFF1E1E1E);
  
  // المتغير اللي هيشيل الرقم كامل عشان نبعته للصفحة اللي بعدها
  String _completeNumber = "";

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      resizeToAvoidBottomInset: true, 
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leadingWidth: 100,
        leading: TextButton.icon(
          onPressed: () => Navigator.pop(context),
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white, size: 16),
          label: const Text("Back", style: TextStyle(color: Colors.white, fontSize: 16)),
        ),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 25.0),
          child: Column(
            children: [
              const SizedBox(height: 40),
              const Text(
                "Enter Your Phone\nNumber",
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 15),
              const Text(
                "A verification code will be sent to this number.",
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white54, fontSize: 16),
              ),
              const SizedBox(height: 50),

              IntlPhoneField(
                initialCountryCode: 'EG',
                disableLengthCheck: true, 
                dropdownTextStyle: const TextStyle(color: Colors.white, fontSize: 18),
                style: const TextStyle(color: Colors.white, fontSize: 18),
                cursorColor: neonGreen,
                onChanged: (phone) {
                  setState(() {
                    _completeNumber = phone.completeNumber;
                  });
                },
                pickerDialogStyle: PickerDialogStyle(
                  backgroundColor: const Color(0xFF121212),
                  countryCodeStyle: const TextStyle(color: Colors.white),
                  countryNameStyle: const TextStyle(color: Colors.white),
                  searchFieldInputDecoration: InputDecoration(
                    hintText: "Search country",
                    hintStyle: const TextStyle(color: Colors.white24),
                    prefixIcon: const Icon(Icons.search, color: Colors.white),
                    fillColor: Colors.white10,
                    filled: true,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
                decoration: InputDecoration(
                  hintText: 'Phone Number',
                  hintStyle: const TextStyle(color: Colors.white24),
                  filled: true,
                  fillColor: darkGrey,
                  contentPadding: const EdgeInsets.symmetric(vertical: 20, horizontal: 15),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(20),
                    borderSide: const BorderSide(color: Colors.white10),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(20),
                    borderSide: BorderSide(color: neonGreen.withValues(alpha:0.5), width: 2),
                  ),
                ),
              ),

              const SizedBox(height: 150), 

              ElevatedButton(
                onPressed: () {
                  // بنادي على الكلاس OTP6 اللي جوه ملف OTP(6).dart
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => OTP6(phoneNumber: _completeNumber),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: neonGreen,
                  minimumSize: const Size(double.infinity, 65),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
                ),
                child: const Text(
                  "NEXT",
                  style: TextStyle(
                    color: Colors.black, 
                    fontWeight: FontWeight.w900, 
                    fontSize: 18,
                    letterSpacing: 1.5,
                  ),
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}