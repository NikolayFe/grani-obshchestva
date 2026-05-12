import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { AuthContext } from '../navigation/AuthContext';

export default function ProfileScreen() {
  const { signOut } = React.useContext(AuthContext);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={34} color={colors.text.light} />
          </View>
          <Text style={styles.username}>Иван Петров</Text>
          <Text style={styles.email}>ivan@example.com</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>42</Text>
            <Text style={styles.statLabel}>Сессий</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>87%</Text>
            <Text style={styles.statLabel}>Правильно</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>15</Text>
            <Text style={styles.statLabel}>Дней подряд</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Достижения</Text>
        <View style={styles.achievementContainer}>
          <View style={styles.achievement}>
            <Ionicons name="trophy" size={26} color={colors.tertiary.main} />
            <Text style={styles.achievementText}>Мастер право</Text>
          </View>
          <View style={styles.achievement}>
            <Ionicons name="flame" size={26} color={colors.error} />
            <Text style={styles.achievementText}>15 дней подряд</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Настройки</Text>
        <View style={styles.settingsCard}>
          <Pressable style={styles.settingsRow}>
            <Text style={styles.settingsText}>Уведомления</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.neutral.main} />
          </Pressable>
          <Pressable style={styles.settingsRow}>
            <Text style={styles.settingsText}>Темы и категории</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.neutral.main} />
          </Pressable>
          <Pressable style={styles.settingsRow}>
            <Text style={styles.settingsText}>О приложении</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.neutral.main} />
          </Pressable>
        </View>

        <Pressable style={styles.logoutButton} onPress={signOut}>
          <Text style={styles.logoutButtonText}>Выход</Text>
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
  container: {
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  avatarCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: colors.primary.main,
  },
  username: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary.main,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
  },
  achievementContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  achievement: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  achievementText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },
  settingsCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3EDF7',
  },
  settingsText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.error,
  },
});

