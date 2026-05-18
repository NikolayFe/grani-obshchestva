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

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  lastName: string | null;
  xpTotal: number;
  streakDays: number;
};

export type AuthContextValue = {
  signIn: (user: AuthUser) => void;
  signOut: () => void;
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  lastOpenedCategory: LearningCategory | null;
  setLastOpenedCategory: (category: LearningCategory | null) => void;
};

export const AuthContext = createContext<AuthContextValue>({
  signIn: () => {},
  signOut: () => {},
  user: null,
  setUser: () => {},
  lastOpenedCategory: null,
  setLastOpenedCategory: () => {},
});
