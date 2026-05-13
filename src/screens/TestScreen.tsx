import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type Question = {
  id: number;
  question: string;
  options: string[];
  correct: number;
};

const questionsByCategory: Record<string, Question[]> = {
  'Гражданское право': [
    {
      id: 1,
      question: 'Что такое правоспособность?',
      options: [
        'Способность иметь права и нести обязанности',
        'Способность своими действиями приобретать права',
        'Дееспособность граждан с 18 лет',
        'Документ, подтверждающий права человека',
      ],
      correct: 0,
    },
    {
      id: 2,
      question: 'В каком возрасте наступает полная дееспособность?',
      options: ['В 14 лет', 'В 16 лет', 'В 18 лет', 'В 21 год'],
      correct: 2,
    },
    {
      id: 3,
      question: 'Что является предметом гражданского права?',
      options: [
        'Имущественные и личные неимущественные отношения',
        'Отношения между государством и гражданами',
        'Уголовные правонарушения',
        'Административные споры',
      ],
      correct: 0,
    },
    {
      id: 4,
      question: 'Что такое сделка в гражданском праве?',
      options: [
        'Любое действие гражданина',
        'Действия, направленные на установление, изменение или прекращение прав',
        'Только письменный договор',
        'Решение суда',
      ],
      correct: 1,
    },
  ],
  'Экономика': [
    {
      id: 1,
      question: 'Что изучает микроэкономика?',
      options: [
        'Поведение отдельных экономических агентов',
        'Экономику страны в целом',
        'Международную торговлю',
        'Денежно-кредитную политику',
      ],
      correct: 0,
    },
    {
      id: 2,
      question: 'Что такое ВВП?',
      options: [
        'Валютный валовой продукт',
        'Внутренний валовой продукт — стоимость всех товаров и услуг страны за год',
        'Внешний валовой показатель',
        'Величина валютного потока',
      ],
      correct: 1,
    },
    {
      id: 3,
      question: 'Закон спроса гласит, что при росте цены спрос...',
      options: ['Растёт', 'Падает', 'Не изменяется', 'Удваивается'],
      correct: 1,
    },
    {
      id: 4,
      question: 'Что такое инфляция?',
      options: [
        'Рост производства',
        'Снижение цен на товары',
        'Устойчивый рост общего уровня цен',
        'Увеличение ВВП',
      ],
      correct: 2,
    },
  ],
  'Конституция': [
    {
      id: 1,
      question: 'В каком году принята Конституция Российской Федерации?',
      options: ['1991', '1993', '1995', '2000'],
      correct: 1,
    },
    {
      id: 2,
      question: 'Высшей ценностью по Конституции РФ является...',
      options: ['Государство', 'Армия', 'Человек, его права и свободы', 'Экономика'],
      correct: 2,
    },
    {
      id: 3,
      question: 'Какова форма правления в России по Конституции?',
      options: ['Монархия', 'Демократическая федеративная республика', 'Унитарное государство', 'Конфедерация'],
      correct: 1,
    },
    {
      id: 4,
      question: 'Сколько глав содержит Конституция РФ?',
      options: ['7', '9', '12', '15'],
      correct: 1,
    },
  ],
  'Социология': [
    {
      id: 1,
      question: 'Что изучает социология?',
      options: [
        'Психику человека',
        'Общество, социальные группы и отношения',
        'Государственное управление',
        'Историю цивилизаций',
      ],
      correct: 1,
    },
    {
      id: 2,
      question: 'Что такое социализация?',
      options: [
        'Процесс усвоения индивидом норм и ценностей общества',
        'Выдача социальных пособий',
        'Общение в интернете',
        'Политическое участие',
      ],
      correct: 0,
    },
    {
      id: 3,
      question: 'Малая социальная группа — это...',
      options: [
        'Население страны',
        'Профессиональный союз',
        'Небольшое объединение людей со стабильными связями',
        'Политическая партия',
      ],
      correct: 2,
    },
    {
      id: 4,
      question: 'Что такое социальный статус?',
      options: [
        'Зарплата человека',
        'Положение человека в обществе',
        'Уровень образования',
        'Количество друзей',
      ],
      correct: 1,
    },
  ],
};

const glossaryTermQuestions: Question[] = [
  {
    id: 101,
    question: 'Что означает термин "Инфляция"?',
    options: [
      'Устойчивый рост общего уровня цен',
      'Резкое падение курса валюты',
      'Повышение доходов населения',
      'Рост производства в стране',
    ],
    correct: 0,
  },
  {
    id: 102,
    question: 'Что такое ВВП?',
    options: [
      'Годовой бюджет государства',
      'Совокупная стоимость конечных товаров и услуг за год',
      'Денежный запас банков',
      'Объем экспорта за месяц',
    ],
    correct: 1,
  },
  {
    id: 103,
    question: 'Что такое правоспособность?',
    options: [
      'Право участвовать в выборах',
      'Способность иметь права и обязанности',
      'Возможность служить в армии',
      'Вид гражданского договора',
    ],
    correct: 1,
  },
  {
    id: 104,
    question: 'Что означает термин "Договор"?',
    options: [
      'Указ президента',
      'Решение суда',
      'Соглашение об установлении или изменении прав и обязанностей',
      'Вид налога',
    ],
    correct: 2,
  },
  {
    id: 105,
    question: 'Что означает термин "Суверенитет"?',
    options: [
      'Отсутствие законов в государстве',
      'Верховная власть государства и независимость вовне',
      'Смена формы правления',
      'Полномочия местной администрации',
    ],
    correct: 1,
  },
  {
    id: 106,
    question: 'Что такое федерация?',
    options: [
      'Союз независимых стран без центра',
      'Форма правления, где правит монарх',
      'Государство с частями, имеющими определенную самостоятельность',
      'Экономический кризис',
    ],
    correct: 2,
  },
  {
    id: 107,
    question: 'Что означает термин "Стратификация"?',
    options: [
      'Разделение общества на социальные слои',
      'Объединение всех людей в одну группу',
      'Переход к демократии',
      'Экономическое планирование',
    ],
    correct: 0,
  },
  {
    id: 108,
    question: 'Что такое социализация?',
    options: [
      'Процесс усвоения норм и ценностей общества',
      'Регистрация гражданина',
      'Распределение бюджета страны',
      'Смена профессии',
    ],
    correct: 0,
  },
];

const DEFAULT_QUESTIONS = questionsByCategory['Гражданское право'];
const DAILY_LIVES = 3;

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

export default function TestScreen({ route, navigation }: any) {
  const categoryTitle: string = route?.params?.categoryTitle ?? '';
  const isDailyTest: boolean = route?.params?.testMode === 'daily';
  const categoryColor: string = route?.params?.categoryColor ?? (isDailyTest ? '#F97316' : colors.primary.main);

  const questions: Question[] = useMemo(() => {
    if (!isDailyTest) {
      return questionsByCategory[categoryTitle] ?? DEFAULT_QUESTIONS;
    }
    const allCategoryQuestions = Object.values(questionsByCategory).flat();
    return shuffleArray([...allCategoryQuestions, ...glossaryTermQuestions]).slice(0, 12);
  }, [categoryTitle, isDailyTest]);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [lives, setLives] = useState(DAILY_LIVES);
  const [finishedByLives, setFinishedByLives] = useState(false);

  const question = questions[currentQuestion];
  const percent = Math.round((score / questions.length) * 100);

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    const isCorrect = index === question.correct;
    setTimeout(() => {
      if (!isCorrect && isDailyTest) {
        const nextLives = lives - 1;
        setLives(nextLives);
        if (nextLives <= 0) {
          setFinishedByLives(true);
          setFinished(true);
          return;
        }
      }

      if (currentQuestion < questions.length - 1) {
        if (isCorrect) setScore(s => s + 1);
        setCurrentQuestion(q => q + 1);
        setSelectedAnswer(null);
      } else {
        if (isCorrect) setScore(s => s + 1);
        setFinished(true);
      }
    }, 700);
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setFinished(false);
    setLives(DAILY_LIVES);
    setFinishedByLives(false);
  };

  // Функция для определения звёзд
  const getStars = () => {
    if (percent >= 90) return 3;
    if (percent >= 70) return 2;
    return 1;
  };

  const stars = getStars();
  const getMessage = () => {
    if (finishedByLives) return { emoji: '❤️', text: 'Жизни закончились' };
    if (percent === 100) return { emoji: '🏆', text: 'Идеально!' };
    if (percent >= 90) return { emoji: '⭐', text: 'Превосходно!' };
    if (percent >= 80) return { emoji: '🎉', text: 'Отлично!' };
    if (percent >= 70) return { emoji: '👍', text: 'Хорошо!' };
    if (percent >= 50) return { emoji: '📚', text: 'Нужно повторить' };
    return { emoji: '💪', text: 'Попробуй снова' };
  };

  const message = getMessage();

  if (finished) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.surface }]}>
        <ScrollView contentContainerStyle={styles.resultContent} showsVerticalScrollIndicator={false}>
          <View style={styles.resultHeader}>
            <Pressable style={styles.resultBackBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
            </Pressable>
            <Text style={styles.resultHeaderTitle}>{isDailyTest ? 'Ежедневный тест' : 'Результат'}</Text>
            <View style={{ width: 32 }} />
          </View>

          {/* Карточка результата */}
          <View style={[styles.resultCard, { borderTopColor: categoryColor }]}>
            <Text style={styles.resultEmoji}>{message.emoji}</Text>

            {/* Звёзды */}
            <View style={styles.starsRow}>
              {[1, 2, 3].map((star) => (
                <Text key={star} style={[styles.star, { opacity: star <= stars ? 1 : 0.2 }]}>
                  ⭐
                </Text>
              ))}
            </View>

            {/* Процент в красивом круге */}
            <View style={[styles.percentCircle, { backgroundColor: `${categoryColor}15`, borderColor: categoryColor }]}>
              <Text style={[styles.percentText, { color: categoryColor }]}>{percent}%</Text>
            </View>

            {/* Текст */}
            <Text style={styles.resultMessage}>{message.text}</Text>

            {isDailyTest && (
              <Text style={styles.dailyHintText}>Режим с жизнями: осталось {lives} из {DAILY_LIVES}</Text>
            )}

            {/* Статистика */}
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statIcon}>✓</Text>
                <Text style={styles.statValue}>{score}</Text>
                <Text style={styles.statLabel}>Правильно</Text>
              </View>
              <View style={[styles.statBox, { borderLeftWidth: 1, borderLeftColor: colors.border }]}>
                <Text style={styles.statIcon}>✗</Text>
                <Text style={[styles.statValue, { color: colors.error }]}>{questions.length - score}</Text>
                <Text style={styles.statLabel}>Ошибок</Text>
              </View>
            </View>

            {/* Бонус информация */}
            <View style={styles.bonusBox}>
              <Ionicons name="flash" size={16} color="#FBBF24" />
              <Text style={styles.bonusText}>+{isDailyTest ? score * 30 : percent * 2} XP заработано!</Text>
            </View>
          </View>

          {/* Кнопки */}
          <View style={styles.resultButtonsGroup}>
            <Pressable
              style={[styles.resultMainBtn, { backgroundColor: categoryColor }]}
              onPress={handleRestart}
            >
              <Ionicons name="refresh" size={16} color="#FFFFFF" />
              <Text style={styles.resultMainBtnText}>Пройти ещё раз</Text>
            </Pressable>
            <Pressable style={styles.resultSecondBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={16} color={categoryColor} />
              <Text style={[styles.resultSecondBtnText, { color: categoryColor }]}>Вернуться к теме</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Шапка */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
            </Pressable>
            <Text style={styles.questionNumber}>
              {currentQuestion + 1} / {questions.length}
            </Text>
            <View style={styles.scoreBadge}>
              <Ionicons name="trophy" size={14} color={colors.tertiary.main} />
              <Text style={styles.scoreText}>{score} балл.</Text>
            </View>
          </View>

          {isDailyTest && (
            <View style={styles.livesRow}>
              <Text style={styles.livesLabel}>Жизни:</Text>
              <View style={styles.livesWrap}>
                {[1, 2, 3].map((life) => (
                  <Text key={life} style={[styles.lifeEmoji, life > lives && styles.lifeEmojiLost]}>❤</Text>
                ))}
              </View>
              <Text style={styles.dailyLabel}>Ежедневный микс: категории + глоссарий</Text>
            </View>
          )}

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                  backgroundColor: categoryColor,
                },
              ]}
            />
          </View>
        </View>

        {/* Вопрос */}
        <View style={styles.questionContainer}>
          <Text style={styles.question}>{question.question}</Text>

          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.correct;
              return (
                <Pressable
                  key={index}
                  style={[
                    styles.option,
                    isSelected && styles.optionSelected,
                    isSelected && isCorrect && styles.optionCorrect,
                    isSelected && !isCorrect && styles.optionIncorrect,
                    selectedAnswer !== null && isCorrect && styles.optionCorrect,
                  ]}
                  onPress={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                >
                  <View style={styles.optionLeading}>
                    <Text style={styles.optionLetter}>{String.fromCharCode(65 + index)}</Text>
                  </View>
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                  {selectedAnswer !== null && isCorrect && (
                    <Ionicons name="checkmark-circle" size={18} color={colors.secondary.main} />
                  )}
                  {isSelected && !isCorrect && (
                    <Ionicons name="close-circle" size={18} color={colors.error} />
                  )}
                </Pressable>
              );
            })}
          </View>
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
  container: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  header: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: '#FFF8EA',
    borderRadius: 999,
  },
  scoreText: {
    color: colors.tertiary.dark,
    fontSize: 12,
    fontWeight: '700',
  },
  progressBar: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  questionContainer: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  question: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 18,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 10,
  },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionSelected: {
    borderColor: colors.primary.main,
  },
  optionCorrect: {
    borderColor: colors.secondary.main,
    backgroundColor: `${colors.secondary.main}15`,
  },
  optionIncorrect: {
    borderColor: colors.error,
    backgroundColor: `${colors.error}10`,
  },
  optionLeading: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetter: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: colors.primary.main,
    fontWeight: '600',
  },

  /* Экран результата */
  resultScreen: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  resultCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  resultBigPercent: {
    fontSize: 42,
    fontWeight: '800',
  },
  resultCircleLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text.primary,
    textAlign: 'center',
  },
  resultSub: {
    fontSize: 15,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  resultActions: {
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  resultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  resultBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resultBtnOutline: {
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  resultBtnOutlineText: {
    fontSize: 15,
    fontWeight: '700',
  },

  /* Улучшенный экран результатов */
  resultContent: {
    paddingBottom: 40,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultBackBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
  },
  resultCard: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderTopWidth: 4,
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderTopColor: colors.primary.main,
    borderColor: colors.border,
  },
  resultEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  star: {
    fontSize: 24,
  },
  percentCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  percentText: {
    fontSize: 48,
    fontWeight: '800',
  },
  resultMessage: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 24,
  },
  dailyHintText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
    marginBottom: 18,
  },
  statsGrid: {
    width: '100%',
    flexDirection: 'row',
    gap: 0,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  statIcon: {
    fontSize: 18,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.secondary.main,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
    marginTop: 4,
  },
  bonusBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  bonusText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B45309',
  },
  resultButtonsGroup: {
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 24,
  },
  resultMainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  resultMainBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resultSecondBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
  },
  resultSecondBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  livesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  livesLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '700',
  },
  livesWrap: {
    flexDirection: 'row',
    gap: 4,
  },
  lifeEmoji: {
    fontSize: 14,
    color: '#E11D48',
  },
  lifeEmojiLost: {
    opacity: 0.25,
  },
  dailyLabel: {
    fontSize: 11,
    color: colors.neutral.main,
    fontWeight: '600',
  },
});


