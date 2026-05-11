import 'dart:io';

void main() {
  final dir = Directory('lib');
  final files = dir.listSync(recursive: true).whereType<File>().where((f) => f.path.endsWith('.dart'));
  
  final RegExp arabicPattern = RegExp(r'[\u0600-\u06FF]+');
  
  final Map<String, String> stringReplacements = {
    '"جاري تحديد موقعك..."': '"Locating your position..."',
    '"خدمات الموقع معطلة"': '"Location services disabled"',
    '"تم رفض صلاحية الموقع"': '"Location permission denied"',
    '"فشل في تحديد العنوان"': '"Failed to determine address"',
    '"e.g., 6593 ج ي ب"': '"e.g., ABC 123"',
    '"Search in Egypt (عربي / English)"': '"Search locations..."',
  };

  int filesModified = 0;

  for (var file in files) {
    try {
      final lines = file.readAsLinesSync();
      bool modified = false;
      final newLines = <String>[];

      for (var i = 0; i < lines.length; i++) {
        String line = lines[i];
        
        // Skip purely comment lines that contain Arabic
        if (line.trim().startsWith('//') && arabicPattern.hasMatch(line)) {
          modified = true;
          continue;
        }

        // Replace specific string literals
        for (var entry in stringReplacements.entries) {
          if (line.contains(entry.key)) {
            line = line.replaceAll(entry.key, entry.value);
            modified = true;
          }
        }
        
        // Strip inline Arabic comments if any (e.g., code // arabic comment)
        if (line.contains('//') && arabicPattern.hasMatch(line)) {
            final commentIndex = line.indexOf('//');
            line = line.substring(0, commentIndex).trimRight();
            modified = true;
        }

        newLines.add(line);
      }

      if (modified) {
        file.writeAsStringSync(newLines.join('\n') + '\n');
        filesModified++;
        print('Modified: \${file.path}');
      }
    } catch (e) {
      print('Error processing \${file.path}: \$e');
    }
  }
  
  print('Total files modified: \$filesModified');
}
