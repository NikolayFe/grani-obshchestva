import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useGlossary } from './GlossaryContext';
import {
  DAILY_LIVES_MAX,
  DAILY_LIFE_RESTORE_MS,
  DailyLivesStatus,
  consumeDailyLife,
  loadDailyLivesStatus,
  setDailyLives,
} from '../utils/dailyLives';

type DailyLivesContextType = {
  lives: number;
  maxLives: number;
  msToNextLife: number;
  isLoading: boolean;
  refreshLives: () => Promise<DailyLivesStatus | null>;
  consumeOneLife: () => Promise<DailyLivesStatus>;
  forceSetLives: (lives: number) => Promise<DailyLivesStatus>;
};

const DailyLivesContext = createContext<DailyLivesContextType | undefined>(undefined);

export function DailyLivesProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useGlossary();

  const [lives, setLives] = useState(DAILY_LIVES_MAX);
  const [msToNextLife, setMsToNextLife] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Ref для актуального значения lives — используется в consumeOneLife
  // чтобы не включать lives в deps (иначе функция пересоздавалась бы при каждом тике).
  const livesRef = useRef(lives);
  livesRef.current = lives;

  const applyStatus = useCallback((status: DailyLivesStatus) => {
    setLives(status.lives);
    setMsToNextLife(status.msToNextLife);
  }, []);

  const buildLocalStatus = useCallback((nextLives: number): DailyLivesStatus => {
    const clampedLives = Math.max(0, Math.min(DAILY_LIVES_MAX, nextLives));
    const nextMs = clampedLives >= DAILY_LIVES_MAX ? 0 : DAILY_LIFE_RESTORE_MS;
    return {
      lives: clampedLives,
      maxLives: DAILY_LIVES_MAX,
      msToNextLife: nextMs,
      nextLifeAt: nextMs > 0 ? Date.now() + nextMs : null,
    };
  }, []);

  // Стабильная функция — зависит только от userId и applyStatus, НЕ от lives/msToNextLife.
  // Guard убран: applyRegeneration ограничена Math.min(1, ...), поэтому никогда не
  // восстановит больше одной жизни за раз, и блокировать обновление больше не нужно.
  const refreshLives = useCallback(async (): Promise<DailyLivesStatus | null> => {
    try {
      const status = await loadDailyLivesStatus(userId);
      applyStatus(status);
      return status;
    } catch {
      return null;
    }
  }, [applyStatus, userId]);

  // Тоже стабильная — читает lives через ref.
  const consumeOneLife = useCallback(async (): Promise<DailyLivesStatus> => {
    const optimisticLives = Math.max(0, livesRef.current - 1);
    const optimisticStatus = buildLocalStatus(optimisticLives);
    applyStatus(optimisticStatus);

    try {
      const status = await consumeDailyLife(userId);
      applyStatus(status);
      return status;
    } catch {
      try {
        const status = await setDailyLives(userId, optimisticLives);
        applyStatus(status);
        return status;
      } catch {
        return optimisticStatus;
      }
    }
  }, [applyStatus, buildLocalStatus, userId]);

  const forceSetLives = useCallback(async (nextLives: number): Promise<DailyLivesStatus> => {
    const optimisticStatus = buildLocalStatus(nextLives);
    applyStatus(optimisticStatus);

    try {
      const status = await setDailyLives(userId, nextLives);
      applyStatus(status);
      return status;
    } catch {
      return optimisticStatus;
    }
  }, [applyStatus, buildLocalStatus, userId]);

  // Загрузка один раз при монтировании / смене userId.
  // НЕ зависит от refreshLives — иначе каждый тик таймера перезапускал бы загрузку
  // и дёргал setIsLoading(true), что вызывало спиннер каждую секунду.
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const status = await loadDailyLivesStatus(userId);
        if (mounted) applyStatus(status);
      } catch {
        // оставляем дефолтные значения
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [userId, applyStatus]);

  // 1-секундный таймер обратного отсчёта. Пустые deps — создаётся один раз.
  useEffect(() => {
    const timer = setInterval(() => {
      setMsToNextLife((prev) => Math.max(0, prev - 1000));
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // Авто-обновление из storage когда таймер доходит до 0 (жизнь должна появиться).
  // Используем prevMsRef чтобы зафиксировать переход >0 → 0: в этот момент
  // компонент уже перерисован и все refs актуальны, поэтому refreshLives работает корректно.
  const prevMsRef = useRef(msToNextLife);
  useEffect(() => {
    const wasAboveZero = prevMsRef.current > 0;
    prevMsRef.current = msToNextLife;

    if (msToNextLife === 0 && wasAboveZero) {
      void refreshLives();
    }
  }, [msToNextLife, refreshLives]);

  const value = useMemo(
    () => ({
      lives,
      maxLives: DAILY_LIVES_MAX,
      msToNextLife,
      isLoading,
      refreshLives,
      consumeOneLife,
      forceSetLives,
    }),
    [lives, msToNextLife, isLoading, refreshLives, consumeOneLife, forceSetLives]
  );

  return <DailyLivesContext.Provider value={value}>{children}</DailyLivesContext.Provider>;
}

export function useDailyLives() {
  const context = useContext(DailyLivesContext);
  if (!context) {
    throw new Error('useDailyLives must be used within DailyLivesProvider');
  }
  return context;
}
