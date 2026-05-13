export type ActivityPeriod = 'week' | 'month';

export type ActivityDay = {
  id: number;
  label: string;
  active: boolean;
  current?: boolean;
};

export type ActivityWeekRow = {
  weekLabel: string;
  days: boolean[]; // 7 days Mon-Sun
};

export type ActivityPeriodData =
  | { mode: 'week'; activeDays: number; totalDays: number; streak: number; days: ActivityDay[] }
  | { mode: 'month'; activeDays: number; totalDays: number; streak: number; weeks: ActivityWeekRow[] };

export const activityPeriodLabels: Record<ActivityPeriod, string> = {
  week: 'Неделя',
  month: 'Месяц',
};

export const activityData: Record<ActivityPeriod, ActivityPeriodData> = {
  week: {
    mode: 'week',
    activeDays: 3,
    totalDays: 7,
    streak: 3,
    days: [
      { id: 1, label: 'Пн', active: true },
      { id: 2, label: 'Вт', active: true },
      { id: 3, label: 'Ср', active: true, current: true },
      { id: 4, label: 'Чт', active: false },
      { id: 5, label: 'Пт', active: false },
      { id: 6, label: 'Сб', active: false },
      { id: 7, label: 'Вс', active: false },
    ],
  },
  month: {
    mode: 'month',
    activeDays: 12,
    totalDays: 30,
    streak: 3,
    weeks: [
      { weekLabel: '28 апр – 4 мая', days: [true, true, false, true, false, false, false] },
      { weekLabel: '5 – 11 мая', days: [true, true, true, false, true, false, true] },
      { weekLabel: '12 – 18 мая', days: [true, true, true, false, false, false, false] },
      { weekLabel: '19 – 25 мая', days: [false, true, true, true, false, false, false] },
    ],
  },
};
