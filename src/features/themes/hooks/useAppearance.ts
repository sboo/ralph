import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { STORAGE_KEYS } from '@/app/store/storageKeys';
import { event, EVENT_NAMES } from '@/features/events';

export type Appearance = 'light' | 'dark' | 'system' | '';

export const useAppearance = () => {
  const systemColorScheme = useColorScheme();
  const [appearance, setAppearance] = useState<Appearance>('light');

  const loadThemePreference = useCallback(async () => {
    try {
      const savedThemeMode = await AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE);
      setAppearance(savedThemeMode as Appearance || 'light');
    } catch (error) {
      console.error('Error loading theme preference:', error);
      setAppearance('system');
    }
  }, []);

  const changeAppearance = useCallback(async (newThemeMode: Appearance) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, newThemeMode);
      setAppearance(newThemeMode);
      event.emit(EVENT_NAMES.THEME_CHANGED, newThemeMode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  }, []);

  useEffect(() => {
    loadThemePreference();
    
    // Listen for theme changes from other components
    event.addListener(EVENT_NAMES.THEME_CHANGED, 
      (newTheme: Appearance) => {
        setAppearance(newTheme);
      }
    );

    return () => {
      event.removeListener(EVENT_NAMES.THEME_CHANGED, setAppearance);
    };
  }, [loadThemePreference]);

  return {
    appearance,
    changeAppearance,
    effectiveAppearance: appearance === 'system' || appearance === '' 
      ? systemColorScheme 
      : appearance
  };
};