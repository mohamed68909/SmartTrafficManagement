import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../core/widgets/custom_button.dart';
import 'package:lucide_icons/lucide_icons.dart';

class RatingScreen extends StatefulWidget {
  const RatingScreen({super.key});

  @override
  State<RatingScreen> createState() => _RatingScreenState();
}

class _RatingScreenState extends State<RatingScreen> {
  String sessionId = '#TRF-9921';
  int selectedStars = 0;
  final TextEditingController _feedbackController = TextEditingController();
  bool isSubmitting = false;

  final List<String> quickTags = [
    'Fast Service',
    'Friendly Staff',
    'Clean Environment',
    'High Price',
    'App Crash',
    'Highly Recommended'
  ];
  List<String> selectedTags = [];

  @override
  void dispose() {
    _feedbackController.dispose();
    super.dispose();
  }

  String getRatingText() {
    switch (selectedStars) {
      case 1:
        return 'Terrible 😞';
      case 2:
        return 'Bad 😕';
      case 3:
        return 'Okay 😐';
      case 4:
        return 'Good 😊';
      case 5:
        return 'Excellent 🤩';
      default:
        return 'Tap a star to rate';
    }
  }

  Future<void> submitRating() async {
    if (selectedStars == 0) return;

    setState(() => isSubmitting = true);
    try {
      await Future.delayed(const Duration(seconds: 1));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                Icon(LucideIcons.checkCircle, color: Colors.white),
                const SizedBox(width: 12),
                Expanded(child: const Text('Thank you for your feedback!')),
              ],
            ),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 2),
            behavior: SnackBarBehavior.floating,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
        );
        Navigator.pushReplacementNamed(context, '/');
      }
    } catch (e) {
      debugPrint("Error submitting rating: $e");
    } finally {
      if (mounted) setState(() => isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: GestureDetector(
          onTap: () => Navigator.pushReplacementNamed(context, '/'),
          child: Container(
            margin: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: isDark ? AppTheme.cardBg : Colors.white,
              shape: BoxShape.circle,
              border:
                  Border.all(color: isDark ? Colors.white10 : Colors.black12),
            ),
            child: Icon(LucideIcons.chevronLeft,
                color: isDark ? Colors.white : Colors.black87, size: 18),
          ),
        ),
        title: const Text('Service Rating', style: TextStyle(fontSize: 18)),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(32),
        child: Column(
          children: [
            const SizedBox(height: 20),
            Text(
              'How was your service?',
              style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              "SESSION ID: $sessionId",
              style: TextStyle(
                  color: AppTheme.primary,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5),
            ),
            const SizedBox(height: 48),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(5, (index) {
                int starValue = index + 1;
                bool isSelected = starValue <= selectedStars;
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: GestureDetector(
                    onTap: () => setState(() => selectedStars = starValue),
                    child: AnimatedScale(
                      scale: isSelected ? 1.2 : 1.0,
                      duration: const Duration(milliseconds: 200),
                      curve: Curves.easeOutBack,
                      child: Icon(
                        LucideIcons.star,
                        color: isSelected
                            ? AppTheme.primary
                            : AppTheme.textSecondary.withValues(alpha: 0.5),
                        size: 40,
                        fill: isSelected ? 1.0 : 0.0,
                      ),
                    ),
                  ),
                );
              }),
            ),
            const SizedBox(height: 24),
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 300),
              child: Text(
                getRatingText(),
                key: ValueKey<int>(selectedStars),
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: selectedStars > 0
                        ? AppTheme.primary
                        : AppTheme.textSecondary),
              ),
            ),
            const SizedBox(height: 48),
            Align(
              alignment: AlignmentDirectional.centerStart,
              child: const Text('Quick Feedback',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8.0,
              runSpacing: 8.0,
              children: quickTags.map((tag) {
                bool isTagSelected = selectedTags.contains(tag);
                return ChoiceChip(
                  label: Text(tag),
                  selected: isTagSelected,
                  selectedColor: AppTheme.primary.withValues(alpha: 0.2),
                  backgroundColor:
                      isDark ? AppTheme.cardBg : Colors.grey.shade100,
                  labelStyle: TextStyle(
                      color: isTagSelected
                          ? AppTheme.primary
                          : (isDark ? Colors.white70 : Colors.black87),
                      fontWeight:
                          isTagSelected ? FontWeight.bold : FontWeight.normal),
                  side: BorderSide(
                    color: isTagSelected
                        ? AppTheme.primary
                        : (isDark ? Colors.white10 : Colors.black12),
                  ),
                  onSelected: (selected) {
                    setState(() {
                      if (selected) {
                        selectedTags.add(tag);
                      } else {
                        selectedTags.remove(tag);
                      }
                    });
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 32),
            Align(
              alignment: AlignmentDirectional.centerStart,
              child: const Text('Additional Details',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            ),
            const SizedBox(height: 12),
            Container(
              height: 140,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.cardBg : Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                    color: selectedStars > 0
                        ? AppTheme.primary.withValues(alpha: 0.3)
                        : (isDark ? Colors.white10 : Colors.black12)),
              ),
              child: TextField(
                controller: _feedbackController,
                maxLines: null,
                decoration: InputDecoration(
                  hintText: 'Tell us more about your experience...',
                  hintStyle:
                      TextStyle(color: AppTheme.textSecondary, fontSize: 14),
                  border: InputBorder.none,
                ),
              ),
            ),
            const SizedBox(height: 40),
            CustomButton(
              text: 'Submit Feedback',
              isLoading: isSubmitting,
              onPressed: selectedStars > 0 ? submitRating : null,
            ),
          ],
        ),
      ),
    );
  }
}
