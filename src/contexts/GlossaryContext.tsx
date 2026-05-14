import React, { createContext, useState, useContext, ReactNode } from 'react';

interface GlossaryContextType {
  knownTermIds: string[];
  setKnownTermIds: (ids: string[]) => void;
  addKnownTerm: (id: string) => void;
  clearKnownTerms: () => void;
}

const GlossaryContext = createContext<GlossaryContextType | undefined>(undefined);

export function GlossaryProvider({ children }: { children: ReactNode }) {
  const [knownTermIds, setKnownTermIds] = useState<string[]>([]);

  const addKnownTerm = (id: string) => {
    setKnownTermIds((prev) => {
      if (!prev.includes(id)) {
        return [...prev, id];
      }
      return prev;
    });
  };

  const clearKnownTerms = () => {
    setKnownTermIds([]);
  };

  return (
    <GlossaryContext.Provider
      value={{
        knownTermIds,
        setKnownTermIds,
        addKnownTerm,
        clearKnownTerms,
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
