import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const glossaryTerms = [
  { id: 1, term: 'Конституция', definition: 'Основной закон государства, определяющий его устройство, права и свободы граждан.', category: 'Конституция' },
  { id: 2, term: 'Правоспособность', definition: 'Способность иметь гражданские права и нести обязанности.', category: 'Гражданское право' },
  { id: 3, term: 'Дееспособность', definition: 'Способность гражданина своими действиями приобретать и осуществлять права.', category: 'Гражданское право' },
  { id: 4, term: 'ВВП', definition: 'Валовой внутренний продукт — совокупная стоимость всех товаров и услуг, произведённых в стране за год.', category: 'Экономика' },
  { id: 5, term: 'Инфляция', definition: 'Рост общего уровня цен на товары и услуги в экономике.', category: 'Экономика' },
  { id: 6, term: 'Дефляция', definition: 'Снижение общего уровня цен на товары и услуги.', category: 'Экономика' },
  { id: 7, term: 'Суверенитет', definition: 'Верховная власть государства на своей территории и независимость во внешних делах.', category: 'Конституция' },
  { id: 8, term: 'Диверсификация', definition: 'Распределение инвестиций между различными активами для снижения рисков.', category: 'Финансовая грамотность' },
  { id: 9, term: 'Бюджет', definition: 'Финансовый план доходов и расходов на определённый период.', category: 'Финансовая грамотность' },
  { id: 10, term: 'Федерация', definition: 'Форма государственного устройства, при которой части государства обладают определённой самостоятельностью.', category: 'Конституция' },
];

const categoryColors: Record<string, string> = {
  'Конституция': '#5B5BD6',
  'Гражданское право': colors.primary.main,
  'Экономика': colors.secondary.main,
  'Финансовая грамотность': colors.tertiary.main,
};

export default function GlossaryScreen() {
  const [search, setSearch] = useState('');

  const filtered = glossaryTerms.filter(
    (t) =>
      t.term.toLowerCase().includes(search.toLowerCase()) ||
      t.definition.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Глоссарий</Text>
        <Text style={styles.pageSubtitle}>
          Все ключевые термины в одном месте.
        </Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={colors.neutral.main} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск термина..."
            placeholderTextColor={colors.neutral.light}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={colors.neutral.main} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {filtered.length === 0 && (
          <Text style={styles.emptyText}>Ничего не найдено</Text>
        )}
        {filtered.map((item) => {
          const catColor = categoryColors[item.category] ?? colors.neutral.main;
          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.term}>{item.term}</Text>
                <View style={[styles.catBadge, { backgroundColor: catColor + '1A' }]}>
                  <Text style={[styles.catText, { color: catColor }]}>{item.category}</Text>
                </View>
              </View>
              <Text style={styles.definition}>{item.definition}</Text>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.text.secondary,
    fontSize: 14,
    marginTop: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  term: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  catBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  catText: {
    fontSize: 11,
    fontWeight: '600',
  },
  definition: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 19,
  },
});
