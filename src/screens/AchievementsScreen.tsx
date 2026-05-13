import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';

type Achievement = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sub: string;
  color: string;
  bg: string;
  unlocked: boolean;
};

const ALL_ACHIEVEMENTS: Achievement[] = [
  { icon: 'sunny', label: 'Ранняя пташка', sub: 'Реши 18 задач до полудня', color: '#F59E0B', bg: '#FEF3C7', unlocked: true },
  { icon: 'book', label: 'Мастер терминов', sub: 'Выучи 100 терминов', color: '#A855F7', bg: '#F3E8FF', unlocked: true },
  { icon: 'people', label: 'Общительный', sub: 'Добавь 10 друзей', color: '#6B7280', bg: '#F3F4F6', unlocked: true },
  { icon: 'flame', label: 'Огненная серия', sub: 'Занимайся 30 дней подряд', color: '#EF4444', bg: '#FEE2E2', unlocked: false },
  { icon: 'trophy', label: 'Чемпион', sub: 'Займи 1 место в рейтинге', color: '#AA7600', bg: '#FEF9C3', unlocked: false },
  { icon: 'rocket', label: 'Старт!', sub: 'Пройди первый тест', color: '#3B82F6', bg: '#DBEAFE', unlocked: true },
  { icon: 'star', label: 'Звёздный', sub: 'Набери 5000 XP', color: '#8B5CF6', bg: '#EDE9FE', unlocked: false },
  { icon: 'checkmark-circle', label: 'Перфекционист', sub: 'Ответь правильно 50 раз подряд', color: '#10B981', bg: '#D1FAE5', unlocked: false },
  { icon: 'time', label: 'Ночная сова', sub: 'Занимайся после 22:00', color: '#64748B', bg: '#F1F5F9', unlocked: true },
];

export default function AchievementsScreen() {
  const navigation = useNavigation();

  const unlocked = ALL_ACHIEVEMENTS.filter(a => a.unlocked);
  const locked = ALL_ACHIEVEMENTS.filter(a => !a.unlocked);

  return (
    <SafeAreaView style={styles.screen}>
      {/* Заголовок */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Достижения</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Прогресс */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>
            {unlocked.length} / {ALL_ACHIEVEMENTS.length}
          </Text>
          <Text style={styles.progressSub}>достижений открыто</Text>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${(unlocked.length / ALL_ACHIEVEMENTS.length) * 100}%` as any }]} />
          </View>
        </View>

        {/* Открытые */}
        <Text style={styles.sectionTitle}>Открытые</Text>
        <View style={styles.grid}>
          {unlocked.map((a, i) => (
            <View key={i} style={styles.card}>
              <View style={[styles.iconBox, { backgroundColor: a.bg }]}>
                <Ionicons name={a.icon} size={28} color={a.color} />
              </View>
              <Text style={styles.cardLabel}>{a.label}</Text>
              <Text style={styles.cardSub}>{a.sub}</Text>
            </View>
          ))}
        </View>

        {/* Заблокированные */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Ещё впереди</Text>
        <View style={styles.grid}>
          {locked.map((a, i) => (
            <View key={i} style={[styles.card, styles.cardLocked]}>
              <View style={[styles.iconBox, { backgroundColor: '#F3F4F6' }]}>
                <Ionicons name="lock-closed" size={24} color="#9CA3AF" />
              </View>
              <Text style={[styles.cardLabel, { color: colors.text.secondary }]}>{a.label}</Text>
              <Text style={styles.cardSub}>{a.sub}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
  },
  container: {
    padding: 16,
    paddingBottom: 30,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.primary.main,
  },
  progressSub: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 14,
    fontWeight: '500',
  },
  progressBarTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F3E8FF',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.main,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  cardLocked: {
    opacity: 0.65,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
  },
  cardSub: {
    fontSize: 11,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 15,
  },
});
