import { createContext } from 'react';
import { Ionicons } from '@expo/vector-icons';

export type LearningCategory = {
  title: string;
  description: string;
  color: string;
  bg: string;
  icon: keyof typeof Ionicons.glyphMap;
  terms: number;
  total: number;
};

export type AuthContextValue = {
  signIn: () => void;
  signOut: () => void;
  lastOpenedCategory: LearningCategory | null;
  setLastOpenedCategory: (category: LearningCategory | null) => void;
};

export const AuthContext = createContext<AuthContextValue>({
  signIn: () => {},
  signOut: () => {},
  lastOpenedCategory: null,
  setLastOpenedCategory: () => {},
});
