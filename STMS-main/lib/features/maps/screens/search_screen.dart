import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  List<dynamic> _suggestions = [];
  Timer? _debounce;
  bool _isSearching = false;

  static List<Map<String, dynamic>> _recentSearches = [];

  void _onSearchChanged(String query) {
    if (_debounce?.isActive ?? false) _debounce!.cancel();
    
    _debounce = Timer(const Duration(milliseconds: 500), () {
      if (query.isNotEmpty) {
        _fetchSuggestions(query);
      } else {
        if (mounted) {
          setState(() => _suggestions = []);
        }
      }
    });
  }

  Future<void> _fetchSuggestions(String query) async {
    if (!mounted) return;
    setState(() => _isSearching = true);
    
    final url = 'https://nominatim.openstreetmap.org/search?'
        'q=$query&format=json&addressdetails=1&limit=5&countrycodes=eg';

    try {
      final response = await http.get(
        Uri.parse(url), 
        headers: {
          'Accept-Language': 'ar,en',
          'User-Agent': 'SmartTrafficApp_Ziad_Project',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        if (mounted) {
          setState(() {
            _suggestions = data;
            _isSearching = false;
          });
        }
      } else {
        if (mounted) setState(() => _isSearching = false);
      }
    } catch (e) {
      debugPrint("Search Error: $e");
      if (mounted) setState(() => _isSearching = false);
    }
  }

  void _handleLocationSelect(String title, String subtitle, LatLng coords) {
    setState(() {
      _recentSearches.removeWhere((item) => item['title'] == title);
      _recentSearches.insert(0, {
        "title": title,
        "subtitle": subtitle,
        "coords": coords,
      });
      if (_recentSearches.length > 5) _recentSearches.removeLast();
    });

    Navigator.pop(context, coords);
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F0F),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 10.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                IconButton(
                  icon: const Icon(Icons.arrow_back, color: Colors.white),
                  onPressed: () => Navigator.pop(context),
                ),
                const SizedBox(height: 10),
                const Text(
                  "Explore Places",
                  style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 20),
                
                Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFF1A1A1A),
                    borderRadius: BorderRadius.circular(15),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: TextField(
                    controller: _searchController,
                    autofocus: true,
                    style: const TextStyle(color: Colors.white),
                    textInputAction: TextInputAction.search,
                    onChanged: _onSearchChanged,
                    onSubmitted: (value) {
                      if (_suggestions.isNotEmpty) {
                        final place = _suggestions[0];
                        final String name = place['display_name'].split(',')[0];
                        final LatLng coords = LatLng(
                          double.parse(place['lat']), 
                          double.parse(place['lon'])
                        );
                        _handleLocationSelect(name, place['display_name'], coords);
                      }
                    },
                    decoration: InputDecoration(
                      hintText: "Search locations...",
                      hintStyle: const TextStyle(color: Colors.white38),
                      prefixIcon: const Icon(Icons.search, color: Colors.white54),
                      suffixIcon: _isSearching 
                          ? const Padding(
                              padding: EdgeInsets.all(12.0),
                              child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFFCCFF00)),
                            )
                          : null,
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(vertical: 15),
                    ),
                  ),
                ),

                if (_suggestions.isNotEmpty) ...[
                  const SizedBox(height: 20),
                  const Text("Suggestions", style: TextStyle(color: Color(0xFFCCFF00), fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _suggestions.length,
                    itemBuilder: (context, index) {
                      final place = _suggestions[index];
                      final String name = place['display_name'].split(',')[0];
                      final LatLng coords = LatLng(double.parse(place['lat']), double.parse(place['lon']));
                      
                      return _buildLocationTile(name, place['display_name'], coords, Icons.location_on_outlined);
                    },
                  ),
                ],

                const SizedBox(height: 30),
                const Text("Recent Searches", style: TextStyle(color: Colors.white54, fontWeight: FontWeight.bold)),
                const SizedBox(height: 15),
                
                if (_recentSearches.isEmpty && _suggestions.isEmpty)
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.only(top: 20),
                      child: Text("Start searching for places in Egypt", style: TextStyle(color: Colors.white12)),
                    ),
                  )
                else
                  ..._recentSearches.map((place) => _buildLocationTile(
                    place['title'], place['subtitle'], place['coords'], Icons.history
                  )),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLocationTile(String title, String subtitle, LatLng coords, IconData icon) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF161616),
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: Colors.white.withValues(alpha:0.05)),
      ),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.black.withValues(alpha:0.24), 
            borderRadius: BorderRadius.circular(10)
          ),
          child: Icon(icon, color: const Color(0xFFCCFF00), size: 20),
        ),
        title: Text(
          title, 
          maxLines: 1, 
          overflow: TextOverflow.ellipsis, 
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)
        ),
        subtitle: Text(
          subtitle, 
          maxLines: 1, 
          overflow: TextOverflow.ellipsis, 
          style: const TextStyle(color: Colors.white54, fontSize: 11)
        ),
        onTap: () => _handleLocationSelect(title, subtitle, coords),
      ),
    );
  }
}
