export type RatingPeriod = 'week' | 'allTime';

export type RatingEntry = {
  id: number;
  place: number;
  name: string;
  xp: number;
  delta: string;
  accent: string;
  isCurrentUser?: boolean;
};

export type RatingPeriodData = {
  summary: string;
  leaderLabel: string;
  currentTrend: string;
  currentHint: string;
  currentBadge: string;
  leaderboard: RatingEntry[];
};

export const ratingPeriodLabels: Record<RatingPeriod, string> = {
  week: 'Неделя',
  allTime: 'Все время',
};

export const ratingData: Record<RatingPeriod, RatingPeriodData> = {
  week: {
    summary: 'Смотри, кто набрал больше всего XP за эту неделю.',
    leaderLabel: 'Лидер недели',
    currentTrend: '+1 за сегодня',
    currentHint: 'До следующего места осталось 240 XP',
    currentBadge: '+160 XP',
    leaderboard: [
      { id: 1, place: 1, name: 'Михаил К.', xp: 2400, delta: '+320 за неделю', accent: '#FFE6A6' },
      { id: 2, place: 2, name: 'Елена М.', xp: 2160, delta: '+250 за неделю', accent: '#E8E0F7' },
      { id: 3, place: 3, name: 'Алина С.', xp: 1980, delta: '+190 за неделю', accent: '#F2E5D4' },
      { id: 4, place: 4, name: 'Александр', xp: 1740, delta: '+160 за неделю', accent: '#EAD8FF', isCurrentUser: true },
      { id: 5, place: 5, name: 'Ирина П.', xp: 1510, delta: '+120 за неделю', accent: '#DDF6E8' },
      { id: 6, place: 6, name: 'Сергей Н.', xp: 1400, delta: '+90 за неделю', accent: '#E3EEFF' },
    ],
  },
  allTime: {
    summary: 'Здесь собран общий рейтинг за всё время обучения.',
    leaderLabel: 'Лидер за все время',
    currentTrend: 'Топ-4 стабильно',
    currentHint: 'До третьего места осталось 1 140 XP',
    currentBadge: '1 740 XP',
    leaderboard: [
      { id: 1, place: 1, name: 'Елена М.', xp: 12480, delta: '+1 240 за месяц', accent: '#E8E0F7' },
      { id: 2, place: 2, name: 'Михаил К.', xp: 11920, delta: '+980 за месяц', accent: '#FFE6A6' },
      { id: 3, place: 3, name: 'Алина С.', xp: 10240, delta: '+860 за месяц', accent: '#F2E5D4' },
      { id: 4, place: 4, name: 'Александр', xp: 9100, delta: '+740 за месяц', accent: '#EAD8FF', isCurrentUser: true },
      { id: 5, place: 5, name: 'Сергей Н.', xp: 8840, delta: '+700 за месяц', accent: '#E3EEFF' },
      { id: 6, place: 6, name: 'Ирина П.', xp: 8570, delta: '+680 за месяц', accent: '#DDF6E8' },
    ],
  },
};