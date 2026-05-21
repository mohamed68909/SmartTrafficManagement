import 'dart:convert';
import '../network/api_client.dart';
import '../network/api_constants.dart';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

class DiagnosticAnswer {
  final String id;
  final String text;
  final bool leadsToResult;

  const DiagnosticAnswer({
    required this.id,
    required this.text,
    required this.leadsToResult,
  });

  factory DiagnosticAnswer.fromJson(Map<String, dynamic> json) =>
      DiagnosticAnswer(
        id: json['id'] ?? '',
        text: json['text'] ?? '',
        leadsToResult: json['leadsToResult'] ?? false,
      );
}

class DiagnosticQuestion {
  final String id;
  final String text;
  final List<DiagnosticAnswer> answers;

  const DiagnosticQuestion({
    required this.id,
    required this.text,
    required this.answers,
  });

  factory DiagnosticQuestion.fromJson(Map<String, dynamic> json) =>
      DiagnosticQuestion(
        id: json['id'] ?? '',
        text: json['text'] ?? '',
        answers: (json['answers'] as List<dynamic>? ?? [])
            .map((a) => DiagnosticAnswer.fromJson(a))
            .toList(),
      );
}

class DiagnosticResult {
  final String id;
  final String title;
  final String description;
  final String recommendedServiceType;
  final String urgency;
  final String? tip;

  const DiagnosticResult({
    required this.id,
    required this.title,
    required this.description,
    required this.recommendedServiceType,
    required this.urgency,
    this.tip,
  });

  factory DiagnosticResult.fromJson(Map<String, dynamic> json) =>
      DiagnosticResult(
        id: json['id'] ?? '',
        title: json['title'] ?? '',
        description: json['description'] ?? '',
        recommendedServiceType: json['recommendedServiceType'] ?? '',
        urgency: json['urgency'] ?? 'Medium',
        tip: json['tip'],
      );
}

class DiagnosticStep {
  final bool isComplete;
  final DiagnosticQuestion? nextQuestion;
  final DiagnosticResult? result;

  const DiagnosticStep({
    required this.isComplete,
    this.nextQuestion,
    this.result,
  });

  factory DiagnosticStep.fromJson(Map<String, dynamic> json) => DiagnosticStep(
        isComplete: json['isComplete'] ?? false,
        nextQuestion: json['nextQuestion'] != null
            ? DiagnosticQuestion.fromJson(json['nextQuestion'])
            : null,
        result: json['result'] != null
            ? DiagnosticResult.fromJson(json['result'])
            : null,
      );
}

// ─── Service ──────────────────────────────────────────────────────────────────

class DiagnosticService {
  /// Fetches the root question (entry point of the decision tree).
  static Future<DiagnosticQuestion?> startDiagnostic() async {
    try {
      final response = await ApiClient.get(ApiConstants.diagnosticsStartUrl);
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        return DiagnosticQuestion.fromJson(body['data']);
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  /// Submits the selected answer ID.
  /// Returns the next question or the final result.
  static Future<DiagnosticStep?> submitAnswer(String answerId) async {
    try {
      final response = await ApiClient.post(
        ApiConstants.diagnosticsAnswerUrl,
        {'answerId': answerId},
      );
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        return DiagnosticStep.fromJson(body['data']);
      }
      return null;
    } catch (_) {
      return null;
    }
  }
}
