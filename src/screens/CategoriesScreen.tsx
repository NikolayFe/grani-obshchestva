import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const categories = [
  {
    id: 1,
    title: 'Гражданское право',
    description: 'Основы норм правовой системы и гражданских прав.',
    icon: 'scale' as const,
    color: colors.primary.main,
    bg: '#F5EAFF',
    terms: 14,
    total: 50,
  },
  {
    id: 2,
    title: 'Экономика',
    description: 'Основы микро и макроэкономики, рыночные механизмы.',
    icon: 'trending-up' as const,
    color: colors.secondary.main,
    bg: '#E8FAF0',
    terms: 8,
    total: 50,
  },
  {
    id: 3,
    title: 'Конституция',
    description: 'Главный акт государства, права и свободы.',
    icon: 'document-text' as const,
    color: '#5B5BD6',
    bg: '#EBEBFF',
    terms: 40,
    total: 50,
  },
  {
    id: 4,
    title: 'Социология',
    description: 'Социальные группы, статусы, роли и общественные процессы.',
    icon: 'people' as const,
    color: colors.tertiary.main,
    bg: '#FFF8E0',
    terms: 0,
    total: 50,
  },
];

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

        <View style={styles.list}>
          {categories.map((cat) => {
            const progress = cat.terms / cat.total;
            return (
              <Pressable
                key={cat.id}
                style={[styles.card, { borderLeftColor: cat.color }]}
                onPress={() => navigation.navigate('CategoryTopic', { category: cat })}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.iconCircle, { backgroundColor: cat.bg }]}>
                    <Ionicons name={cat.icon} size={26} color={cat.color} />
                  </View>
                  <View style={styles.cardMeta}>
                    <Text style={[styles.cardTerms, { color: cat.color }]}>
                      {cat.terms}/{cat.total} терминов
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={cat.color} />
                  </View>
                </View>

                <Text style={styles.cardTitle}>{cat.title}</Text>
                <Text style={styles.cardDesc}>{cat.description}</Text>

                <ProgressBar progress={progress} color={cat.color} bg={cat.bg} />
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
    marginBottom: 20,
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
