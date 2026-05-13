import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { ratingData, ratingPeriodLabels, RatingPeriod } from '../data/ratingData';

export default function RatingScreen() {
  const [ratingPeriod, setRatingPeriod] = React.useState<RatingPeriod>('week');
  const currentRating = ratingData[ratingPeriod];
  const topThree = currentRating.leaderboard.slice(0, 3);
  const currentUser = currentRating.leaderboard.find((user) => user.isCurrentUser) ?? currentRating.leaderboard[3];

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Ionicons name="trophy" size={14} color={colors.tertiary.main} />
            <Text style={styles.heroBadgeText}>Турнирная таблица</Text>
          </View>
          <Text style={styles.heroTitle}>Рейтинг учеников</Text>
          <Text style={styles.heroSubtitle}>
            {currentRating.summary}
          </Text>
        </View>

        <View style={styles.filtersRow}>
          <Pressable
            style={[styles.filterChip, ratingPeriod === 'week' && styles.filterChipActive]}
            onPress={() => setRatingPeriod('week')}
          >
            <Text style={[styles.filterChipText, ratingPeriod === 'week' && styles.filterChipTextActive]}>
              {ratingPeriodLabels.week}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.filterChip, ratingPeriod === 'allTime' && styles.filterChipActive]}
            onPress={() => setRatingPeriod('allTime')}
          >
            <Text style={[styles.filterChipText, ratingPeriod === 'allTime' && styles.filterChipTextActive]}>
              {ratingPeriodLabels.allTime}
            </Text>
          </Pressable>
        </View>

        <View style={styles.podiumCard}>
          <Text style={styles.sectionTitle}>Топ-3</Text>
          <View style={styles.podiumRow}>
            {topThree.map((user, index) => (
              <View key={user.id} style={[styles.podiumItem, index === 0 && styles.podiumItemMain]}>
                <View style={[styles.podiumAvatar, { backgroundColor: user.accent }]}>
                  <Ionicons name="person" size={index === 0 ? 26 : 22} color={colors.neutral.dark} />
                </View>
                <Text style={styles.podiumPlace}>#{user.place}</Text>
                <Text style={styles.podiumName}>{user.name}</Text>
                <Text style={styles.podiumXp}>{user.xp.toLocaleString('ru-RU')} XP</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.listCard}>
          <Text style={styles.sectionTitle}>Полная таблица</Text>
          <View style={styles.standingsList}>
            {currentRating.leaderboard.map((user) => (
              <View
                key={user.id}
                style={[styles.standingRow, user.isCurrentUser && styles.standingRowCurrent]}
              >
                <View style={styles.standingLeft}>
                  <View style={[styles.standingPlace, user.isCurrentUser && styles.standingPlaceCurrent]}>
                    <Text
                      style={[
                        styles.standingPlaceText,
                        user.isCurrentUser && styles.standingPlaceTextCurrent,
                      ]}
                    >
                      {user.place}
                    </Text>
                  </View>
                  <View style={[styles.standingAvatar, { backgroundColor: user.accent }]}>
                    <Ionicons name="person" size={18} color={colors.neutral.dark} />
                  </View>
                  <View>
                    <View style={styles.standingNameRow}>
                      <Text style={styles.standingName}>{user.name}</Text>
                      {user.isCurrentUser && <Text style={styles.youBadge}>Вы</Text>}
                    </View>
                    <Text style={styles.standingDelta}>{user.delta}</Text>
                  </View>
                </View>
                <Text style={styles.standingXp}>{user.xp.toLocaleString('ru-RU')} XP</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.currentUserCard}>
          <View>
            <Text style={styles.currentUserLabel}>Твоя позиция</Text>
            <Text style={styles.currentUserPlace}>#{currentUser.place}</Text>
            <Text style={styles.currentUserText}>{currentRating.currentHint}. Продолжай ежедневные тренировки.</Text>
          </View>
          <View style={styles.currentUserBadge}>
            <Text style={styles.currentUserBadgeText}>{currentRating.currentBadge}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F4FB',
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 30,
    gap: 14,
  },
  heroCard: {
    backgroundColor: '#241431',
    borderRadius: 24,
    padding: 18,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FFF1CA',
    marginBottom: 12,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.tertiary.dark,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#D8C8E8',
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F0EAF6',
  },
  filterChipActive: {
    backgroundColor: '#EEE5FF',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.neutral.dark,
  },
  filterChipTextActive: {
    color: colors.primary.main,
  },
  podiumCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECE2F3',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 14,
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  podiumItem: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: '#FAF7FD',
  },
  podiumItemMain: {
    backgroundColor: '#F5EDFF',
    paddingVertical: 18,
  },
  podiumAvatar: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  podiumPlace: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary.main,
    marginBottom: 4,
  },
  podiumName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 3,
    textAlign: 'center',
  },
  podiumXp: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECE2F3',
  },
  standingsList: {
    gap: 10,
  },
  standingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: '#FAF7FD',
    borderWidth: 1,
    borderColor: '#EEE5F5',
  },
  standingRowCurrent: {
    backgroundColor: '#F3E8FF',
    borderColor: '#DFC9F6',
  },
  standingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  standingPlace: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFE8F6',
  },
  standingPlaceCurrent: {
    backgroundColor: colors.primary.main,
  },
  standingPlaceText: {
    fontSize: 12,
    color: colors.text.primary,
    fontWeight: '800',
  },
  standingPlaceTextCurrent: {
    color: '#FFFFFF',
  },
  standingAvatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  standingNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  standingName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  youBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary.main,
    backgroundColor: '#EFE2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  standingDelta: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  standingXp: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary.main,
  },
  currentUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: '#241431',
    borderRadius: 22,
    padding: 16,
  },
  currentUserLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D8C8E8',
    marginBottom: 6,
  },
  currentUserPlace: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  currentUserText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#D8C8E8',
    maxWidth: 220,
  },
  currentUserBadge: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  currentUserBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#241431',
  },
});