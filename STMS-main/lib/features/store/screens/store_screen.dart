// lib/features/store/screens/store_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/providers/app_providers.dart';
import '../../../../core/widgets/shared_widgets.dart';
import '../../../../core/widgets/product_icon.dart';
import '../../../../core/models/models.dart';
import '../../emergency/screens/emergency.dart';
import 'cart_screen.dart';
import 'product_detail_screen.dart';

// Active category filter provider
final _categoryFilterProvider = StateProvider<String>((ref) => 'All');

class StoreScreen extends ConsumerStatefulWidget {
  const StoreScreen({super.key});

  @override
  ConsumerState<StoreScreen> createState() => _StoreScreenState();
}

class _StoreScreenState extends ConsumerState<StoreScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _searchController = TextEditingController();
  String _searchQuery = '';
  String _selectedVehicle = 'Toyota Corolla 2023';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _searchController.addListener(
        () => setState(() => _searchQuery = _searchController.text.toLowerCase()));
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cartItems = ref.watch(cartProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // ── Header ────────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Auto Parts Store',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      color: AppColors.white,
                      letterSpacing: -0.5,
                    ),
                  ),
                  GestureDetector(
                    onTap: () => Navigator.push(context,
                        MaterialPageRoute(builder: (_) => const CartScreen())),
                    child: Stack(
                      children: [
                        Container(
                          width: 42,
                          height: 42,
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: const Icon(Icons.shopping_cart_outlined,
                              color: AppColors.white, size: 20),
                        ),
                        if (cartItems.isNotEmpty)
                          Positioned(
                            right: 0,
                            top: 0,
                            child: Container(
                              width: 18,
                              height: 18,
                              decoration: const BoxDecoration(
                                  color: AppColors.accent,
                                  shape: BoxShape.circle),
                              child: Center(
                                child: Text('${cartItems.length}',
                                    style: const TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w800,
                                        color: AppColors.background)),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // ── Search ────────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 14, 20, 0),
              child: TextField(
                controller: _searchController,
                style: const TextStyle(color: AppColors.white),
                decoration: const InputDecoration(
                  hintText: 'Search parts, tires, oils...',
                  prefixIcon: Icon(Icons.search, color: AppColors.textMuted, size: 20),
                  suffixIcon: Icon(Icons.tune_rounded, color: AppColors.textMuted, size: 20),
                ),
              ),
            ),

            // ── Tab Bar ───────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 14, 20, 0),
              child: Container(
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.border),
                ),
                child: TabBar(
                  controller: _tabController,
                  indicator: BoxDecoration(
                    color: AppColors.accent,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  indicatorSize: TabBarIndicatorSize.tab,
                  labelColor: AppColors.background,
                  unselectedLabelColor: AppColors.textSecondary,
                  labelStyle: const TextStyle(
                      fontWeight: FontWeight.w700, fontSize: 13),
                  dividerColor: Colors.transparent,
                  padding: const EdgeInsets.all(3),
                  tabs: const [Tab(text: 'Store'), Tab(text: 'Tire Shop')],
                ),
              ),
            ),

            // ── Tab Body ──────────────────────────────────────────────
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _MainStoreView(
                    searchQuery: _searchQuery,
                    onTireShopTap: () => _tabController.animateTo(1),
                  ),
                  _TireShopView(
                    selectedVehicle: _selectedVehicle,
                    onVehicleChange: (v) =>
                        setState(() => _selectedVehicle = v),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN STORE VIEW
// ══════════════════════════════════════════════════════════════════════════════
class _MainStoreView extends ConsumerWidget {
  final String searchQuery;
  final VoidCallback onTireShopTap;

  const _MainStoreView(
      {required this.searchQuery, required this.onTireShopTap});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categoriesAsync = ref.watch(categoriesFutureProvider);
    final selectedCategory = ref.watch(_categoryFilterProvider);

    IconData getIconForCategory(String name) {
      final n = name.toLowerCase();
      if (n.contains('oil')) return Icons.opacity_rounded;
      if (n.contains('brake')) return Icons.radio_button_checked_rounded;
      if (n.contains('tyre') || n.contains('tire')) return Icons.tire_repair_rounded;
      if (n.contains('belt')) return Icons.settings_rounded;
      if (n.contains('accessory')) return Icons.star_rounded;
      if (n.contains('filter')) return Icons.air_rounded;
      if (n.contains('battery')) return Icons.battery_charging_full_rounded;
      return Icons.category_rounded;
    }

    final productsAsync = ref.watch(productsFutureProvider);

    return productsAsync.when(
      loading: () => const Center(child: CircularProgressIndicator(color: AppColors.accent)),
      error: (err, stack) => Center(child: Text('Error loading products', style: const TextStyle(color: Colors.red))),
      data: (allProducts) {
        // Filter products
        var products = allProducts.where((p) {
          final matchesCategory =
              selectedCategory == 'All' || p.category == selectedCategory;
          final matchesSearch = searchQuery.isEmpty ||
              p.name.toLowerCase().contains(searchQuery) ||
              p.brand.toLowerCase().contains(searchQuery) ||
              p.category.toLowerCase().contains(searchQuery);
          return matchesCategory && matchesSearch;
        }).toList();

        return CustomScrollView(
      slivers: [
        // ── Promo Banner ──────────────────────────────────────────────
        if (searchQuery.isEmpty)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: _PromoBanner(),
            ),
          ),

        // ── Category chips ─────────────────────────────────────────────
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 20, 0, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Categories',
                    style: TextStyle(
                        color: AppColors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w700)),
                const SizedBox(height: 12),
                categoriesAsync.when(
                  loading: () => const SizedBox(height: 90, child: Center(child: CircularProgressIndicator())),
                  error: (err, stack) => const Text('Error loading categories', style: TextStyle(color: Colors.red)),
                  data: (catList) {
                    // Prepend "All" category
                    final displayCats = [
                      {'name': 'All'},
                      ...catList
                    ];
                    
                    return SizedBox(
                      height: 90,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.only(right: 20),
                        itemCount: displayCats.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 10),
                        itemBuilder: (context, i) {
                          final cat = displayCats[i];
                          final label = cat['name']?.toString() ?? '';
                          final icon = label == 'All' ? Icons.apps_rounded : getIconForCategory(label);
                          final isSelected = selectedCategory == label;
                          return GestureDetector(
                            onTap: () {
                              ref.read(_categoryFilterProvider.notifier).state = label;
                              if (label.toLowerCase().contains('tire') || label.toLowerCase().contains('tyre')) {
                                onTireShopTap();
                              }
                            },
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              width: 72,
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? AppColors.accent.withValues(alpha:0.12)
                                    : AppColors.surface,
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(
                                  color: isSelected
                                      ? AppColors.accent
                                      : AppColors.border,
                                  width: isSelected ? 1.5 : 1,
                                ),
                              ),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(icon,
                                      color: isSelected
                                          ? AppColors.accent
                                          : AppColors.textSecondary,
                                      size: 26),
                                  const SizedBox(height: 6),
                                  Text(
                                    label,
                                    style: TextStyle(
                                      fontSize: label.length > 6 ? 9 : 10,
                                      fontWeight: isSelected
                                          ? FontWeight.w700
                                          : FontWeight.w500,
                                      color: isSelected
                                          ? AppColors.accent
                                          : AppColors.textSecondary,
                                    ),
                                    textAlign: TextAlign.center,
                                    maxLines: 2,
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    );
                  }
                ),
              ],
            ),
          ),
        ),

        // ── Product count header ────────────────────────────────────────
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  selectedCategory == 'All'
                      ? 'All Products'
                      : selectedCategory,
                  style: const TextStyle(
                      color: AppColors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w700),
                ),
                Text(
                  '${products.length} items',
                  style: const TextStyle(
                      color: AppColors.textSecondary, fontSize: 12),
                ),
              ],
            ),
          ),
        ),

        // ── Product list ───────────────────────────────────────────────
        products.isEmpty
            ? SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(40),
                  child: Column(
                    children: [
                      const Icon(Icons.search_off_rounded,
                          color: AppColors.textMuted, size: 48),
                      const SizedBox(height: 12),
                      Text(
                        'No products found for "$searchQuery"',
                        style: const TextStyle(
                            color: AppColors.textSecondary, fontSize: 14),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              )
            : SliverPadding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) =>
                        _ProductTile(product: products[index]),
                    childCount: products.length,
                  ),
                ),
              ),
      ],
    );
    });
  }
}

// ── Promo Banner ─────────────────────────────────────────────────────────────
class _PromoBanner extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1A1A00), Color(0xFF2A2A00)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.accent.withValues(alpha:0.4)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.accent,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: const Text('20% OFF',
                      style: TextStyle(
                          color: AppColors.background,
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.5)),
                ),
                const SizedBox(height: 8),
                const Text('Premium Oils\nThis Week',
                    style: TextStyle(
                        color: AppColors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        height: 1.2,
                        letterSpacing: -0.3)),
                const SizedBox(height: 12),
                ElevatedButton(
                  onPressed: () {
                    ref.read(_categoryFilterProvider.notifier).state = 'Engine Oil'; // Changed to common oil category
                  },
                  style: ElevatedButton.styleFrom(
                    minimumSize: Size.zero,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 10),
                  ),
                  child: const Text('Shop Now'),
                ),
              ],
            ),
          ),
          const Icon(Icons.opacity_rounded,
              size: 80, color: AppColors.accent),
        ],
      ),
    );
  }
}

// ── Product Tile (uses ProductIcon — no network) ─────────────────────────────
class _ProductTile extends ConsumerWidget {
  final Product product;
  const _ProductTile({required this.product});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: GestureDetector(
        onTap: () => Navigator.push(context,
            MaterialPageRoute(
                builder: (_) => ProductDetailScreen(product: product))),
        child: AppCard(
          child: Row(
            children: [
              // ── Flutter-drawn icon (no network needed) ──────────────
              ProductIcon(category: product.category, size: 60),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${product.brand} ${product.name}',
                      style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: AppColors.white),
                    ),
                    const SizedBox(height: 3),
                    if (product.specs != null)
                      Text(product.specs!,
                          style: const TextStyle(
                              fontSize: 11, color: AppColors.textMuted)),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Text('${product.price.toStringAsFixed(0)} EGP',
                            style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                color: AppColors.accent)),
                        if (product.rating != null) ...[
                          const SizedBox(width: 10),
                          const Icon(Icons.star_rounded,
                              color: AppColors.accent, size: 12),
                          const SizedBox(width: 2),
                          Text(product.rating!.toStringAsFixed(1),
                              style: const TextStyle(
                                  color: AppColors.accent,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600)),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton(
                onPressed: () async {
                  await ref.read(cartProvider.notifier).addItem(product);
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                    backgroundColor: AppColors.surface,
                    behavior: SnackBarBehavior.floating,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)),
                    content: Text('${product.name} added',
                        style: const TextStyle(color: AppColors.white)),
                    duration: const Duration(seconds: 1),
                  ));
                },
                style: ElevatedButton.styleFrom(
                  minimumSize: Size.zero,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                ),
                child: const Text('Add'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// TIRE SHOP VIEW
// ══════════════════════════════════════════════════════════════════════════════
class _TireShopView extends ConsumerWidget {
  final String selectedVehicle;
  final ValueChanged<String> onVehicleChange;

  const _TireShopView(
      {required this.selectedVehicle, required this.onVehicleChange});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productsAsync = ref.watch(productsFutureProvider);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Vehicle dropdown
          // Vehicle dropdown
          const Text('Your Vehicle',
              style: TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 12,
                  fontWeight: FontWeight.w500)),
          const SizedBox(height: 8),
          ref.watch(vehiclesFutureProvider).when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, stack) => const Text('Error loading vehicles', style: TextStyle(color: Colors.red)),
            data: (vehicleList) {
              final items = vehicleList.map((v) => '${v.make} ${v.model} ${v.year}').toList();
              // Ensure selectedVehicle is in the list
              String? value = selectedVehicle;
              if (items.isEmpty) {
                return const Text('No vehicles added to your garage', style: TextStyle(color: AppColors.textMuted));
              }
              if (!items.contains(value)) {
                value = items.first;
              }
              
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: DropdownButton<String>(
                  value: value,
                  isExpanded: true,
                  dropdownColor: AppColors.surface,
                  underline: const SizedBox(),
                  style: const TextStyle(
                      color: AppColors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w500),
                  icon: const Icon(Icons.keyboard_arrow_down_rounded,
                      color: AppColors.textSecondary),
                  items: items
                      .map((v) => DropdownMenuItem(value: v, child: Text(v)))
                      .toList(),
                  onChanged: (v) => onVehicleChange(v!),
                ),
              );
            }
          ),
          const SizedBox(height: 16),

          // Emergency banner
          EmergencyBanner(
            title: 'EMERGENCY TIRE CHANGE',
            subtitle: 'Flat tire? We\'ll come to you within 30 min.',
            buttonLabel: 'Request Now',
            onTap: () => Navigator.push(context,
                MaterialPageRoute(builder: (_) => const EmergencyScreen())),
          ),
          const SizedBox(height: 24),

          const SectionHeader(title: 'Available Tires'),
          const SizedBox(height: 14),
          productsAsync.when(
            loading: () => const Center(child: CircularProgressIndicator(color: AppColors.accent)),
            error: (err, stack) => const Text('Error loading tires', style: TextStyle(color: Colors.red)),
            data: (allProducts) {
              final tires = allProducts.where((p) => p.category.contains('Tyres') || p.category.contains('Tires')).toList();
              if (tires.isEmpty) {
                return const Center(child: Padding(
                  padding: EdgeInsets.all(20.0),
                  child: Text('No tires available in the store', style: TextStyle(color: AppColors.textMuted)),
                ));
              }
              return Column(
                children: tires.map((product) => _TireTileFromProduct(product: product)).toList(),
              );
            },
          ),
        ],
      ),
    );
  }
}

// ── Tire Tile From Product ───────────────────────────────────────────────────
class _TireTileFromProduct extends ConsumerWidget {
  final Product product;
  const _TireTileFromProduct({required this.product});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: AppCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                // Drawn tire icon
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: const Color(0xFF0D1A00),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                        color: AppColors.accent.withValues(alpha:0.3)),
                  ),
                  child: const Icon(Icons.tire_repair_rounded,
                      color: AppColors.accent, size: 28),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(product.brand,
                          style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w800,
                              color: AppColors.accent)),
                      Text(product.name,
                          style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: AppColors.white)),
                      const SizedBox(height: 4),
                      if (product.specs != null)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.surfaceVariant,
                            borderRadius: BorderRadius.circular(5),
                          ),
                          child: Text(product.specs!,
                              style: const TextStyle(
                                  color: AppColors.textSecondary,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600)),
                        ),
                    ],
                  ),
                ),
                if (product.rating != null)
                  Row(
                    children: [
                      const Icon(Icons.star_rounded,
                          color: AppColors.accent, size: 14),
                      const SizedBox(width: 3),
                      Text(product.rating!.toStringAsFixed(1),
                          style: const TextStyle(
                              color: AppColors.accent,
                              fontSize: 13,
                              fontWeight: FontWeight.w700)),
                    ],
                  ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: Text('${product.price.toStringAsFixed(0)} EGP / tire',
                      style: const TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w800,
                          color: AppColors.white),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis),
                ),
                const SizedBox(width: 10),
                ElevatedButton.icon(
                onPressed: () async {
                  await ref.read(cartProvider.notifier).addItem(product);
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                    content: Text('${product.name} added to cart'),
                  ));
                },
                  icon: const Icon(Icons.shopping_cart_rounded,
                      size: 14, color: AppColors.background),
                  label: const Text('Add to Cart'),
                  style: ElevatedButton.styleFrom(
                    minimumSize: Size.zero,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 10),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}


