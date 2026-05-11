import 'dart:io';

void main() {
  final dir = Directory('lib');
  final files = dir.listSync(recursive: true).whereType<File>().where((f) => f.path.endsWith('.dart'));
  
  final RegExp arabicPattern = RegExp(r'[\u0600-\u06FF]+');

  for (var file in files) {
    try {
      final lines = file.readAsLinesSync();
      for (var i = 0; i < lines.length; i++) {
        final line = lines[i];
        if (arabicPattern.hasMatch(line)) {
          print('${file.path}:${i+1}: ${line.trim()}');
        }
      }
    } catch (e) {
      // ignore
    }
  }
}
