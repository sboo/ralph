import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../store/storageKeys';

export const PET_REQUIRES_MIGRATION = 'PET_REQUIRES_MIGRATION';

export const getPetData = async () => {
  const data = await AsyncStorage.multiGet([
    STORAGE_KEYS.PET_NAME,
    STORAGE_KEYS.PET_TYPE,
    STORAGE_KEYS.AVATAR,
    STORAGE_KEYS.NOTIFICATIONS_ENABLED,
    STORAGE_KEYS.NOTIFICATIONS_TIME,
  ]);

  const name = data[0][1] ?? 'your pet';
  const species = data[1][1] ?? 'other';
  const avatar = data[2][1];
  const notificationsEnabled = data[3][1] === 'true';
  const notificationsTime = data[4][1];
  return {name, species, avatar, notificationsEnabled, notificationsTime};
};
