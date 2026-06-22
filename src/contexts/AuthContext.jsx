/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const MOCK_USER = {
  id: 'user1',
  name: 'John Doe',
  email: 'john@example.com',
  preferences: { theme: 'dark', notifications: true },
  favoriteEvents: ['1', '3'],
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(MOCK_USER);
  const [isAuthenticated] = useState(true);

  const updateFavorites = (eventId, isFavorite) => {
    setUser((prev) => ({
      ...prev,
      favoriteEvents: isFavorite
        ? [...prev.favoriteEvents, eventId]
        : prev.favoriteEvents.filter((id) => id !== eventId),
    }));
  };

  const updatePreferences = (preferences) => {
    setUser((prev) => ({ ...prev, preferences: { ...prev.preferences, ...preferences } }));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, setUser, updateFavorites, updatePreferences }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
