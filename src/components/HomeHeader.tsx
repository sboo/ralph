import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../support/storageKeys';
import {Text, Avatar} from 'react-native-paper';
import {useTheme} from 'react-native-paper';
import {launchImageLibrary, MediaType} from 'react-native-image-picker';
import {EVENT_NAMES, event} from '@/features/event';
import AvatarPicker from '@/support/components/AvatarPicker.tsx';

interface HomeHeaderPros {
  petName: string;
}

const HomeHeader: React.FC<HomeHeaderPros> = ({petName}) => {
  const {t} = useTranslation();
  const theme = useTheme();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return t('greeting_morning');
    }
    if (hour < 18) {
      return t('greeting_afternoon');
    }
    return t('greeting_evening');
  };

  return (
    <View
      style={{
        backgroundColor: theme.colors.primary,
        ...styles.container,
      }}>
      <View style={styles.greetingsContainer}>
        <Text style={{color: theme.colors.onPrimary, ...styles.greeting}}>
          {getGreeting()}
        </Text>
        <Text style={{color: theme.colors.onPrimary, ...styles.petName}}>
          {petName}
        </Text>
      </View>
      <AvatarPicker />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 90,
    padding: 20,
    borderBottomStartRadius: 20,
    borderBottomEndRadius: 20,
  },
  greetingsContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 14,
  },
  petName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  avatar: {
    backgroundColor: '#ffffff',
  },
});

export default HomeHeader;
