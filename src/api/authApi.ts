import { Platform } from 'react-native';

type AuthUser = {
  id: string;
  email: string;
  name: string;
  lastName: string | null;
};

type AuthApiResponse = {
  success: boolean;
  message?: string;
  user?: AuthUser;
};

const defaultBaseUrl = Platform.select({
  android: 'http://10.0.2.2:3000',
  ios: 'http://localhost:3000',
  default: 'http://localhost:3000',
});

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || defaultBaseUrl;

async function postAuth(endpoint: 'register' | 'login', payload: Record<string, string>) {
  const response = await fetch(`${API_BASE_URL}/api/auth/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  let data: AuthApiResponse | null = null;

  try {
    data = (await response.json()) as AuthApiResponse;
  } catch {
    // Ignore JSON parsing errors and handle as generic failure below.
  }

  if (!response.ok) {
    const message = data?.message || 'Ошибка соединения с сервером';
    throw new Error(message);
  }

  if (!data?.success || !data.user) {
    throw new Error(data?.message || 'Сервер вернул некорректный ответ');
  }

  return data.user;
}

export async function registerRequest(payload: {
  email: string;
  password: string;
  name: string;
  lastName: string;
}) {
  return postAuth('register', payload);
}

export async function loginRequest(payload: { email: string; password: string }) {
  return postAuth('login', payload);
}
