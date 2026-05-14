import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { AuthContext, LearningCategory } from '../navigation/AuthContext';

export default function CategoryTopicScreen({ route, navigation }: any) {
  const { setLastOpenedCategory } = React.useContext(AuthContext);
  const category: LearningCategory = route?.params?.category ?? {
    title: 'Конституция',
    description: 'Основы устройства государства и системы прав.',
    color: '#5B5BD6',
    bg: '#EBEBFF',
    icon: 'document-text',
    terms: 40,
    total: 50,
  };

  useEffect(() => {
    setLastOpenedCategory(category);
  }, [category, setLastOpenedCategory]);

  const learnedTerms = Number(category?.terms || 0);
  const totalTerms = Number(category?.total || 0);
  const fallbackProgressPercent = totalTerms > 0 ? Math.round((learnedTerms / totalTerms) * 100) : 0;
  const progressPercent = Number.isFinite(Number((category as any)?.overallProgressPercent))
    ? Number((category as any).overallProgressPercent)
    : fallbackProgressPercent;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.brand}>Грани общества</Text>
          <View style={styles.xpBadge}>
            <Text style={styles.xpText}>1240 XP</Text>
            <Text style={styles.xpDot}>•</Text>
            <Text style={styles.xpText}>12</Text>
          </View>
        </View>

        <View style={styles.titleRow}>
          <View style={styles.titleWrap}>
            <Text style={styles.pageTitle}>{category.title}</Text>
            <Text style={styles.pageSubtitle}>{category.description}</Text>
          </View>
          <View style={[styles.titleIcon, { backgroundColor: category.color }]}>
            <Ionicons name={category.icon} size={18} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>Общий прогресс</Text>
          <View style={styles.progressMetaRow}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPercent}%`, backgroundColor: category.color },
                ]}
              />
            </View>
            <Text style={[styles.progressPercent, { color: category.color }]}>{progressPercent}%</Text>
          </View>
          <Text style={styles.progressHint}>+350 XP заработано в этой категории</Text>
        </View>

        <View style={styles.sectionList}>
          <Pressable
            style={styles.sectionCard}
            onPress={() => navigation.navigate('Theory', { category })}
          >
            <View style={[styles.sectionIcon, { backgroundColor: '#F1EAFE' }]}>
              <Ionicons name="book" size={18} color={colors.primary.main} />
            </View>
            <View style={styles.sectionBody}>
              <Text style={styles.sectionTitle}>Теория</Text>
              <Text style={styles.sectionSubtitle}>Подробные материалы для чтения и ключевые концепции.</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.neutral.main} />
          </Pressable>

          <Pressable style={styles.sectionCard}>
            <View style={[styles.sectionIcon, { backgroundColor: '#F3EFF8' }]}>
              <Ionicons name="videocam" size={18} color={colors.neutral.dark} />
            </View>
            <View style={styles.sectionBody}>
              <Text style={styles.sectionTitle}>Видео материалы</Text>
              <Text style={styles.sectionMeta}>12 видео</Text>
            </View>
          </Pressable>

          <Pressable
            style={styles.sectionCard}
            onPress={() =>
              navigation.getParent()?.navigate('Glossary', {
                initialFilter: category.title,
              })
            }
          >
            <View style={[styles.sectionIcon, { backgroundColor: '#F3EFF8' }]}>
              <Ionicons name="language" size={18} color={colors.neutral.dark} />
            </View>
            <View style={styles.sectionBody}>
              <Text style={styles.sectionTitle}>Глоссарий</Text>
              <Text style={styles.sectionMeta}>{category.total} терминов</Text>
            </View>
          </Pressable>
        </View>

        <View style={[styles.testsCard, { backgroundColor: category.color }]}> 
          <View style={styles.testsHeader}>
            <View style={styles.testsIcon}>
              <Ionicons name="help-circle" size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.testsTitle}>Тесты</Text>
              <Text style={styles.testsSubtitle}>Проверь знания и получи XP для перехода дальше.</Text>
            </View>
          </View>
          <Pressable
            style={styles.testsButton}
            onPress={() => navigation.navigate('CategoryTests', { category })}
          >
            <Text style={styles.testsButtonText}>Начать тестирование</Text>
            <Ionicons name="arrow-forward" size={14} color={category.color} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F0F8',
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 30,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  brand: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary.main,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#EBDFF6',
    backgroundColor: '#FBF7FF',
    gap: 4,
  },
  xpText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  xpDot: {
    color: colors.neutral.light,
    fontSize: 10,
  },
  titleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  titleWrap: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 40,
    lineHeight: 42,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 10,
  },
  pageSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.text.secondary,
  },
  titleIcon: {
    width: 50,
    height: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE2F3',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#2A1238',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  progressMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  progressTrack: {
    flex: 1,
    height: 9,
    borderRadius: 999,
    backgroundColor: '#EDE5F4',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressHint: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  sectionList: {
    gap: 12,
  },
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE2F3',
    borderRadius: 22,
    padding: 16,
    minHeight: 84,
  },
  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionBody: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 3,
  },
  sectionSubtitle: {
    fontSize: 11,
    lineHeight: 15,
    color: colors.text.secondary,
  },
  sectionMeta: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  testsCard: {
    marginTop: 14,
    borderRadius: 24,
    padding: 16,
    shadowColor: '#2A1238',
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  testsHeader: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  testsIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  testsTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  testsSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 17,
  },
  testsButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  testsButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.primary,
  },
});
