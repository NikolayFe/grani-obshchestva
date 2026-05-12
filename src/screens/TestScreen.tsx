import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const testQuestions = [
  {
    id: 1,
    question: 'Что такое правоспособность?',
    options: [
      'Способность иметь права и нести обязанности',
      'Способность своими действиями приобретать и осуществлять права',
      'Дееспособность граждан с 18 лет',
      'Документ, подтверждающий права человека',
    ],
    correct: 0,
  },
  {
    id: 2,
    question: 'В каком возрасте наступает полная дееспособность?',
    options: ['В 14 лет', 'В 16 лет', 'В 18 лет', 'В 21 год'],
    correct: 2,
  },
];

export default function TestScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const question = testQuestions[currentQuestion];
  const isLastAnswered = currentQuestion === testQuestions.length - 1 && selectedAnswer !== null;

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    if (index === question.correct) {
      setScore(score + 1);
    }
    setTimeout(() => {
      if (currentQuestion < testQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      }
    }, 500);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.questionNumber}>Вопрос {currentQuestion + 1}/{testQuestions.length}</Text>
            <View style={styles.scoreBadge}>
              <Ionicons name="trophy" size={14} color={colors.tertiary.main} />
              <Text style={styles.scoreText}>{score} балл.</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentQuestion + 1) / testQuestions.length) * 100}%` },
              ]}
            />
          </View>
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.question}>{question.question}</Text>

          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => (
              <Pressable
                key={index}
                style={[
                  styles.option,
                  selectedAnswer === index && styles.optionSelected,
                  selectedAnswer === index && index === question.correct
                    ? styles.optionCorrect
                    : selectedAnswer === index && index !== question.correct
                    ? styles.optionIncorrect
                    : {},
                ]}
                onPress={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
              >
                  <View style={styles.optionLeading}>
                    <Text style={styles.optionLetter}>{String.fromCharCode(65 + index)}</Text>
                  </View>
                <Text
                  style={[
                    styles.optionText,
                    selectedAnswer === index && styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {isLastAnswered && (
          <View style={styles.resultCard}>
            <Text style={styles.resultText}>
              Вы набрали {score}/{testQuestions.length} баллов
            </Text>
            <Text style={styles.resultPercent}>
              {Math.round((score / testQuestions.length) * 100)}%
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  header: {
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: '#FFF8EA',
    borderRadius: 999,
  },
  scoreText: {
    color: colors.tertiary.dark,
    fontSize: 12,
    fontWeight: '700',
  },
  progressBar: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.main,
  },
  questionContainer: {
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    padding: 14,
  },
  question: {
    fontSize: 21,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionSelected: {
    borderColor: colors.primary.main,
  },
  optionCorrect: {
    borderColor: colors.secondary.main,
    backgroundColor: `${colors.secondary.main}10`,
  },
  optionIncorrect: {
    borderColor: colors.error,
    backgroundColor: `${colors.error}10`,
  },
  optionLeading: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetter: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: colors.primary.main,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: colors.primary.main,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  resultText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.light,
    marginBottom: 8,
  },
  resultPercent: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.text.light,
  },
});

