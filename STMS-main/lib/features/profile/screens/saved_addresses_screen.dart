import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/providers/app_providers.dart';
import '../../../../core/widgets/shared_widgets.dart';

class SavedAddressesScreen extends ConsumerWidget {
  const SavedAddressesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final addresses = ref.watch(addressesProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: buildAppBar(context, title: 'Saved Addresses', showBack: true),
      body: addresses.isEmpty
          ? const Center(
              child: Text(
                'No saved addresses yet.',
                style: TextStyle(color: AppColors.textSecondary),
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(20),
              itemCount: addresses.length,
              itemBuilder: (context, index) {
                final addr = addresses[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: AppCard(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: AppColors.surfaceVariant,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(
                            addr.label.toLowerCase() == 'home'
                                ? Icons.home_rounded
                                : Icons.work_rounded,
                            color: AppColors.textSecondary,
                            size: 20,
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                addr.label,
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.white,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                addr.address,
                                style: const TextStyle(
                                  color: AppColors.textSecondary,
                                  fontSize: 13,
                                  height: 1.4,
                                ),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete_outline,
                              color: AppColors.error, size: 20),
                          onPressed: () {
                            ref
                                .read(addressesProvider.notifier)
                                .removeAddress(addr.id);
                          },
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.accent,
        onPressed: () => _showAddAddressDialog(context, ref),
        icon: const Icon(Icons.add, color: AppColors.background),
        label: const Text(
          'Add Address',
          style: TextStyle(
            color: AppColors.background,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }

  void _showAddAddressDialog(BuildContext context, WidgetRef ref) {
    final labelCtrl = TextEditingController();
    final addressCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Add New Address',
            style: TextStyle(
                color: AppColors.white,
                fontSize: 16,
                fontWeight: FontWeight.w700)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: labelCtrl,
              style: const TextStyle(color: AppColors.white),
              decoration: const InputDecoration(
                hintText: 'Label (e.g. Home, Work)',
                hintStyle: TextStyle(color: AppColors.textMuted),
                prefixIcon: Icon(Icons.label_outlined,
                    color: AppColors.accent, size: 18),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: addressCtrl,
              style: const TextStyle(color: AppColors.white),
              decoration: const InputDecoration(
                hintText: 'Full address',
                hintStyle: TextStyle(color: AppColors.textMuted),
                prefixIcon: Icon(Icons.location_on_outlined,
                    color: AppColors.accent, size: 18),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel',
                style: TextStyle(color: AppColors.textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.accent,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () {
              if (labelCtrl.text.trim().isNotEmpty &&
                  addressCtrl.text.trim().isNotEmpty) {
                ref
                    .read(addressesProvider.notifier)
                    .addAddress(labelCtrl.text.trim(), addressCtrl.text.trim());
                Navigator.pop(ctx);
              }
            },
            child: const Text('Save',
                style: TextStyle(
                    color: AppColors.background, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }
}
