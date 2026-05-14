import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { getTerms } from '../api/contentApi';
import { useGlossary } from '../contexts/GlossaryContext';

const filters = ['Все', 'Экономика', 'Право', 'Конституция', 'Социология'];

type GlossaryCard = {
  id: string;
  term: string;
  definition: string;
  category: string;
  isNew: boolean;
};

const categoryColors: Record<string, string> = {
  'Экономика': colors.secondary.main,
  'Право': colors.primary.main,
  'Гражданское право': colors.primary.main,
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
  const [glossaryCards, setGlossaryCards] = useState<GlossaryCard[]>([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Все');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [errorText, setErrorText] = useState('');
  
  const { knownTermIds, addKnownTerm, clearKnownTerms } = useGlossary();

  useEffect(() => {
    let mounted = true;

    const loadTerms = async () => {
      try {
        setErrorText('');
        
        const response = await getTerms();

        if (!mounted) return;

        const mapped: GlossaryCard[] = response.map((item) => ({
          id: item.id,
          term: item.term,
          definition: item.definition,
          category: item.category.title === 'Гражданское право' ? 'Право' : item.category.title,
          isNew: item.isNew,
        }));

        setGlossaryCards(mapped);
      } catch (error: any) {
        if (!mounted) return;
        setErrorText(error?.message || 'Не удалось загрузить термины');
      }
    };

    loadTerms();

    return () => {
      mounted = false;
    };
  }, []);

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
  }, [glossaryCards, activeFilter, normalizedSearch]);

  const dailyCards = useMemo(() => {
    return filteredCards.filter((item) => !knownTermIds.includes(item.id));
  }, [filteredCards, knownTermIds]);

  useEffect(() => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
  }, [activeFilter, search, glossaryCards]);

  const safeCardIndex =
    dailyCards.length === 0 ? 0 : Math.min(currentCardIndex, dailyCards.length - 1);
  const dailyCard = dailyCards[safeCardIndex] ?? null;

  // Правильный счётчик на основе полного списка filteredCards
  const passedInFilter = filteredCards.filter((card) => knownTermIds.includes(card.id)).length;
  const currentPosition = passedInFilter + safeCardIndex + 1;
  const counterDisplay = dailyCards.length === 0 ? '0/0' : `${currentPosition}/${filteredCards.length}`;

  const newTerms = useMemo(() => {
    return dailyCards.filter((item) => item.isNew);
  }, [dailyCards]);

  const handleKnowCard = () => {
    if (!dailyCard) return;

    const isLastCard = currentCardIndex >= dailyCards.length - 1;

    if (isLastCard) {
      // Если это последняя карточка, начинаем повторение
      clearKnownTerms();
      setCurrentCardIndex(0);
      setIsFlipped(false);
    } else {
      // Обычное перемещение на следующую карточку
      if (dailyCard.id && !knownTermIds.includes(dailyCard.id)) {
        addKnownTerm(dailyCard.id);
      }
      setIsFlipped(false);
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const handleLater = () => {
    // Переходим на следующую карточку без отметки как "Знаю"
    if (currentCardIndex < dailyCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // Если это последняя карточка, переходим на повторение
      clearKnownTerms();
      setCurrentCardIndex(0);
    }
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
        {errorText.length > 0 && <Text style={styles.errorText}>{errorText}</Text>}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Карточка дня</Text>
          <Text style={styles.sectionCounter}>
            {counterDisplay}
          </Text>
        </View>

        {dailyCards.length === 0 || !dailyCard ? (
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
              <Pressable
                style={[styles.actionBtn, styles.actionMuted]}
                onPress={handleLater}
              >
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
              <Pressable style={[styles.actionBtn, styles.actionSuccess]} onPress={handleKnowCard}>
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
  errorText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#B42318',
    marginTop: 8,
  },
});
