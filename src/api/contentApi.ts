import { Platform } from 'react-native';

type ApiCategory = {
  id: string;
  slug: string;
  title: string;
  color: string;
  _count: {
    terms: number;
    questions: number;
  };
};

type ApiTerm = {
  id: string;
  term: string;
  definition: string;
  isNew: boolean;
  category: {
    id: string;
    slug: string;
    title: string;
    color: string;
  };
};

type ApiListResponse<T> = {
  success: boolean;
  data: T[];
  total?: number;
  message?: string;
};

type ApiSingleResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

type ApiTestOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

type ApiTestQuestion = {
  id: string;
  text: string;
  source: 'category' | 'glossary_term';
  options: ApiTestOption[];
};

type TestStageKey = 'basic_1' | 'basic_2' | 'final_3';

type TestStageProgress = {
  stageKey: TestStageKey;
  title: string;
  difficulty: number;
  questionCount: number;
  minPercent: number;
  weightPercent: number;
  passed: boolean;
  score: number;
  totalQuestions: number;
  completedAt: string | null;
};

type CategoryTestStagesResponse = {
  categorySlug: string;
  categoryTitle: string;
  stages: TestStageProgress[];
  testsProgressPercent: number;
  passedStages: number;
  totalStages: number;
};

const defaultBaseUrl = Platform.select({
  android: 'http://10.0.2.2:3000',
  ios: 'http://localhost:3000',
  default: 'http://localhost:3000',
});

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || defaultBaseUrl;

async function getList<T>(path: string): Promise<T[]> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  let data: ApiListResponse<T> | null = null;
  try {
    data = (await response.json()) as ApiListResponse<T>;
  } catch {
    // Ignore JSON parse errors and fall through to error handling.
  }

  if (!response.ok) {
    throw new Error(data?.message || 'Ошибка соединения с сервером');
  }

  if (!data?.success || !Array.isArray(data.data)) {
    throw new Error(data?.message || 'Сервер вернул некорректный ответ');
  }

  return data.data;
}

export function getCategories() {
  return getList<ApiCategory>('/api/categories');
}

export function getTerms(params?: { categorySlug?: string; isNew?: boolean }) {
  const query = new URLSearchParams();

  if (params?.categorySlug) {
    query.set('categorySlug', params.categorySlug);
  }

  if (params?.isNew) {
    query.set('isNew', 'true');
  }

  const queryString = query.toString();
  const path = queryString ? `/api/terms?${queryString}` : '/api/terms';

  return getList<ApiTerm>(path);
}

export async function loadGlossaryProgress(userId: string): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/progress/glossary?userId=${encodeURIComponent(userId)}`);
  let data: { success: boolean; data?: string[]; message?: string } | null = null;
  try {
    data = await response.json();
  } catch {
    return [];
  }
  if (!response.ok || !data?.success || !Array.isArray(data.data)) {
    return [];
  }
  return data.data;
}

export async function saveGlossaryProgress(userId: string, termIds: string[]): Promise<void> {
  if (termIds.length === 0) return;
  const response = await fetch(`${API_BASE_URL}/api/progress/glossary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, termIds }),
  });

  let data: { success?: boolean; message?: string } | null = null;
  try {
    data = await response.json();
  } catch {
    // Если сервер вернул не JSON, ниже сработает общее сообщение об ошибке.
  }

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || `Не удалось сохранить прогресс (HTTP ${response.status})`);
  }
}

export async function clearGlossaryProgressApi(userId: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/progress/glossary`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
  } catch {
    // Игнорируем ошибки сети
  }
}

export async function loadTestQuestions(params: {
  categorySlug?: string;
  limit?: number;
  difficulty?: number;
  includeAll?: boolean;
}): Promise<ApiTestQuestion[]> {
  const query = new URLSearchParams();

  if (params.categorySlug) {
    query.set('categorySlug', params.categorySlug);
  }
  if (typeof params.limit === 'number') {
    query.set('limit', String(params.limit));
  }
  if (typeof params.difficulty === 'number') {
    query.set('difficulty', String(params.difficulty));
  }
  if (params.includeAll) {
    query.set('includeAll', 'true');
  }

  const response = await fetch(`${API_BASE_URL}/api/progress/tests/questions?${query.toString()}`);
  let data: ApiListResponse<ApiTestQuestion> | null = null;
  try {
    data = await response.json();
  } catch {
    throw new Error('Сервер вернул некорректный ответ');
  }

  if (!response.ok || !data?.success || !Array.isArray(data.data)) {
    throw new Error(data?.message || `Не удалось загрузить вопросы (HTTP ${response.status})`);
  }

  return data.data;
}

export async function saveTestAnswer(payload: {
  userId: string;
  questionId: string;
  selectedOptionId: string;
}): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/progress/tests/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  let data: ApiSingleResponse<unknown> | null = null;
  try {
    data = await response.json();
  } catch {
    // ignore
  }

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || `Не удалось сохранить ответ (HTTP ${response.status})`);
  }
}

export async function getCategoryTestStagesProgress(
  userId: string,
  categorySlug: string
): Promise<CategoryTestStagesResponse> {
  const query = new URLSearchParams({ userId, categorySlug });
  const response = await fetch(`${API_BASE_URL}/api/progress/tests/stage?${query.toString()}`);

  let data: ApiSingleResponse<CategoryTestStagesResponse> | null = null;
  try {
    data = await response.json();
  } catch {
    throw new Error('Сервер вернул некорректный ответ');
  }

  if (!response.ok || !data?.success || !data.data) {
    throw new Error(data?.message || `Не удалось загрузить прогресс тестов (HTTP ${response.status})`);
  }

  return data.data;
}

export async function saveCategoryTestStageResult(payload: {
  userId: string;
  categorySlug: string;
  stageKey: TestStageKey;
  score: number;
  totalQuestions: number;
}): Promise<CategoryTestStagesResponse> {
  const response = await fetch(`${API_BASE_URL}/api/progress/tests/stage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  let data: ApiSingleResponse<CategoryTestStagesResponse> | null = null;
  try {
    data = await response.json();
  } catch {
    throw new Error('Сервер вернул некорректный ответ');
  }

  if (!response.ok || !data?.success || !data.data) {
    throw new Error(data?.message || `Не удалось сохранить этап теста (HTTP ${response.status})`);
  }

  return data.data;
}

export type {
  ApiCategory,
  ApiTerm,
  ApiTestOption,
  ApiTestQuestion,
  TestStageKey,
  TestStageProgress,
  CategoryTestStagesResponse,
};

// ─── Users / Rating / Activity ─────────────────────────────────────────────

export type RatingEntry = {
  id: string;
  place: number;
  name: string;
  xp: number;
  streakDays: number;
  isCurrentUser: boolean;
};

export type RatingData = {
  period: string;
  summary: string;
  leaderboard: RatingEntry[];
};

export type ActivityDay = {
  id: number;
  label: string;
  active: boolean;
  current?: boolean;
};

export type ActivityWeekRow = {
  weekLabel: string;
  days: boolean[];
};

export type ActivityData =
  | { mode: 'week'; activeDays: number; totalDays: number; streak: number; days: ActivityDay[] }
  | { mode: 'month'; activeDays: number; totalDays: number; streak: number; weeks: ActivityWeekRow[] };

export async function getRating(period: 'week' | 'allTime', userId?: string): Promise<RatingData> {
  const params = new URLSearchParams({ period });
  if (userId) params.set('userId', userId);
  const response = await fetch(`${API_BASE_URL}/api/users/rating?${params.toString()}`);
  const data: { success: boolean; data?: RatingData; message?: string } = await response.json();
  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.message || 'Не удалось загрузить рейтинг');
  }
  return data.data;
}

export async function getActivity(userId: string, period: 'week' | 'month'): Promise<ActivityData> {
  const response = await fetch(
    `${API_BASE_URL}/api/users/${encodeURIComponent(userId)}/activity?period=${period}`,
  );
  const data: { success: boolean; data?: ActivityData; message?: string } = await response.json();
  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.message || 'Не удалось загрузить активность');
  }
  return data.data;
}

export async function recordActivity(userId: string): Promise<void> {
  await fetch(`${API_BASE_URL}/api/users/${encodeURIComponent(userId)}/activity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
}

export type OverallProgress = {
  overallPercent: number;
  categoriesTotal: number;
  categoriesDone: number;
  modulesLeft: number;
  currentCategorySlug: string | null;
  currentCategoryTitle: string | null;
};

export async function getOverallProgress(userId: string): Promise<OverallProgress> {
  const response = await fetch(
    `${API_BASE_URL}/api/progress/overall?userId=${encodeURIComponent(userId)}`,
  );
  const data: { success: boolean; data?: OverallProgress; message?: string } = await response.json();
  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.message || 'Не удалось загрузить прогресс');
  }
  return data.data;
}
