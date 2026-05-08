import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/shared_widgets.dart';
import '../../../core/services/ratings_service.dart';

class MyRatingsScreen extends StatefulWidget {
  const MyRatingsScreen({super.key});

  @override
  State<MyRatingsScreen> createState() => _MyRatingsScreenState();
}

class _MyRatingsScreenState extends State<MyRatingsScreen> {
  List<dynamic> _ratings = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadRatings();
  }

  Future<void> _loadRatings() async {
    setState(() => _isLoading = true);
    final data = await RatingsService.getMyRatings();
    setState(() {
      _ratings = data;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My Ratings & Reviews'),
        backgroundColor: AppColors.surface,
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.accent))
          : _ratings.isEmpty
              ? _buildEmptyState()
              : RefreshIndicator(
                  onRefresh: _loadRatings,
                  color: AppColors.accent,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _ratings.length,
                    itemBuilder: (context, index) {
                      final rating = _ratings[index];
                      return _RatingCard(rating: rating);
                    },
                  ),
                ),
    );
  }

  Widget _buildEmptyState() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.star_outline_rounded, size: 64, color: AppColors.textMuted),
          SizedBox(height: 16),
          Text('No ratings yet', style: TextStyle(color: AppColors.textSecondary, fontSize: 16)),
        ],
      ),
    );
  }
}

class _RatingCard extends StatelessWidget {
  final dynamic rating;

  const _RatingCard({required this.rating});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: AppCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  rating['targetType']?.toString().toUpperCase() ?? 'SERVICE',
                  style: const TextStyle(color: AppColors.accent, fontSize: 10, fontWeight: FontWeight.bold),
                ),
                Row(
                  children: List.generate(5, (index) {
                    final val = rating['value'] ?? 0;
                    return Icon(
                      index < val ? Icons.star_rounded : Icons.star_outline_rounded,
                      size: 14,
                      color: index < val ? Colors.amber : AppColors.textMuted,
                    );
                  }),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              rating['comment'] ?? 'No comment provided',
              style: const TextStyle(color: AppColors.white, fontSize: 14),
            ),
            const SizedBox(height: 12),
            Text(
              rating['createdAt']?.toString().split('T')[0] ?? '',
              style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
            ),
          ],
        ),
      ),
    );
  }
}
