// lib/features/store/screens/product_detail_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/providers/app_providers.dart';
import '../../../../core/widgets/shared_widgets.dart';
import '../../../../core/widgets/product_icon.dart';
import '../../../../core/models/models.dart';
import 'cart_screen.dart';

class ProductDetailScreen extends ConsumerStatefulWidget {
  final Product product;
  const ProductDetailScreen({super.key, required this.product});

  @override
  ConsumerState<ProductDetailScreen> createState() =>
      _ProductDetailScreenState();
}

class _ProductDetailScreenState extends ConsumerState<ProductDetailScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;
  int _qty = 1;

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.product;
    final total = p.price * _qty;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          // ── App bar with product image ────────────────────────────────────
          SliverAppBar(
            expandedHeight: 280,
            pinned: true,
            backgroundColor: AppColors.background,
            leading: GestureDetector(
              onTap: () => Navigator.pop(context),
              child: Container(
                margin: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha:0.5),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.arrow_back_ios_rounded,
                    color: Colors.white, size: 16),
              ),
            ),
            actions: [
              GestureDetector(
                onTap: () => Navigator.push(context,
                    MaterialPageRoute(builder: (_) => const CartScreen())),
                child: Container(
                  margin: const EdgeInsets.all(8),
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha:0.5),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.shopping_cart_outlined,
                      color: Colors.white, size: 20),
                ),
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF0D1117), Color(0xFF161616)],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const SizedBox(height: 60),
                      Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.accent.withValues(alpha:0.15),
                              blurRadius: 30,
                              spreadRadius: 5,
                            ),
                          ],
                        ),
                        child: ProductIcon(category: p.category, size: 140),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // ── Content ─────────────────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Brand + category badge
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.accent.withValues(alpha:0.12),
                          borderRadius: BorderRadius.circular(5),
                        ),
                        child: Text(
                          p.brand.toUpperCase(),
                          style: const TextStyle(
                            color: AppColors.accent,
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceVariant,
                          borderRadius: BorderRadius.circular(5),
                        ),
                        child: Text(
                          p.category,
                          style: const TextStyle(
                            color: AppColors.textSecondary,
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      const Spacer(),
                      if (p.rating != null)
                        Row(
                          children: [
                            const Icon(Icons.star_rounded,
                                color: AppColors.accent, size: 16),
                            const SizedBox(width: 3),
                            Text(
                              p.rating!.toStringAsFixed(1),
                              style: const TextStyle(
                                  color: AppColors.accent,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700),
                            ),
                            const Text(' (128)',
                                style: TextStyle(
                                    color: AppColors.textMuted,
                                    fontSize: 11)),
                          ],
                        ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    p.name,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w800,
                      color: AppColors.white,
                      letterSpacing: -0.5,
                    ),
                  ),
                  if (p.specs != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 6),
                      child: Text(p.specs!,
                          style: const TextStyle(
                              color: AppColors.textSecondary, fontSize: 13)),
                    ),
                  const SizedBox(height: 16),
                  // Price + qty
                  Row(
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Unit Price',
                              style: TextStyle(
                                  color: AppColors.textMuted, fontSize: 11)),
                          const SizedBox(height: 2),
                          Text(
                            '${p.price.toStringAsFixed(0)} EGP',
                            style: const TextStyle(
                              fontSize: 26,
                              fontWeight: FontWeight.w900,
                              color: AppColors.accent,
                              letterSpacing: -0.5,
                            ),
                          ),
                        ],
                      ),
                      const Spacer(),
                      // Qty control
                      Container(
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(
                          children: [
                            _QtyBtn(
                              icon: Icons.remove_rounded,
                              onTap: () {
                                if (_qty > 1)
                                  setState(() => _qty--);
                              },
                            ),
                            SizedBox(
                              width: 36,
                              child: Center(
                                child: Text(
                                  '$_qty',
                                  style: const TextStyle(
                                    color: AppColors.white,
                                    fontSize: 16,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                            ),
                            _QtyBtn(
                              icon: Icons.add_rounded,
                              onTap: () => setState(() => _qty++),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // ── Feature highlights ────────────────────────────────────
                  Row(
                    children: [
                      _FeaturePill(
                          icon: Icons.local_shipping_rounded,
                          label: 'Free Delivery'),
                      const SizedBox(width: 8),
                      _FeaturePill(
                          icon: Icons.verified_rounded, label: 'Genuine'),
                      const SizedBox(width: 8),
                      _FeaturePill(
                          icon: Icons.replay_rounded, label: '30-Day Return'),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // ── Tab Bar ───────────────────────────────────────────────
                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: TabBar(
                      controller: _tabCtrl,
                      indicator: BoxDecoration(
                        color: AppColors.accent,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      indicatorSize: TabBarIndicatorSize.tab,
                      labelColor: AppColors.background,
                      unselectedLabelColor: AppColors.textSecondary,
                      labelStyle: const TextStyle(
                          fontWeight: FontWeight.w700, fontSize: 12),
                      dividerColor: Colors.transparent,
                      padding: const EdgeInsets.all(3),
                      tabs: const [
                        Tab(text: 'Description'),
                        Tab(text: 'Specs'),
                        Tab(text: 'Reviews'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    height: 180,
                    child: TabBarView(
                      controller: _tabCtrl,
                      children: [
                        _descriptionTab(p),
                        _specsTab(p),
                        _reviewsTab(),
                      ],
                    ),
                  ),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),

      // ── Bottom buy bar ───────────────────────────────────────────────────
      bottomNavigationBar: Container(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
        decoration: const BoxDecoration(
          color: AppColors.surface,
          border: Border(top: BorderSide(color: AppColors.border)),
        ),
        child: Row(
          children: [
            Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Total',
                    style: TextStyle(
                        color: AppColors.textSecondary, fontSize: 11)),
                Text(
                  '${total.toStringAsFixed(0)} EGP',
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: AppColors.accent,
                    letterSpacing: -0.5,
                  ),
                ),
              ],
            ),
            const SizedBox(width: 16),
            Expanded(
              child: AccentButton(
                label: 'Add to Cart',
                icon: Icons.shopping_cart_outlined,
                onTap: () async {
                  await ref.read(cartProvider.notifier).addItem(p, quantity: _qty);
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        backgroundColor: AppColors.surface,
                        behavior: SnackBarBehavior.floating,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10)),
                        content: Row(
                          children: [
                            const Icon(Icons.check_circle_rounded,
                                color: AppColors.accent, size: 16),
                            const SizedBox(width: 8),
                            Text('$_qty × ${p.name} added to cart',
                                style: const TextStyle(color: AppColors.white)),
                          ],
                        ),
                        action: SnackBarAction(
                          label: 'View Cart',
                          textColor: AppColors.accent,
                          onPressed: () => Navigator.push(
                              context,
                              MaterialPageRoute(
                                  builder: (_) => const CartScreen())),
                        ),
                      ),
                    );
                  }
                },
                height: 50,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _descriptionTab(Product p) {
    return SingleChildScrollView(
      child: Text(
        '${p.brand} ${p.name} is engineered for outstanding performance and reliability. '
        'Designed to meet OEM specifications for your vehicle, this premium auto part '
        'delivers superior protection and longevity under Egyptian road conditions.\n\n'
        'Suitable for temperatures ranging from -20°C to +60°C, making it perfect for '
        'Cairo\'s demanding climate. Compatible with Toyota Corolla 2020–2024 and '
        'most modern gasoline engines.',
        style: const TextStyle(
            color: AppColors.textSecondary, fontSize: 13, height: 1.6),
      ),
    );
  }

  Widget _specsTab(Product p) {
    final specs = [
      ['Part Number', 'AC-${p.id}-USD'],
      ['Brand', p.brand],
      ['Category', p.category],
      ['Specifications', p.specs ?? 'Standard'],
      ['Compatibility', 'Toyota Corolla 2020–2024'],
      ['Warranty', '12 months'],
      ['Origin', 'Germany'],
    ];
    return SingleChildScrollView(
      child: Column(
        children: specs.map((row) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              children: [
                SizedBox(
                  width: 110,
                  child: Text(row[0],
                      style: const TextStyle(
                          color: AppColors.textMuted, fontSize: 12)),
                ),
                Expanded(
                  child: Text(row[1],
                      style: const TextStyle(
                          color: AppColors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w500)),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _reviewsTab() {
    final reviews = [
      ('Ahmed M.', 5, 'Excellent quality, fits perfectly on my Corolla.'),
      ('Sara K.', 4, 'Good product, fast delivery. Highly recommend.'),
      ('Omar H.', 5, 'Much better than the original. Great value.'),
    ];
    return ListView(
      children: reviews.map((r) {
        final (name, stars, text) = r;
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                radius: 16,
                backgroundColor: AppColors.accent.withValues(alpha:0.2),
                child: Text(name[0],
                    style: const TextStyle(
                        color: AppColors.accent,
                        fontWeight: FontWeight.w700,
                        fontSize: 12)),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(name,
                            style: const TextStyle(
                                color: AppColors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.w600)),
                        const Spacer(),
                        Row(
                          children: List.generate(
                              5,
                              (i) => Icon(Icons.star_rounded,
                                  size: 10,
                                  color: i < stars
                                      ? AppColors.accent
                                      : AppColors.border)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 3),
                    Text(text,
                        style: const TextStyle(
                            color: AppColors.textSecondary,
                            fontSize: 11,
                            height: 1.4)),
                  ],
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}

class _QtyBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  const _QtyBtn({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 36,
        height: 36,
        child: Icon(icon, color: AppColors.accent, size: 18),
      ),
    );
  }
}

class _FeaturePill extends StatelessWidget {
  final IconData icon;
  final String label;
  const _FeaturePill({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          children: [
            Icon(icon, color: AppColors.accent, size: 16),
            const SizedBox(height: 4),
            Text(label,
                style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 9,
                    fontWeight: FontWeight.w500),
                textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}


