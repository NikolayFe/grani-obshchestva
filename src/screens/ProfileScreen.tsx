import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Switch, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { AuthContext } from '../navigation/AuthContext';

const XP_CURRENT = 12450;
const XP_NEXT = 15000;
const LEVEL = 15;
const XP_PROGRESS = XP_CURRENT / XP_NEXT;

const LANGUAGES = ['Русский', 'Казахский', 'Английский'];

const ACHIEVEMENTS = [
  { icon: 'sunny' as const, label: 'Ранняя\nпташка', sub: 'Решено 18 задач', color: '#F59E0B', bg: '#FEF3C7' },
  { icon: 'book' as const, label: 'Мастер\nтерминов', sub: '100 терминов', color: '#A855F7', bg: '#F3E8FF' },
  { icon: 'people' as const, label: 'Общи-\nтельный', sub: '10 друзей', color: '#6B7280', bg: '#F3F4F6' },
];

export default function ProfileScreen() {
  const { signOut } = React.useContext(AuthContext);
  const navigation = useNavigation<any>();
  const [darkMode, setDarkMode] = React.useState(false);
  const [language, setLanguage] = React.useState('Русский');
  const [langModalVisible, setLangModalVisible] = React.useState(false);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Шапка */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <View style={styles.appIconCircle}>
              <Ionicons name="layers" size={16} color={colors.text.light} />
            </View>
            <Text style={styles.appName}>Грани общества</Text>
          </View>
          <View style={styles.topBarRight}>
            <View style={styles.xpBadge}>
              <Ionicons name="star" size={13} color="#A855F7" />
              <Text style={styles.xpBadgeText}>1 240</Text>
            </View>
            <View style={styles.fireBadge}>
              <Text style={styles.fireBadgeText}>🔥 10</Text>
            </View>
          </View>
        </View>

        {/* Карточка профиля */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={36} color={colors.text.light} />
          </View>
          <Text style={styles.username}>Александр</Text>
          <Text style={styles.userRole}>Преданный ученик</Text>

          {/* XP прогресс */}
          <View style={styles.xpRow}>
            <View style={styles.xpBarTrack}>
              <View style={[styles.xpBarFill, { width: `${XP_PROGRESS * 100}%` as any }]} />
            </View>
          </View>
          <Text style={styles.xpLabel}>
            {XP_CURRENT.toLocaleString('ru')} / {XP_NEXT.toLocaleString('ru')} XP до Уровня {LEVEL}
          </Text>

          {/* Статистика */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="list" size={18} color={colors.primary.main} />
              <Text style={styles.statValue}>142</Text>
              <Text style={styles.statLabel}>Термины</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Серия</Text>
            </View>
            <View style={styles.statDivider} />
            <Pressable style={styles.statItem} onPress={() => navigation.navigate('Rating')}>
              <Ionicons name="trophy" size={18} color={colors.tertiary.main} />
              <Text style={styles.statValue}>#5</Text>
              <Text style={styles.statLabel}>Ранг</Text>
            </Pressable>
          </View>
        </View>

        {/* Достижения */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Достижения</Text>
          <Pressable onPress={() => navigation.navigate('Achievements')}>
            <Text style={styles.sectionLink}>Смотреть все</Text>
          </Pressable>
        </View>
        <View style={styles.achievementsRow}>
          {ACHIEVEMENTS.map((a, i) => (
            <View key={i} style={styles.achievementCard}>
              <View style={[styles.achievementIcon, { backgroundColor: a.bg }]}>
                <Ionicons name={a.icon} size={22} color={a.color} />
              </View>
              <Text style={styles.achievementLabel}>{a.label}</Text>
              <Text style={styles.achievementSub}>{a.sub}</Text>
            </View>
          ))}
        </View>

        {/* Настройки */}
        <Text style={[styles.sectionTitle, { marginBottom: 10 }]}>Настройки</Text>
        <View style={styles.settingsCard}>
          {/* Уведомления */}
          <Pressable style={styles.settingsRow}>
            <View style={styles.settingsLeft}>
              <View style={[styles.settingsIconBox, { backgroundColor: '#EDE9FE' }]}>
                <Ionicons name="notifications-outline" size={16} color="#7C3AED" />
              </View>
              <Text style={styles.settingsText}>Уведомления</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.neutral.main} />
          </Pressable>

          {/* Тёмная тема */}
          <View style={styles.settingsRow}>
            <View style={styles.settingsLeft}>
              <View style={[styles.settingsIconBox, { backgroundColor: '#F1F5F9' }]}>
                <Ionicons name="moon-outline" size={16} color="#475569" />
              </View>
              <Text style={styles.settingsText}>Тёмная тема</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#E2D8F0', true: colors.primary.main }}
              thumbColor="#FFFFFF"
              style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
            />
          </View>

          {/* Язык */}
          <Pressable style={styles.settingsRow} onPress={() => setLangModalVisible(true)}>
            <View style={styles.settingsLeft}>
              <View style={[styles.settingsIconBox, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="globe-outline" size={16} color="#059669" />
              </View>
              <Text style={styles.settingsText}>Язык</Text>
            </View>
            <View style={styles.settingsRight}>
              <Text style={styles.settingsHint}>{language}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.neutral.main} />
            </View>
          </Pressable>

          {/* Выход */}
          <Pressable style={[styles.settingsRow, styles.settingsRowLast]} onPress={signOut}>
            <View style={styles.settingsLeft}>
              <View style={[styles.settingsIconBox, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="log-out-outline" size={16} color={colors.error} />
              </View>
              <Text style={[styles.settingsText, { color: colors.error }]}>Выход</Text>
            </View>
          </Pressable>
        </View>

        {/* Модальное окно выбора языка */}
        <Modal
          visible={langModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setLangModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setLangModalVisible(false)}
          >
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>Выберите язык</Text>
              {LANGUAGES.map((lang) => (
                <Pressable
                  key={lang}
                  style={[styles.langOption, lang === language && styles.langOptionActive]}
                  onPress={() => { setLanguage(lang); setLangModalVisible(false); }}
                >
                  <Text style={[styles.langOptionText, lang === language && styles.langOptionTextActive]}>
                    {lang}
                  </Text>
                  {lang === language && (
                    <Ionicons name="checkmark" size={18} color={colors.primary.main} />
                  )}
                </Pressable>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 30,
  },

  /* Шапка */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: 0.2,
  },
  topBarRight: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  xpBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary.main,
  },
  fireBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fireBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.primary,
  },

  /* Карточка профиля */
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#EDE9FE',
  },
  username: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 16,
    fontWeight: '500',
  },

  /* XP прогресс */
  xpRow: {
    width: '100%',
    marginBottom: 6,
  },
  xpBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F3E8FF',
    overflow: 'hidden',
  },
  xpBarFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.main,
  },
  xpLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    marginBottom: 20,
    fontWeight: '500',
  },

  /* Статы */
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#F3EDF7',
    paddingTop: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statIcon: {
    fontSize: 18,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#F0EAF5',
    marginVertical: 4,
  },

  /* Достижения */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text.primary,
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary.main,
  },
  achievementsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  achievementCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  achievementLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 15,
  },
  achievementSub: {
    fontSize: 10,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  /* Настройки */
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F4FB',
  },
  settingsRowLast: {
    borderBottomWidth: 0,
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsIconBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  settingsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  settingsHint: {
    fontSize: 13,
    color: colors.text.secondary,
  },

  /* Модалка языка */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 36,
    paddingHorizontal: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 14,
    textAlign: 'center',
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: '#F8F4FB',
  },
  langOptionActive: {
    backgroundColor: '#EDE9FE',
  },
  langOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  langOptionTextActive: {
    color: colors.primary.main,
  },
});

