import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { loadGlossaryProgress, saveGlossaryProgress, clearGlossaryProgressApi } from '../api/contentApi';

interface GlossaryContextType {
  knownTermIds: string[];
  userId: string | null;
  setKnownTermIds: (ids: string[]) => void;
  addKnownTerm: (id: string) => void;
  clearKnownTerms: () => void;
  setUserId: (id: string | null) => void;
}

const GlossaryContext = createContext<GlossaryContextType | undefined>(undefined);

export function GlossaryProvider({ children }: { children: ReactNode }) {
  const [knownTermIds, setKnownTermIds] = useState<string[]>([]);
  const [userId, setUserIdState] = useState<string | null>(null);

  // Загружаем прогресс с сервера при смене userId
  useEffect(() => {
    if (!userId) return;
    loadGlossaryProgress(userId).then((ids) => {
      if (ids.length > 0) {
        setKnownTermIds(ids);
      }
    });
  }, [userId]);

  const setUserId = useCallback((id: string | null) => {
    setUserIdState(id);
  }, []);

  const addKnownTerm = useCallback((id: string) => {
    setKnownTermIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      // Сохраняем на сервер если пользователь авторизован
      if (userId) {
        saveGlossaryProgress(userId, [id]);
      }
      return next;
    });
  }, [userId]);

  const clearKnownTerms = useCallback(() => {
    setKnownTermIds([]);
    if (userId) {
      clearGlossaryProgressApi(userId);
    }
  }, [userId]);

  return (
    <GlossaryContext.Provider
      value={{
        knownTermIds,
        userId,
        setKnownTermIds,
        addKnownTerm,
        clearKnownTerms,
        setUserId,
      }}
    >
      {children}
    </GlossaryContext.Provider>
  );
}

export function useGlossary() {
  const context = useContext(GlossaryContext);
  if (!context) {
    throw new Error('useGlossary must be used within GlossaryProvider');
  }
  return context;
}

