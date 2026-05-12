import { createContext } from 'react';

export type AuthContextValue = {
  signIn: () => void;
  signOut: () => void;
};

export const AuthContext = createContext<AuthContextValue>({
  signIn: () => {},
  signOut: () => {},
});
