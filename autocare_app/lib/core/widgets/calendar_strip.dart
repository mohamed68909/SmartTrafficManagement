import 'package:flutter/material.dart';
// NEW (working)
import '../../../../core/theme/app_theme.dart';
import 'package:lucide_icons/lucide_icons.dart';

class CalendarStrip extends StatefulWidget {
  final bool isDark;
  final DateTime currentMonth;
  final DateTime? selectedDate;
  final Function(int) onMonthChange;
  final Function(DateTime) onDateSelected;

  const CalendarStrip({
    super.key,
    required this.isDark,
    required this.currentMonth,
    required this.selectedDate,
    required this.onMonthChange,
    required this.onDateSelected,
  });

  @override
  State<CalendarStrip> createState() => _CalendarStripState();
}

class _CalendarStripState extends State<CalendarStrip> {
  final ScrollController _scrollController = ScrollController();

  int get daysInMonth {
    return DateTime(widget.currentMonth.year, widget.currentMonth.month + 1, 0)
        .day;
  }

  void _scrollToStart() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        0,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  @override
  void didUpdateWidget(covariant CalendarStrip oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.currentMonth != widget.currentMonth) {
      _scrollToStart();
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: widget.isDark ? AppTheme.cardBg : Colors.white,
        borderRadius: BorderRadius.circular(40),
        border:
            Border.all(color: widget.isDark ? Colors.white10 : Colors.black12),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                  "${[
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December"
                  ][widget.currentMonth.month - 1]} ${widget.currentMonth.year}",
                  style: const TextStyle(
                      fontWeight: FontWeight.bold, fontSize: 14)),
              Row(
                children: [
                  IconButton(
                    icon: const Icon(LucideIcons.chevronLeft, size: 16),
                    onPressed: () => widget.onMonthChange(-1),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    icon: const Icon(LucideIcons.chevronRight, size: 16),
                    onPressed: () => widget.onMonthChange(1),
                  ),
                ],
              )
            ],
          ),
          const SizedBox(height: 20),
          SizedBox(
            height: 100,
            child: ListView.builder(
              controller: _scrollController,
              scrollDirection: Axis.horizontal,
              itemCount: daysInMonth,
              itemBuilder: (context, index) {
                DateTime date = DateTime(widget.currentMonth.year,
                    widget.currentMonth.month, index + 1);
                bool isSelected = widget.selectedDate != null &&
                    widget.selectedDate!.year == date.year &&
                    widget.selectedDate!.month == date.month &&
                    widget.selectedDate!.day == date.day;

                return GestureDetector(
                  onTap: () => widget.onDateSelected(date),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    child: _buildDateItem(
                      [
                        "Mon",
                        "Tue",
                        "Wed",
                        "Thu",
                        "Fri",
                        "Sat",
                        "Sun"
                      ][date.weekday - 1]
                          .toUpperCase(),
                      date.day.toString(),
                      isSelected,
                      widget.isDark,
                    ),
                  ),
                );
              },
            ),
          )
        ],
      ),
    );
  }

  Widget _buildDateItem(String day, String date, bool isSelected, bool isDark) {
    return Column(
      children: [
        Text(day,
            style: TextStyle(color: AppTheme.textSecondary, fontSize: 9)),
        const SizedBox(height: 8),
        AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          height: 45,
          width: 45,
          decoration: BoxDecoration(
            color: isSelected ? AppTheme.primary : Colors.transparent,
            shape: BoxShape.circle,
            boxShadow: isSelected
                ? [
                    BoxShadow(
                        color: AppTheme.primary.withValues(alpha: 0.3),
                        blurRadius: 10,
                        spreadRadius: 2)
                  ]
                : null,
          ),
          child: Center(
            child: Text(
              date,
              style: TextStyle(
                color: isSelected
                    ? Colors.black
                    : (isDark ? Colors.white : Colors.black87),
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
            ),
          ),
        )
      ],
    );
  }
}
