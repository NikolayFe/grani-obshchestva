import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { getCategories, getTerms, getCategoryTestStagesProgress } from '../api/contentApi';
import { useGlossary } from '../contexts/GlossaryContext';

const categoryUiMeta: Record<
  string,
  {
    description: string;
    icon: 'scale' | 'trending-up' | 'document-text' | 'people';
    bg: string;
  }
> = {
  'grazhdanskoe-pravo': {
    description: 'Основы норм правовой системы и гражданских прав.',
    icon: 'scale',
    bg: '#F5EAFF',
  },
  ekonomika: {
    description: 'Основы микро и макроэкономики, рыночные механизмы.',
    icon: 'trending-up',
    bg: '#E8FAF0',
  },
  konstituciya: {
    description: 'Главный акт государства, права и свободы.',
    icon: 'document-text',
    bg: '#EBEBFF',
  },
  sociologiya: {
    description: 'Социальные группы, статусы, роли и общественные процессы.',
    icon: 'people',
    bg: '#FFF8E0',
  },
};

function ProgressBar({ progress, color, bg }: { progress: number; color: string; bg: string }) {
  return (
    <View style={{ marginTop: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
        <Text style={{ fontSize: 12, color: '#7C7480', fontWeight: '500' }}>Прогресс</Text>
        <Text style={{ fontSize: 12, fontWeight: '700', color }}>{Math.round(progress * 100)}%</Text>
      </View>
      <View style={{ height: 7, borderRadius: 999, backgroundColor: bg }}>
        <View style={{ height: 7, borderRadius: 999, backgroundColor: color, width: `${Math.round(progress * 100)}%` }} />
      </View>
    </View>
  );
}

export default function CategoriesScreen({ navigation }: any) {
  const [categories, setCategories] = useState<any[]>([]);
  const [errorText, setErrorText] = useState('');
  const [allTerms, setAllTerms] = useState<any[]>([]);
  const [testProgressBySlug, setTestProgressBySlug] = useState<Record<string, number>>({});
  
  const { knownTermIds, userId } = useGlossary();

  const loadData = React.useCallback(async (mountedRef?: { current: boolean }) => {
    try {
      setErrorText('');

      const categories = await getCategories();
      const terms = await getTerms();

      if (mountedRef && !mountedRef.current) return;

      setAllTerms(terms);

      const mapped = categories.map((item) => {
        const meta = categoryUiMeta[item.slug] || {
          description: 'Учебная категория',
          icon: 'document-text' as const,
          bg: '#F3F4F6',
        };

        const total = item._count?.terms ?? 0;

        return {
          id: item.id,
          title: item.title,
          description: meta.description,
          icon: meta.icon,
          color: item.color,
          bg: meta.bg,
          terms: 0,
          total,
          slug: item.slug,
          categoryId: item.id,
        };
      });

      setCategories(mapped);

      if (userId) {
        const testProgressEntries = await Promise.all(
          mapped.map(async (item) => {
            try {
              const progress = await getCategoryTestStagesProgress(userId, item.slug);
              return [item.slug, progress.testsProgressPercent] as const;
            } catch {
              return [item.slug, 0] as const;
            }
          })
        );

        if (!mountedRef || mountedRef.current) {
          setTestProgressBySlug(Object.fromEntries(testProgressEntries));
        }
      } else {
        setTestProgressBySlug({});
      }
    } catch (error: any) {
      if (!mountedRef || mountedRef.current) {
        setErrorText(error?.message || 'Не удалось загрузить категории');
      }
    }
  }, [userId]);

  useEffect(() => {
    const mountedRef = { current: true };
    void loadData(mountedRef);

    return () => {
      mountedRef.current = false;
    };
  }, [loadData]);

  useFocusEffect(
    React.useCallback(() => {
      void loadData();
    }, [loadData])
  );

  const hasCategories = useMemo(() => categories.length > 0, [categories.length]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.appName}>Грани общества</Text>
          </View>
          <View style={styles.xpBadge}>
            <Ionicons name="star" size={13} color={colors.secondary.main} />
            <Text style={styles.xpText}>1340 XP</Text>
            <View style={styles.xpDivider} />
            <Ionicons name="flame" size={13} color={colors.tertiary.main} />
            <Text style={styles.xpText}>15</Text>
          </View>
        </View>

        <Text style={styles.pageTitle}>Категории</Text>
        <Text style={styles.pageSubtitle}>
          Выберите категорию, чтобы продолжить обучение.
        </Text>

        <Pressable
          style={styles.dailyCard}
          onPress={() =>
            navigation.navigate('Test', {
              testMode: 'daily',
              categoryTitle: 'Ежедневный тест',
              categoryColor: '#F97316',
            })
          }
        >
          <View style={styles.dailyTopRow}>
            <View style={styles.dailyIconWrap}>
              <Ionicons name="flash" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.dailyLivesWrap}>
              <Text style={styles.dailyLivesText}>Жизни: ❤❤❤</Text>
            </View>
          </View>

          <Text style={styles.dailyTitle}>Ежедневное тестирование</Text>
          <Text style={styles.dailyDesc}>
            Смешанный тест по всем категориям + вопросы по терминам из глоссария.
          </Text>

          <View style={styles.dailyButton}>
            <Text style={styles.dailyButtonText}>Начать сейчас</Text>
            <Ionicons name="arrow-forward" size={15} color="#F97316" />
          </View>
        </Pressable>

        <View style={styles.list}>
          {errorText.length > 0 && <Text style={styles.errorText}>{errorText}</Text>}

          {!hasCategories && errorText.length === 0 && (
            <Text style={styles.emptyText}>Загрузка категорий...</Text>
          )}

          {categories.map((cat) => {
            // Считаем сколько терминов из этой категории пользователь уже знает
            const categoryTerms = allTerms.filter(
              (term) => term.category.id === cat.categoryId
            );
            
            const knownInCategory = categoryTerms.filter(
              (term) => knownTermIds.includes(term.id)
            ).length;
            
            // Прогресс: 50% от глоссария (выученные карточки) + 50% от теста
            const glossaryProgress = categoryTerms.length > 0 
              ? (knownInCategory / categoryTerms.length) * 0.5
              : 0;
            const testProgress = (testProgressBySlug[cat.slug] || 0) / 100;
            const totalProgress = glossaryProgress + testProgress;
            
            return (
              <Pressable
                key={cat.id}
                style={[styles.card, { borderLeftColor: cat.color }]}
                onPress={() =>
                  navigation.navigate('CategoryTopic', {
                    category: {
                      ...cat,
                      terms: knownInCategory,
                      testProgressPercent: Math.round(testProgress * 100),
                      overallProgressPercent: Math.round(totalProgress * 100),
                    },
                  })
                }
              >
                <View style={styles.cardTop}>
                  <View style={[styles.iconCircle, { backgroundColor: cat.bg }]}>
                    <Ionicons name={cat.icon} size={26} color={cat.color} />
                  </View>
                  <View style={styles.cardMeta}>
                    <Text style={[styles.cardTerms, { color: cat.color }]}>
                      {knownInCategory}/{cat.total} терминов
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={cat.color} />
                  </View>
                </View>

                <Text style={styles.cardTitle}>{cat.title}</Text>
                <Text style={styles.cardDesc}>{cat.description}</Text>

                <ProgressBar progress={totalProgress} color={cat.color} bg={cat.bg} />
              </Pressable>
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
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 13,
    color: '#B42318',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 10,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  appName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8EDFB',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.primary,
  },
  xpDivider: {
    width: 1,
    height: 12,
    backgroundColor: colors.border,
    marginHorizontal: 2,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 14,
  },
  dailyCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FED7AA',
    padding: 16,
    marginBottom: 16,
  },
  dailyTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dailyIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyLivesWrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dailyLivesText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C2410C',
  },
  dailyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#7C2D12',
    marginBottom: 4,
  },
  dailyDesc: {
    fontSize: 13,
    color: '#9A3412',
    lineHeight: 18,
    marginBottom: 12,
  },
  dailyButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  dailyButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EA580C',
  },
  list: {
    gap: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderLeftWidth: 5,
    borderColor: colors.border,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 5,
  },
  cardDesc: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 19,
  },
  cardTerms: {
    fontSize: 12,
    fontWeight: '700',
  },
});
