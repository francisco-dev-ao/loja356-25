
import React, { createContext, useContext } from 'react';
import { useSettingsManager } from './useSettingsManager';
import type { SettingsContextType } from './types';
import { defaultSettings } from './defaultSettings';

// Create the context with undefined as initial value
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Use our custom hook to get all the settings functionality
  const settingsManager = useSettingsManager();
  
  return (
    <SettingsContext.Provider value={settingsManager}>
      {children}
    </SettingsContext.Provider>
  );
};

// Re-export the default settings and types for convenience
export { defaultSettings };
export type { CompanySettings } from './types';
