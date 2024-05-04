import React, { useEffect } from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import Avatar from '@/features/avatar/components/Avatar';
import usePet from '@/features/pets/hooks/usePet';
import {BSON} from 'realm';
import {event, EVENT_NAMES} from '@/features/events';

const HomeHeader: React.FC = () => {
  const {t} = useTranslation();
  const theme = useTheme();
  const {activePet, inactivePets, switchActivePet, getHeaderColor} = usePet();

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

  const switchPet = (petId: BSON.ObjectID | undefined) => {
    if (petId) {
      event.emit(EVENT_NAMES.SWITCHING_PET, petId);
      switchActivePet(petId);
    }
  };

  return (
    <View
      style={{
        backgroundColor: getHeaderColor(theme),
        ...styles.container,
      }}>
      <View style={styles.greetingsContainer}>
        <Text style={{color: theme.colors.onPrimary, ...styles.greeting}}>
          {getGreeting()}
        </Text>
        <Text style={{color: theme.colors.onPrimary, ...styles.petName}}>
          {activePet?.name}
        </Text>
      </View>
      <View style={styles.avatarContainer}>
        {inactivePets.map(pet => {
          return (
            <Avatar
              key={pet._id.toHexString()}
              pet={pet}
              size={'small'}
              onAvatarViewModeTouch={switchPet}
            />
          );
        })}
        <Avatar key={activePet?._id.toHexString()} pet={activePet} />
      </View>
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
  avatarContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    gap: 15,
  },
  avatar: {
    backgroundColor: '#ffffff',
  },
});

export default HomeHeader;
