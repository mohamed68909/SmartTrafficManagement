import 'dart:io';
import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class ProfileAvatar extends StatelessWidget {
  final String? imagePath;
  final String firstName;
  final String lastName;
  final double size;
  final VoidCallback? onTap;

  const ProfileAvatar({
    super.key,
    this.imagePath,
    required this.firstName,
    required this.lastName,
    this.size = 120,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    // الحصول على أول حرف من الاسم الأول والأخير
    String initials = "";
    if (firstName.isNotEmpty) initials += firstName[0].toUpperCase();
    if (lastName.isNotEmpty) initials += lastName[0].toUpperCase();

    return GestureDetector(
      onTap: onTap,
      child: Stack(
        children: [
          Container(
            height: size,
            width: size,
            decoration: BoxDecoration(
              color: AppTheme.primary,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: AppTheme.primary.withValues(alpha: 0.3),
                  blurRadius: 30,
                  spreadRadius: 5,
                ),
              ],
            ),
            child: ClipOval(
              child: imagePath != null && imagePath!.isNotEmpty
                  ? Image.file(
                      File(imagePath!),
                      fit: BoxFit.cover,
                    )
                  : Center(
                      child: Text(
                        initials,
                        style: TextStyle(
                          color: Colors.black,
                          fontSize: size * 0.4,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
            ),
          ),
          if (onTap != null)
            PositionedDirectional(
              bottom: 0,
              end: 0,
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(color: Colors.black12, blurRadius: 10),
                  ],
                ),
                child: const Icon(Icons.camera_alt,
                    size: 20, color: Colors.black87),
              ),
            ),
        ],
      ),
    );
  }
}
