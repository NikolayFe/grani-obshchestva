import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { AuthContext } from '../navigation/AuthContext';
import { activityPeriodLabels } from '../data/activityData';
import { ratingPeriodLabels } from '../data/ratingData';
import { getRating, getActivity, RatingData, ActivityData, getOverallProgress, OverallProgress } from '../api/contentApi';

type RatingPeriod = 'week' | 'allTime';
type ActivityPeriod = 'week' | 'month';

const ACCENT_COLORS = ['#FFE6A6', '#E8E0F7', '#F2E5D4', '#EAD8FF', '#DDF6E8', '#E3EEFF', '#FAD9D9', '#D9F0FA'];

const CIRCLE_SIZE = 110;
const CIRCLE_STROKE = 10;
const CIRCLE_HALF = CIRCLE_SIZE / 2;
const CIRCLE_INNER = CIRCLE_SIZE - CIRCLE_STROKE * 2;

function CircularProgress({ percent }: { percent: number }) {
  const p = Math.min(100, Math.max(0, Math.round(percent)));
  const color = colors.primary.main;
  const track = '#E8DDF4';

  // Right half sweeps from 0% (angle=180) to 50% (angle=0)
  const rightAngle = p <= 50 ? (1 - p / 50) * 180 : 0;
  // Left half sweeps from 50% (angle=180) to 100% (angle=0)
  const leftAngle = p > 50 ? (1 - (p - 50) / 50) * 180 : 180;

  return (
    <View
      style={{
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_HALF,
        backgroundColor: track,
        overflow: 'hidden',
      }}
    >
      {/* Right half: covers 0-50% progress */}
      <View
        style={{
          position: 'absolute',
          right: 0,
          width: CIRCLE_HALF,
          height: CIRCLE_SIZE,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: CIRCLE_HALF,
            height: CIRCLE_SIZE,
            borderTopRightRadius: CIRCLE_HALF,
            borderBottomRightRadius: CIRCLE_HALF,
            backgroundColor: color,
            transformOrigin: [0, CIRCLE_HALF, 0] as any,
            transform: [{ rotate: `${rightAngle}deg` }],
          }}
        />
      </View>

      {/* Left half: covers 50-100% progress */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          width: CIRCLE_HALF,
          height: CIRCLE_SIZE,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: CIRCLE_HALF,
            height: CIRCLE_SIZE,
            borderTopLeftRadius: CIRCLE_HALF,
            borderBottomLeftRadius: CIRCLE_HALF,
            backgroundColor: color,
            transformOrigin: [CIRCLE_HALF, CIRCLE_HALF, 0] as any,
            transform: [{ rotate: `${leftAngle}deg` }],
          }}
        />
      </View>

      {/* Inner white ring */}
      <View
        style={{
          position: 'absolute',
          top: CIRCLE_STROKE,
          left: CIRCLE_STROKE,
          width: CIRCLE_INNER,
          height: CIRCLE_INNER,
          borderRadius: CIRCLE_INNER / 2,
          backgroundColor: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: '800', color }}>{p}%</Text>
      </View>
    </View>
  );
}

export default function HomeScreen({ navigation }: any) {
  const { user, lastOpenedCategory } = React.useContext(AuthContext);

  const [ratingPeriod, setRatingPeriod] = React.useState<RatingPeriod>('week');
  const [activityPeriod, setActivityPeriod] = React.useState<ActivityPeriod>('week');

  const [ratingData, setRatingData] = React.useState<RatingData | null>(null);
  const [activityData, setActivityData] = React.useState<ActivityData | null>(null);
  const [overallProgress, setOverallProgress] = React.useState<OverallProgress | null>(null);

  // Загрузка рейтинга при смене периода
  React.useEffect(() => {
    getRating(ratingPeriod, user?.id).then(setRatingData).catch(() => {});
  }, [ratingPeriod, user?.id]);

  // Загрузка активности при смене периода
  React.useEffect(() => {
    if (!user?.id) return;
    getActivity(user.id, activityPeriod).then(setActivityData).catch(() => {});
  }, [activityPeriod, user?.id]);

  // Загрузка общего прогресса по модулям
  React.useEffect(() => {
    if (!user?.id) return;
    getOverallProgress(user.id).then(setOverallProgress).catch(() => {});
  }, [user?.id]);

  const leaderboard = ratingData?.leaderboard ?? [];
  const topPerformer = leaderboard[0] ?? null;
  const standingList = leaderboard.slice(1);
  const currentUser = leaderboard.find((u) => u.isCurrentUser) ?? leaderboard[leaderboard.length - 1] ?? null;

  const courseTitle = lastOpenedCategory?.title ?? overallProgress?.currentCategoryTitle ?? 'Обществознание';
  const courseSubtitle = lastOpenedCategory
    ? `Продолжи обучение в категории «${lastOpenedCategory.title}». Открыто ${lastOpenedCategory.terms} из ${lastOpenedCategory.total} терминов.`
    : overallProgress
      ? overallProgress.modulesLeft > 0
        ? `Осталось ${overallProgress.modulesLeft} из ${overallProgress.categoriesTotal} модулей до завершения курса.`
        : 'Поздравляем! Все модули пройдены.'
      : 'Начни изучать, чтобы увидеть свой прогресс.';;

  const handleContinuePress = () => {
    if (lastOpenedCategory) {
      navigation.navigate('Categories', {
        screen: 'CategoryTopic',
        params: { category: lastOpenedCategory },
      });
      return;
    }

    navigation.navigate('Categories');
  };

  const handleOpenRating = () => {
    navigation.navigate('Rating');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.brandRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={16} color={colors.primary.main} />
            </View>
            <Text style={styles.brandText}>Грани общества</Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{(user?.xpTotal ?? 0).toLocaleString('ru-RU')} XP</Text>
            <Text style={styles.headerDot}>•</Text>
            <Ionicons name="flame" size={12} color={colors.tertiary.main} />
            <Text style={styles.headerBadgeText}>{user?.streakDays ?? 0}</Text>
          </View>
        </View>

        <View style={styles.welcomeBlock}>
          <Text style={styles.welcomeTitle}>Привет, {user?.name ?? 'друг'}!</Text>
          <Text style={styles.wave}>👋</Text>
        </View>
        <Text style={styles.welcomeSubtitle}>Продолжай в том же духе, ты на верном пути</Text>

        <View style={styles.progressCard}>
          <View style={styles.progressCircleWrap}>
            <CircularProgress percent={overallProgress?.overallPercent ?? 0} />
          </View>

          <View style={styles.courseTag}>
            <Ionicons name="bookmarks" size={12} color={colors.primary.main} />
            <Text style={styles.courseTagText}>Текущий курс</Text>
          </View>

          <Text style={styles.courseTitle}>{courseTitle}</Text>
          <Text style={styles.courseSubtitle}>{courseSubtitle}</Text>

          <Pressable style={styles.learningButton} onPress={handleContinuePress}>
            <Text style={styles.learningButtonText}>Продолжить обучение</Text>
            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <View>
              <Text style={styles.activityLabel}>АКТИВНОСТЬ</Text>
              <Text style={styles.activityStat}>
                {activityData?.activeDays ?? 0} из {activityData?.totalDays ?? 7} дней · серия {activityData?.streak ?? 0} 🔥
              </Text>
            </View>
            <View style={styles.activityTabs}>
              <Pressable
                style={[styles.activityTab, activityPeriod === 'week' && styles.activityTabActive]}
                onPress={() => setActivityPeriod('week')}
              >
                <Text style={[styles.activityTabText, activityPeriod === 'week' && styles.activityTabTextActive]}>
                  {activityPeriodLabels.week}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.activityTab, activityPeriod === 'month' && styles.activityTabActive]}
                onPress={() => setActivityPeriod('month')}
              >
                <Text style={[styles.activityTabText, activityPeriod === 'month' && styles.activityTabTextActive]}>
                  {activityPeriodLabels.month}
                </Text>
              </Pressable>
            </View>
          </View>

          {activityData == null ? (
            <ActivityIndicator size="small" color={colors.primary.main} style={{ marginVertical: 12 }} />
          ) : activityData.mode === 'week' ? (
            <View style={styles.activityRow}>
              {activityData.days.map((day) => (
                <View key={day.id} style={styles.dayItem}>
                  <View
                    style={[
                      styles.dayCircle,
                      day.active && styles.dayCircleActive,
                      day.current && styles.dayCircleCurrent,
                    ]}
                  >
                    {day.active ? (
                      <Ionicons
                        name={day.current ? 'flame' : 'checkmark'}
                        size={12}
                        color={day.current ? '#FFFFFF' : colors.primary.main}
                      />
                    ) : (
                      <Text style={styles.dayCircleInactive}>○</Text>
                    )}
                  </View>
                  <Text style={[styles.dayLabel, day.current && styles.dayLabelCurrent]}>{day.label}</Text>
                </View>
              ))}
            </View>
          ) : activityData.mode === 'month' ? (
            <View style={styles.monthGrid}>
              {activityData.weeks.map((week, wi) => (
                <View key={wi} style={styles.monthWeekRow}>
                  <Text style={styles.monthWeekLabel}>{week.weekLabel}</Text>
                  <View style={styles.monthDots}>
                    {week.days.map((active, di) => (
                      <View
                        key={di}
                        style={[styles.monthDot, active && styles.monthDotActive]}
                      />
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.ratingCard}>
          <View style={styles.ratingHeader}>
            <View>
              <View style={styles.ratingTitleRow}>
                <Ionicons name="trophy-outline" size={16} color={colors.tertiary.main} />
                <Text style={styles.ratingTitle}>Рейтинг</Text>
              </View>
              <Text style={styles.ratingSubtitle}>{ratingData?.summary ?? 'Загрузка...'}</Text>
            </View>
            <Pressable style={styles.ratingGhostButton} onPress={handleOpenRating}>
              <Text style={styles.ratingGhostButtonText}>Открыть</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.primary.main} />
            </Pressable>
          </View>

          <View style={styles.ratingTabs}>
            <Pressable
              style={[styles.ratingTab, ratingPeriod === 'week' && styles.ratingTabActive]}
              onPress={() => setRatingPeriod('week')}
            >
              <Text style={[styles.ratingTabText, ratingPeriod === 'week' && styles.ratingTabTextActive]}>
                {ratingPeriodLabels.week}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.ratingTab, ratingPeriod === 'allTime' && styles.ratingTabActive]}
              onPress={() => setRatingPeriod('allTime')}
            >
              <Text style={[styles.ratingTabText, ratingPeriod === 'allTime' && styles.ratingTabTextActive]}>
                {ratingPeriodLabels.allTime}
              </Text>
            </Pressable>
          </View>

          {topPerformer == null ? (
            <ActivityIndicator size="small" color={colors.primary.main} style={{ marginVertical: 12 }} />
          ) : (
            <View style={styles.topLeaderCard}>
              <View style={styles.topLeaderHeader}>
                <View style={styles.topLeaderBadge}>
                  <Ionicons name="sparkles" size={12} color={colors.tertiary.main} />
                  <Text style={styles.topLeaderBadgeText}>
                    {ratingPeriod === 'week' ? 'Лидер недели' : 'Лидер за все время'}
                  </Text>
                </View>
                <Text style={styles.topLeaderPlace}>#{topPerformer.place}</Text>
              </View>
              <View style={styles.topLeaderBody}>
                <View style={[styles.topLeaderAvatar, { backgroundColor: ACCENT_COLORS[0] }]}>
                  <Ionicons name="person" size={28} color={colors.neutral.dark} />
                </View>
                <View style={styles.topLeaderInfo}>
                  <Text style={styles.topLeaderName}>{topPerformer.name}</Text>
                  <Text style={styles.topLeaderXp}>{topPerformer.xp.toLocaleString('ru-RU')} XP</Text>
                  <Text style={styles.topLeaderDelta}>Серия: {topPerformer.streakDays} дн.</Text>
                </View>
                <View style={styles.topLeaderReward}>
                  <Ionicons name="trophy" size={16} color={colors.tertiary.main} />
                </View>
              </View>
            </View>
          )}

          <View style={styles.standingsList}>
            {standingList.map((u, idx) => (
              <View
                key={u.id}
                style={[styles.standingRow, u.isCurrentUser && styles.standingRowCurrent]}
              >
                <View style={styles.standingLeft}>
                  <View style={[styles.standingPlace, u.isCurrentUser && styles.standingPlaceCurrent]}>
                    <Text
                      style={[
                        styles.standingPlaceText,
                        u.isCurrentUser && styles.standingPlaceTextCurrent,
                      ]}
                    >
                      {u.place}
                    </Text>
                  </View>
                  <View style={[styles.standingAvatar, { backgroundColor: ACCENT_COLORS[(idx + 1) % ACCENT_COLORS.length] }]}>
                    <Ionicons name="person" size={18} color={colors.neutral.dark} />
                  </View>
                  <View>
                    <View style={styles.standingNameRow}>
                      <Text style={styles.standingName}>{u.name}</Text>
                      {u.isCurrentUser && <Text style={styles.youBadge}>Вы</Text>}
                    </View>
                    <Text style={styles.standingDelta}>Серия: {u.streakDays} дн.</Text>
                  </View>
                </View>
                <Text style={styles.standingXp}>{u.xp.toLocaleString('ru-RU')} XP</Text>
              </View>
            ))}
          </View>

          {currentUser != null && (
            <View style={styles.currentUserCard}>
              <View style={styles.currentUserHeader}>
                <Text style={styles.currentUserLabel}>Твоя позиция</Text>
              </View>
              <View style={styles.currentUserBody}>
                <View>
                  <Text style={styles.currentUserPlace}>#{currentUser.place}</Text>
                  <Text style={styles.currentUserText}>{currentUser.xp.toLocaleString('ru-RU')} XP</Text>
                </View>
                <Pressable style={styles.currentUserButton} onPress={handleOpenRating}>
                  <Text style={styles.currentUserButtonText}>Поднять рейтинг</Text>
                </Pressable>
              </View>
            </View>
          )}
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
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 28,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0E1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    color: colors.primary.main,
    fontSize: 14,
    fontWeight: '800',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E7DDF0',
    backgroundColor: '#FBF7FF',
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  headerDot: {
    fontSize: 10,
    color: colors.neutral.light,
  },
  welcomeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  welcomeTitle: {
    color: colors.text.primary,
    fontSize: 36,
    fontWeight: '800',
  },
  wave: {
    fontSize: 26,
  },
  welcomeSubtitle: {
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#ECE2F3',
  },
  progressCircleWrap: {
    alignItems: 'center',
    marginBottom: 14,
  },
  progressCircleOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 6,
    borderColor: colors.primary.main,
    borderLeftColor: '#E8DDF4',
    borderBottomColor: '#E8DDF4',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-45deg' }],
  },
  progressCircleInner: {
    transform: [{ rotate: '45deg' }],
  },
  progressCircleText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary.main,
  },
  courseTag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#F3E7FF',
    marginBottom: 8,
  },
  courseTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary.main,
  },
  courseTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 6,
  },
  courseSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.text.secondary,
    marginBottom: 14,
  },
  learningButton: {
    backgroundColor: colors.primary.main,
    borderRadius: 999,
    paddingVertical: 13,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  learningButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECE2F3',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  activityLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.neutral.main,
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  activityStat: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  activityTabs: {
    flexDirection: 'row',
    gap: 6,
  },
  activityTab: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#F0EAF6',
  },
  activityTabActive: {
    backgroundColor: '#EEE5FF',
  },
  activityTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.neutral.dark,
  },
  activityTabTextActive: {
    color: colors.primary.main,
  },
  monthGrid: {
    gap: 8,
  },
  monthWeekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthWeekLabel: {
    fontSize: 10,
    color: colors.text.secondary,
    width: 96,
  },
  monthDots: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
  },
  monthDot: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: '#EDE5F4',
  },
  monthDotActive: {
    backgroundColor: colors.primary.main,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayItem: {
    alignItems: 'center',
    gap: 7,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5DDF0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleActive: {
    backgroundColor: '#F1E7FD',
    borderColor: '#E2D2F8',
  },
  dayCircleCurrent: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  dayCircleInactive: {
    color: '#C3B7CF',
    fontSize: 12,
  },
  dayLabel: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  dayLabelCurrent: {
    color: colors.primary.main,
    fontWeight: '700',
  },
  ratingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECE2F3',
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ratingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  ratingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text.primary,
  },
  ratingSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.text.secondary,
    maxWidth: 230,
  },
  ratingGhostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#F4ECFB',
  },
  ratingGhostButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary.main,
  },
  ratingTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  ratingTab: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#F0EAF6',
  },
  ratingTabActive: {
    backgroundColor: '#EEE5FF',
  },
  ratingTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.neutral.dark,
  },
  ratingTabTextActive: {
    color: colors.primary.main,
  },
  topLeaderCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: '#FBF7FF',
    borderWidth: 1,
    borderColor: '#EBDCF8',
    marginBottom: 14,
  },
  topLeaderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  topLeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FFF4D1',
  },
  topLeaderBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.tertiary.dark,
  },
  topLeaderPlace: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary.main,
  },
  topLeaderBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  topLeaderAvatar: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topLeaderInfo: {
    flex: 1,
  },
  topLeaderName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 4,
  },
  topLeaderXp: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary.main,
    marginBottom: 4,
  },
  topLeaderDelta: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  topLeaderReward: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0C2',
  },
  standingsList: {
    gap: 10,
    marginBottom: 14,
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
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#241431',
  },
  currentUserHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  currentUserLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D8C8E8',
  },
  currentUserTrend: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A7F3B9',
  },
  currentUserBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  currentUserPlace: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  currentUserText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#D8C8E8',
    maxWidth: 180,
  },
  currentUserButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  currentUserButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#241431',
  },
});

