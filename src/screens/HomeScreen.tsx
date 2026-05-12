import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const categories = [
  { id: 1, title: 'Гражданское право', questions: 12, color: colors.primary.main },
  { id: 2, title: 'Экономика', questions: 10, color: colors.secondary.main },
  { id: 3, title: 'Политика', questions: 8, color: '#5B5BD6' },
  { id: 4, title: 'Социология', questions: 14, color: colors.tertiary.main },
];

export default function HomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>Ударный режим</Text>
          <Text style={styles.heroTitle}>Грани общества</Text>
          <Text style={styles.heroSubtitle}>
            Короткие игровые сессии для закрепления материала каждый день.
          </Text>
          <View style={styles.heroMetaRow}>
            <View style={styles.heroMetaPill}>
              <Ionicons name="flame" size={14} color={colors.tertiary.main} />
              <Text style={styles.heroMetaText}>15 дней подряд</Text>
            </View>
            <View style={styles.heroMetaPill}>
              <Ionicons name="star" size={14} color={colors.secondary.main} />
              <Text style={styles.heroMetaText}>820 XP</Text>
            </View>
          </View>
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Ваш прогресс</Text>
          <Text style={styles.progressValue}>42%</Text>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Темы на сегодня</Text>
        {categories.map((category) => (
          <Pressable 
            key={category.id}
            style={[styles.categoryCard, { borderLeftColor: category.color }]}
            onPress={() => navigation.navigate('Test')}
          >
            <Text style={styles.categoryTitle}>{category.title}</Text>
            <Text style={styles.categoryMeta}>Теория + {category.questions} вопросов</Text>
          </Pressable>
        ))}

        <Pressable style={styles.mainButton} onPress={() => navigation.navigate('Test')}>
          <Text style={styles.mainButtonText}>Начать тренировку</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 28,
    gap: 14,
  },
  hero: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroLabel: {
    color: colors.primary.main,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroTitle: {
    color: colors.text.primary,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
  },
  heroSubtitle: {
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  heroMetaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  heroMetaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroMetaText: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressTitle: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  progressValue: {
    color: colors.text.primary,
    fontSize: 34,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 10,
  },
  progressTrack: {
    width: '100%',
    height: 9,
    borderRadius: 999,
    backgroundColor: '#F0E4FA',
  },
  progressFill: {
    width: '42%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.primary.main,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryMeta: {
    color: colors.text.secondary,
    fontSize: 13,
  },
  mainButton: {
    marginTop: 6,
    backgroundColor: colors.primary.main,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  mainButtonText: {
    color: colors.text.light,
    fontSize: 16,
    fontWeight: '800',
  },
});

