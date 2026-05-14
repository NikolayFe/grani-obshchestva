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

export type { ApiCategory, ApiTerm };
