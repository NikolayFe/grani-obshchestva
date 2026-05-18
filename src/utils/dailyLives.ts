import { Platform } from 'react-native';

export const DAILY_LIVES_MAX = 3;
export const DAILY_LIFE_RESTORE_MS = 2 * 60 * 1000;

export type DailyLivesStatus = {
  lives: number;
  maxLives: number;
  msToNextLife: number;
  nextLifeAt: number | null;
};

const defaultBaseUrl = Platform.select({
  android: 'http://10.0.2.2:3000',
  ios: 'http://localhost:3000',
  default: 'http://localhost:3000',
});

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? defaultBaseUrl ?? 'http://localhost:3000';

function defaultStatus(): DailyLivesStatus {
  return {
    lives: DAILY_LIVES_MAX,
    maxLives: DAILY_LIVES_MAX,
    msToNextLife: 0,
    nextLifeAt: null,
  };
}

async function parseResponse(response: Response): Promise<DailyLivesStatus> {
  if (!response.ok) {
    throw new Error(`Lives API HTTP ${response.status}`);
  }
  const json = (await response.json()) as { success: boolean; data: DailyLivesStatus };
  if (!json.success || !json.data) {
    throw new Error('Lives API returned unsuccessful response');
  }
  return json.data;
}

export async function loadDailyLivesStatus(userId?: string | null): Promise<DailyLivesStatus> {
  if (!userId) return defaultStatus();
  const response = await fetch(
    `${API_BASE_URL}/api/lives?userId=${encodeURIComponent(userId)}`,
  );
  return parseResponse(response);
}

export async function consumeDailyLife(userId?: string | null): Promise<DailyLivesStatus> {
  if (!userId) return defaultStatus();
  const response = await fetch(`${API_BASE_URL}/api/lives/consume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  return parseResponse(response);
}

export async function setDailyLives(
  userId: string | null | undefined,
  lives: number,
): Promise<DailyLivesStatus> {
  if (!userId) return defaultStatus();
  const response = await fetch(`${API_BASE_URL}/api/lives/set`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, lives }),
  });
  return parseResponse(response);
}
