import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { useGlossary } from '../contexts/GlossaryContext';
import {
  getCategoryTestStagesProgress,
  CategoryTestStagesResponse,
  TestStageKey,
} from '../api/contentApi';

const fallbackStages = [
  {
    stageKey: 'basic_1' as TestStageKey,
    title: 'Тест 1',
    difficulty: 1,
    questionCount: 25,
    minPercent: 80,
    weightPercent: 5,
    passed: false,
    score: 0,
    totalQuestions: 25,
    completedAt: null,
  },
  {
    stageKey: 'basic_2' as TestStageKey,
    title: 'Тест 2',
    difficulty: 1,
    questionCount: 25,
    minPercent: 80,
    weightPercent: 5,
    passed: false,
    score: 0,
    totalQuestions: 25,
    completedAt: null,
  },
  {
    stageKey: 'final_3' as TestStageKey,
    title: 'Итоговое тестирование',
    difficulty: 3,
    questionCount: 35,
    minPercent: 80,
    weightPercent: 40,
    passed: false,
    score: 0,
    totalQuestions: 35,
    completedAt: null,
  },
];

export default function CategoryTestsScreen({ route, navigation }: any) {
  const category = route?.params?.category;
  const categorySlug: string = category?.slug || '';
  const categoryTitle: string = category?.title || 'Категория';
  const categoryColor: string = category?.color || colors.primary.main;

  const { userId } = useGlossary();
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [progress, setProgress] = useState<CategoryTestStagesResponse | null>(null);

  const loadProgress = useCallback(async () => {
    if (!userId || !categorySlug) {
      setProgress(null);
      return;
    }

    setLoading(true);
    setErrorText('');
    try {
      const data = await getCategoryTestStagesProgress(userId, categorySlug);
      setProgress(data);
    } catch (error: any) {
      setErrorText(error?.message || 'Не удалось загрузить прогресс тестов');
      setProgress(null);
    } finally {
      setLoading(false);
    }
  }, [userId, categorySlug]);

  useEffect(() => {
    void loadProgress();
  }, [loadProgress]);

  useFocusEffect(
    useCallback(() => {
      void loadProgress();
    }, [loadProgress])
  );

  const stages = useMemo(() => progress?.stages || fallbackStages, [progress]);
  const basicPassed = stages
    .filter((item) => item.stageKey === 'basic_1' || item.stageKey === 'basic_2')
    .every((item) => item.passed);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Тестирование</Text>
          <Text style={styles.subtitle}>{categoryTitle}</Text>
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>Прогресс тестов категории</Text>
          <Text style={[styles.progressValue, { color: categoryColor }]}> 
            {progress?.testsProgressPercent ?? 0}%
          </Text>
          <Text style={styles.progressHint}>Порог прохождения каждого этапа: 80% правильных ответов</Text>
        </View>

        {loading && (
          <View style={styles.loaderWrap}>
            <ActivityIndicator color={categoryColor} />
          </View>
        )}

        {!!errorText && <Text style={styles.errorText}>{errorText}</Text>}

        <View style={styles.list}>
          {stages.map((stage) => {
            const isFinal = stage.stageKey === 'final_3';
            const isLocked = isFinal && !basicPassed;

            return (
              <View key={stage.stageKey} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={[styles.badge, { backgroundColor: isLocked ? '#E5E7EB' : '#EEF2FF' }]}>
                    <Text style={[styles.badgeText, { color: isLocked ? '#6B7280' : '#4338CA' }]}> 
                      Сложность {stage.difficulty}
                    </Text>
                  </View>
                  {stage.passed ? (
                    <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                  ) : isLocked ? (
                    <Ionicons name="lock-closed" size={18} color="#9CA3AF" />
                  ) : null}
                </View>

                <Text style={styles.cardTitle}>{stage.title}</Text>
                <Text style={styles.cardMeta}>
                  {stage.questionCount} вопросов • Вес в прогрессе: {stage.weightPercent}%
                </Text>

                {stage.completedAt ? (
                  <Text style={styles.doneText}>Последний результат: {stage.score}/{stage.totalQuestions}</Text>
                ) : (
                  <Text style={styles.pendingText}>Этап еще не пройден</Text>
                )}

                <Pressable
                  style={[styles.startButton, isLocked && styles.startButtonDisabled]}
                  disabled={isLocked}
                  onPress={() =>
                    navigation.navigate('Test', {
                      categoryTitle,
                      categoryColor,
                      categorySlug,
                      testMode: 'category-stage',
                      stageKey: stage.stageKey,
                      stageTitle: stage.title,
                      questionLimit: stage.questionCount,
                      requiredPercent: stage.minPercent,
                      difficulty: stage.difficulty,
                      weightPercent: stage.weightPercent,
                    })
                  }
                >
                  <Text style={styles.startButtonText}>{isLocked ? 'Сначала пройди Тест 1 и Тест 2' : 'Начать этап'}</Text>
                  {!isLocked && <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />}
                </Pressable>
              </View>
            );
          })}
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
  header: {
    marginBottom: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 14,
    color: colors.text.secondary,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  progressValue: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  progressHint: {
    fontSize: 12,
    color: '#6B7280',
  },
  loaderWrap: {
    paddingVertical: 8,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 12,
    marginBottom: 8,
  },
  list: {
    gap: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badge: {
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
  },
  cardMeta: {
    marginTop: 2,
    fontSize: 12,
    color: '#6B7280',
  },
  doneText: {
    marginTop: 8,
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
  },
  pendingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
  },
  startButton: {
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  startButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});
