import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const filters = ['Все', 'Экономика', 'Право', 'Конституция', 'Социология'];

const glossaryCards = [
  {
    id: 1,
    term: 'Инфляция',
    definition: 'Устойчивый рост общего уровня цен, снижающий покупательную способность денег.',
    category: 'Экономика',
    isNew: true,
  },
  {
    id: 2,
    term: 'ВВП',
    definition: 'Совокупная стоимость всех конечных товаров и услуг, произведенных в стране за год.',
    category: 'Экономика',
    isNew: false,
  },
  {
    id: 3,
    term: 'Правоспособность',
    definition: 'Способность лица иметь гражданские права и нести обязанности.',
    category: 'Право',
    isNew: true,
  },
  {
    id: 4,
    term: 'Договор',
    definition: 'Соглашение двух или более лиц об установлении, изменении или прекращении прав и обязанностей.',
    category: 'Право',
    isNew: false,
  },
  {
    id: 5,
    term: 'Суверенитет',
    definition: 'Верховная власть государства на своей территории и независимость во внешних отношениях.',
    category: 'Конституция',
    isNew: true,
  },
  {
    id: 6,
    term: 'Федерация',
    definition: 'Форма государственного устройства, при которой части страны имеют определенную самостоятельность.',
    category: 'Конституция',
    isNew: false,
  },
  {
    id: 7,
    term: 'Стратификация',
    definition: 'Разделение общества на социальные группы по доходу, образованию, престижу и власти.',
    category: 'Социология',
    isNew: true,
  },
  {
    id: 8,
    term: 'Социализация',
    definition: 'Процесс усвоения человеком социальных норм, ценностей и моделей поведения.',
    category: 'Социология',
    isNew: false,
  },
];

const categoryColors: Record<string, string> = {
  'Экономика': colors.secondary.main,
  'Право': colors.primary.main,
  'Конституция': '#5B5BD6',
  'Социология': colors.tertiary.main,
};

function normalizeIncomingFilter(value: string) {
  if (value === 'Гражданское право') return 'Право';
  if (value === 'Финансовая грамотность') return 'Социология';
  if (filters.includes(value)) return value;
  return 'Все';
}

export default function GlossaryScreen({ route }: any) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Все');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const initialFilter = route?.params?.initialFilter;
    if (typeof initialFilter === 'string') {
      setActiveFilter(normalizeIncomingFilter(initialFilter));
    }
  }, [route?.params?.initialFilter]);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredCards = useMemo(() => {
    return glossaryCards.filter((item) => {
      const byCategory = activeFilter === 'Все' || item.category === activeFilter;
      const bySearch =
        normalizedSearch.length === 0 ||
        item.term.toLowerCase().includes(normalizedSearch) ||
        item.definition.toLowerCase().includes(normalizedSearch);
      return byCategory && bySearch;
    });
  }, [activeFilter, normalizedSearch]);

  useEffect(() => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
  }, [activeFilter, search]);

  const safeCardIndex =
    filteredCards.length === 0 ? 0 : Math.min(currentCardIndex, filteredCards.length - 1);
  const dailyCard = filteredCards[safeCardIndex] ?? null;

  const newTerms = useMemo(() => {
    return filteredCards.filter((item) => item.isNew);
  }, [filteredCards]);

  const handleNextCard = () => {
    if (filteredCards.length === 0) return;
    setCurrentCardIndex((prev) => (prev + 1) % filteredCards.length);
    setIsFlipped(false);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={colors.neutral.main} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск терминов..."
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
        <Pressable style={styles.filterButton}>
          <Ionicons name="options" size={18} color={colors.neutral.dark} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersWrap}
      >
        {filters.map((filter) => {
          const active = filter === activeFilter;
          return (
            <Pressable
              key={filter}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{filter}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.list}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Карточка дня</Text>
          <Text style={styles.sectionCounter}>
            {filteredCards.length === 0 ? '0/0' : `${safeCardIndex + 1}/${filteredCards.length}`}
          </Text>
        </View>

        {filteredCards.length === 0 || !dailyCard ? (
          <Text style={styles.emptyText}>По вашему запросу ничего не найдено.</Text>
        ) : (
          <>
            <Pressable style={styles.dailyCard} onPress={() => setIsFlipped((prev) => !prev)}>
              {!isFlipped ? (
                <>
                  <Text style={[styles.dailyCategory, { color: categoryColors[dailyCard.category] }]}> 
                    {dailyCard.category}
                  </Text>
                  <Text style={styles.dailyWord}>{dailyCard.term}</Text>
                  <Text style={styles.dailyHint}>Нажмите, чтобы перевернуть</Text>
                </>
              ) : (
                <>
                  <Text style={styles.dailyCategory}>ОПРЕДЕЛЕНИЕ</Text>
                  <Text style={styles.dailyDefinition}>{dailyCard.definition}</Text>
                  <Text style={styles.dailyHint}>Нажмите, чтобы вернуться</Text>
                </>
              )}
            </Pressable>

            <View style={styles.actionsRow}>
              <Pressable style={[styles.actionBtn, styles.actionMuted]} onPress={handleNextCard}>
                <View style={styles.actionIconWrapMuted}>
                  <Ionicons name="time-outline" size={14} color={colors.neutral.dark} />
                </View>
                <Text style={styles.actionMutedText}>Позже</Text>
              </Pressable>
              <Pressable style={[styles.actionBtn, styles.actionPrimary]} onPress={() => setIsFlipped(true)}>
                <View style={styles.actionIconWrapPrimary}>
                  <Ionicons name="refresh" size={14} color="#FFFFFF" />
                </View>
                <Text style={styles.actionPrimaryText}>Повторить</Text>
              </Pressable>
              <Pressable style={[styles.actionBtn, styles.actionSuccess]} onPress={handleNextCard}>
                <View style={styles.actionIconWrapSuccess}>
                  <Ionicons name="checkmark" size={14} color="#0D8F45" />
                </View>
                <Text style={styles.actionSuccessText}>Знаю</Text>
              </Pressable>
            </View>
          </>
        )}

        <Text style={styles.newTermsTitle}>Новые термины</Text>

        {newTerms.length === 0 && (
          <Text style={styles.emptyText}>Новых терминов по выбранному фильтру пока нет.</Text>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.newTermsRow}>
          {newTerms.map((item) => {
          const categoryColor = categoryColors[item.category] ?? colors.neutral.main;
          return (
            <View key={`new-${item.id}`} style={styles.newCard}>
              <View style={[styles.newIconWrap, { backgroundColor: categoryColor + '1F' }]}>
                <Ionicons name="sparkles" size={14} color={categoryColor} />
              </View>
              <View style={styles.newCardBody}>
                <Text style={styles.newTerm}>{item.term}</Text>
                <Text style={styles.newDefinition}>{item.definition}</Text>
              </View>
            </View>
          );
          })}
        </ScrollView>

        <Text style={styles.glossaryTitle}>Глоссарий</Text>

        {filteredCards.map((item) => {
          const categoryColor = categoryColors[item.category] ?? colors.neutral.main;
          return (
            <View key={`glossary-${item.id}`} style={styles.glossaryCard}>
              <View style={styles.glossaryTop}>
                <Text style={styles.glossaryTerm}>{item.term}</Text>
                <View style={[styles.glossaryBadge, { backgroundColor: categoryColor + '1A' }]}>
                  <Text style={[styles.glossaryBadgeText, { color: categoryColor }]}>{item.category}</Text>
                </View>
              </View>
              <Text style={styles.glossaryDefinition}>{item.definition}</Text>
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
    backgroundColor: '#F7F3FA',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8DFF0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
  },
  filterButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8DFF0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersScroll: {
    flexGrow: 0,
  },
  filtersWrap: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 10,
    paddingTop: 2,
  },
  filterChip: {
    paddingHorizontal: 12,
    minHeight: 32,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#ECE7F2',
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: colors.primary.main,
  },
  filterChipText: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '600',
    color: colors.neutral.dark,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  list: {
    paddingHorizontal: 14,
    paddingBottom: 24,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text.primary,
  },
  sectionCounter: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary.main,
  },
  dailyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 18,
    minHeight: 180,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ECE2F3',
  },
  dailyCategory: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dailyWord: {
    textAlign: 'center',
    fontSize: 44,
    lineHeight: 46,
    fontWeight: '800',
    color: colors.text.primary,
  },
  dailyDefinition: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    color: colors.text.primary,
    paddingHorizontal: 8,
  },
  dailyHint: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.text.secondary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
    marginBottom: 2,
  },
  actionBtn: {
    flex: 1,
    minHeight: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    borderWidth: 1,
  },
  actionMuted: {
    backgroundColor: '#ECE7F2',
    borderColor: '#DFD7E8',
  },
  actionPrimary: {
    backgroundColor: colors.primary.main,
    borderColor: '#8E46D4',
    shadowColor: colors.primary.main,
    shadowOpacity: 0.24,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  actionSuccess: {
    backgroundColor: '#67EA88',
    borderColor: '#42CE67',
  },
  actionIconWrapMuted: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3DCEA',
  },
  actionIconWrapPrimary: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  actionIconWrapSuccess: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  actionMutedText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.neutral.dark,
  },
  actionPrimaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionSuccessText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D8F45',
  },
  newTermsTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text.primary,
    marginTop: 4,
    marginBottom: 2,
  },
  newTermsRow: {
    gap: 10,
    paddingBottom: 4,
  },
  newCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECE2F3',
    width: 170,
    minHeight: 148,
  },
  newIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newCardBody: {
    flex: 1,
  },
  newTerm: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 2,
  },
  newDefinition: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.text.secondary,
  },
  glossaryTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text.primary,
    marginTop: 4,
    marginBottom: 2,
  },
  glossaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECE2F3',
  },
  glossaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  glossaryTerm: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
  },
  glossaryBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  glossaryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  glossaryDefinition: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.text.secondary,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 18,
  },
});
