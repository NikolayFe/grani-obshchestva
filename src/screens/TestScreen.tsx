import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useGlossary } from '../contexts/GlossaryContext';
import { useDailyLives } from '../contexts/DailyLivesContext';
import {
  ApiTestQuestion,
  loadTestQuestions,
  saveCategoryTestStageResult,
  saveTestAnswer,
  TestStageKey,
} from '../api/contentApi';

export default function TestScreen({ route, navigation }: any) {
  const testMode: string = route?.params?.testMode || 'category';
  const isDailyTest = testMode === 'daily';
  const isCategoryStage = testMode === 'category-stage';

  const categoryTitle: string = route?.params?.categoryTitle ?? 'Тестирование';
  const categoryColor: string = route?.params?.categoryColor ?? colors.primary.main;
  const categorySlug: string = route?.params?.categorySlug ?? '';

  const stageKey: TestStageKey | undefined = route?.params?.stageKey;
  const stageTitle: string = route?.params?.stageTitle ?? 'Тест';
  const routeQuestionLimit = route?.params?.questionLimit;
  const questionLimit: number = routeQuestionLimit == null ? 25 : Number(routeQuestionLimit);
  const requiredPercent: number = Number(route?.params?.requiredPercent ?? 80);
  const difficulty: number | undefined = route?.params?.difficulty;
  const weightPercent: number = Number(route?.params?.weightPercent ?? 0);

  const { userId } = useGlossary();

  const [questions, setQuestions] = useState<ApiTestQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [finished, setFinished] = useState(false);
  const [finishedByLives, setFinishedByLives] = useState(false);

  const {
    lives,
    msToNextLife,
    isLoading: isLivesLoading,
    consumeOneLife,
    forceSetLives,
  } = useDailyLives();

  const [stageSaved, setStageSaved] = useState(false);
  const [stageSaveError, setStageSaveError] = useState('');
  const [stageProgressAfterSave, setStageProgressAfterSave] = useState<number | null>(null);

  useEffect(() => {
    if (!isDailyTest) return;
    if (isLivesLoading) return;
    if (lives > 0) return;
    setFinishedByLives(true);
    setFinished(true);
  }, [isDailyTest, isLivesLoading, lives]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setIsLoading(true);
      setErrorText('');

      try {
        const loadedQuestions = await loadTestQuestions({
          categorySlug: categorySlug || undefined,
          limit: isDailyTest ? undefined : questionLimit,
          difficulty,
          includeAll: isDailyTest,
        });

        if (!mounted) return;
        setQuestions(loadedQuestions);
      } catch (error: any) {
        if (!mounted) return;
        setErrorText(error?.message || 'Не удалось загрузить вопросы');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [categorySlug, questionLimit, difficulty, isDailyTest]);

  const questionIndex = questions.length > 0 ? currentQuestion % questions.length : 0;
  const question = questions[questionIndex];
  const percent = useMemo(() => {
    const denominator = isDailyTest ? totalAnswered : questions.length;
    if (denominator === 0) return 0;
    return Math.round((score / denominator) * 100);
  }, [score, questions.length, isDailyTest, totalAnswered]);

  useEffect(() => {
    if (!finished) return;

    if (isDailyTest && finishedByLives) {
      void forceSetLives(0).catch(() => {
        // Если запись в storage недоступна, оставляем локальное состояние.
      });
    }

    if (!isCategoryStage || !stageKey || !categorySlug || !userId) return;
    if (stageSaved) return;

    let cancelled = false;

    const saveStageResult = async () => {
      try {
        setStageSaveError('');
        const response = await saveCategoryTestStageResult({
          userId,
          categorySlug,
          stageKey,
          score,
          totalQuestions: questions.length,
        });

        if (cancelled) return;
        setStageProgressAfterSave(response.testsProgressPercent);
        setStageSaved(true);
      } catch (error: any) {
        if (cancelled) return;
        setStageSaveError(error?.message || 'Не удалось сохранить результат этапа');
      }
    };

    void saveStageResult();

    return () => {
      cancelled = true;
    };
  }, [finished, isCategoryStage, stageKey, categorySlug, userId, score, questions.length, stageSaved]);

  const handleAnswer = (index: number) => {
    if (!question || selectedAnswer !== null) return;

    setSelectedAnswer(index);
    const chosenOption = question.options[index];
    const isCorrect = Boolean(chosenOption?.isCorrect);

    if (userId && chosenOption?.id && question.id && !isDailyTest) {
      void saveTestAnswer({
        userId,
        questionId: question.id,
        selectedOptionId: chosenOption.id,
      }).catch(() => {
        // Ошибки сохранения отдельного ответа не блокируют прохождение теста.
      });
    }

    setTimeout(() => {
      void (async () => {
      setTotalAnswered((prev) => prev + 1);

      if (!isCorrect && isDailyTest) {
        let nextLives = lives;
        try {
          const status = await consumeOneLife();
          nextLives = status.lives;
        } catch {
          nextLives = Math.max(0, lives - 1);
          try {
            await forceSetLives(nextLives);
          } catch {
            // игнорируем вторичную ошибку
          }
        }

        if (nextLives <= 0) {
          setFinishedByLives(true);
          setFinished(true);
          return;
        }
      }

      if (isCorrect) {
        setScore((prev) => prev + 1);
      }

      if (isDailyTest) {
        setCurrentQuestion((prev) => prev + 1);
        setSelectedAnswer(null);
        return;
      }

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
        setSelectedAnswer(null);
      } else {
        setFinished(true);
      }
      })();
    }, 400);
  };

  if (isLoading || isLivesLoading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={categoryColor} />
          <Text style={styles.stateText}>Загружаем вопросы...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (errorText.length > 0 || questions.length === 0) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.centeredState}>
          <Text style={styles.errorText}>{errorText || 'Вопросы не найдены'}</Text>
          <Pressable style={styles.primaryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.primaryButtonText}>Назад</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (finished) {
    const passed = percent >= requiredPercent;

    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.resultWrap}>
          <Text style={styles.resultTitle}>{isCategoryStage ? stageTitle : categoryTitle}</Text>

          <View style={[styles.resultScore, { borderColor: categoryColor }]}>
            <Text style={[styles.resultPercent, { color: categoryColor }]}>{percent}%</Text>
            <Text style={styles.resultMeta}>
              {score}/{isDailyTest ? totalAnswered : questions.length} правильных ответов
            </Text>
          </View>

          {!isDailyTest && (
            <Text style={[styles.resultPassText, { color: passed ? '#15803D' : '#B91C1C' }]}>
              {passed ? `Этап пройден. Засчитано +${weightPercent}% прогресса.` : `Этап не пройден. Нужно минимум ${requiredPercent}%.`}
            </Text>
          )}

          {finishedByLives && (
            <Text style={styles.resultLivesText}>
              Ежедневный тест завершен: закончились жизни.
              {msToNextLife > 0 ? ` Следующая жизнь появится примерно через ${Math.ceil(msToNextLife / (60 * 60 * 1000))} ч.` : ''}
            </Text>
          )}

          {stageProgressAfterSave !== null && (
            <Text style={styles.resultProgressText}>Текущий тестовый прогресс категории: {stageProgressAfterSave}%</Text>
          )}

          {!!stageSaveError && <Text style={styles.errorText}>{stageSaveError}</Text>}

          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Text style={styles.primaryButtonText}>{isCategoryStage ? 'К этапам тестирования' : 'Назад'}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={18} color={colors.text.primary} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{isCategoryStage ? stageTitle : categoryTitle}</Text>
            <Text style={styles.headerSubtitle}>
              {isDailyTest
                ? `Вопрос ${currentQuestion + 1} · без ограничения по количеству`
                : `Вопрос ${currentQuestion + 1} из ${questions.length}`}
            </Text>
          </View>
          {isDailyTest && <Text style={styles.livesText}>❤ {lives}</Text>}
        </View>

        {!isDailyTest && (
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.round(((currentQuestion + 1) / questions.length) * 100)}%`,
                  backgroundColor: categoryColor,
                },
              ]}
            />
          </View>
        )}

        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{question.text}</Text>

          <View style={styles.optionsWrap}>
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = option.isCorrect;

              return (
                <Pressable
                  key={option.id}
                  style={[
                    styles.optionButton,
                    isSelected && (isCorrect ? styles.optionCorrect : styles.optionWrong),
                  ]}
                  onPress={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                >
                  <Text style={styles.optionText}>{option.text}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: 30,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 10,
  },
  stateText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  errorText: {
    color: '#B91C1C',
    textAlign: 'center',
    fontSize: 13,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: colors.text.secondary,
  },
  livesText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#DC2626',
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFill: {
    height: '100%',
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
  },
  questionText: {
    fontSize: 19,
    lineHeight: 26,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 12,
  },
  optionsWrap: {
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  optionText: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
  },
  optionCorrect: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  optionWrong: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  resultWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    gap: 12,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    color: colors.text.primary,
  },
  resultScore: {
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
  },
  resultPercent: {
    fontSize: 42,
    fontWeight: '900',
  },
  resultMeta: {
    marginTop: 2,
    fontSize: 13,
    color: colors.text.secondary,
  },
  resultPassText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  resultLivesText: {
    fontSize: 12,
    color: '#B45309',
    textAlign: 'center',
  },
  resultProgressText: {
    fontSize: 13,
    color: '#1D4ED8',
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryButton: {
    marginTop: 4,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
