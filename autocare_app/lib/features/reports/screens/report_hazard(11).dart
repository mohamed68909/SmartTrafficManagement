import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'report accident(12).dart'; // تأكد إن الاسم هو نفس اسم الملف عندك
import 'report traffic jam(13).dart';
import 'report road works(14).dart';
import 'report police(15).dart';

class ReportHazardScreen extends StatelessWidget {
  const ReportHazardScreen({super.key});

  final Color neonGreen = const Color(0xFFCCFF00); // اللون الفسفوري
  final Color darkCardBg = const Color(0xFF161616); // لون خلفية المربعات

  @override
  Widget build(BuildContext context) {
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
          padding: const EdgeInsets.symmetric(horizontal: 25.0, vertical: 10.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 10),
              const Text(
                "Report Hazard",
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 10),
              const Text(
                "Help other drivers by reporting road conditions",
                style: TextStyle(color: Colors.white54, fontSize: 16),
              ),
              const SizedBox(height: 40),

              // --- شبكة التقارير (الزراير) ---
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 2,
                crossAxisSpacing: 20,
                mainAxisSpacing: 20,
                childAspectRatio: 0.85, // حل مشكلة الـ Overflow الداخلي
                children: [
                  _buildReportCard(
                    context: context,
                    iconData: FontAwesomeIcons.car,
                    glowColor: Colors.redAccent,
                    label: "Accident",
                    onTap: () {
                      // --- دي الحركة اللي بتنقل من صفحة للتانية ---
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const ReportAccidentScreen(),
                        ),
                      );
                    },
                  ),
                  _buildReportCard(
                    context: context,
                    iconData: Icons.warning_amber_rounded,
                    glowColor: Colors.orangeAccent,
                    label: "Traffic Jam",
                    onTap: () {
                      // الربط الفعلي
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const ReportTrafficJamScreen(),
                        ),
                      );
                    },
                  ),
                  _buildReportCard(
                    context: context,
                    iconData: Icons.fence_rounded, // أيقونة الإصلاحات
                    glowColor: neonGreen,
                    label: "Road Works",
                    onTap: () {
                      // كود الانتقال لصفحة 14
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const ReportRoadWorksScreen(),
                        ),
                      );
                    },
                  ),
                  _buildReportCard(
                    context: context,
                    iconData: Icons.shield_rounded, // أيقونة الدرع
                    glowColor: Colors.blueAccent,
                    label: "Police",
                    onTap: () {
                      // كود الانتقال لصفحة 15
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const ReportPoliceScreen(),
                        ),
                      );
                    },
                  ),
                ],
              ),

              const SizedBox(height: 40),

              // --- شريط النصيحة (Tip Bar) ---
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: darkCardBg,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white.withValues(alpha:0.05)),
                ),
                child: Row(
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: neonGreen.withValues(alpha:0.3),
                            blurRadius: 20,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                      child: Icon(Icons.lightbulb_outline_rounded,
                          color: neonGreen, size: 30),
                    ),
                    const SizedBox(width: 15),
                    const Expanded(
                      child: Text.rich(
                        TextSpan(
                          children: [
                            TextSpan(
                              text: "Tip: ",
                              style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15),
                            ),
                            TextSpan(
                              text:
                                  "Your reports help keep the community safe and earn you reward points!",
                              style: TextStyle(
                                  color: Colors.white70,
                                  fontSize: 14,
                                  height: 1.4),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }

  // ويجت بناء المربعات (الزراير)
  Widget _buildReportCard({
    required BuildContext context,
    required IconData iconData,
    required Color glowColor,
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(25),
      child: Container(
        decoration: BoxDecoration(
          color: darkCardBg,
          borderRadius: BorderRadius.circular(25),
          border: Border.all(color: Colors.white.withValues(alpha:0.05)),
        ),
        padding: const EdgeInsets.all(15),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: glowColor.withValues(alpha:0.2),
                    blurRadius: 30,
                    spreadRadius: 5,
                  ),
                ],
              ),
              child: Icon(iconData, color: glowColor, size: 35),
            ),
            const SizedBox(height: 12),
            Text(
              label,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
