import React from 'react';
import App from './App';
import { ThemeContext, useThemeProvider } from './hooks/useTheme';

export const AppWithTheme: React.FC = () => {
  const themeValue = useThemeProvider();
  return (
    <ThemeContext.Provider value={themeValue}>
      <App />
    </ThemeContext.Provider>
  );
};