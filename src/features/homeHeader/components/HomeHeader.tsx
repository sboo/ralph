import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Avatar from '@/features/avatar/components/Avatar';
import { event, EVENT_NAMES } from '@/features/events';
import { withObservables } from '@nozbe/watermelondb/react';
import { Q } from '@nozbe/watermelondb';
import { database } from '@/app/database';
import { Pet } from '@/app/database/models/Pet';
import { map } from 'rxjs/operators';

// The presentational component
const HomeHeaderComponent = ({ activePet, inactivePets, allPets }: {
  activePet: Pet | undefined,
  inactivePets: Pet[],
  allPets: Pet[]
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [headerColor, setHeaderColor] = useState(theme.colors.primary);

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

  const switchPet = async (petId: string | undefined) => {
    if (petId) {
      event.emit(EVENT_NAMES.SWITCHING_PET, petId);
      await database.write(async () => {
        for (const pet of allPets) {
          if (pet.id === petId) {
            pet.update(record => {
              record.isActive = true;
            }
            );
          } else {
            pet.update(record => {
              record.isActive = false;
            });
          }
        }
      });
    }
  };

  // Determine header color based on active pet index
  useEffect(() => {

    // If no active pet, use primary color
    if (!activePet || allPets.length === 0) {
      setHeaderColor(theme.colors.primary);
      return;
    }

    // Find the index of the active pet in the pets array
    const petIndex = allPets.findIndex(pet => pet.id === activePet.id);

    // Use modulo to cycle through colors after 3 pets
    switch (petIndex % 3) {
      case 0:
        setHeaderColor(theme.colors.primary);
        break;
      case 1:
        setHeaderColor(theme.colors.secondary);
        break;
      case 2:
        setHeaderColor(theme.colors.tertiary);
        break;
      default:
        setHeaderColor(theme.colors.primary);
    }
  }, [activePet, allPets, theme.colors]);

  return (
    <View
      style={{
        backgroundColor: headerColor,
        ...styles.container,
      }}>
      <View style={styles.greetingsContainer}>
        <Text style={{ color: theme.colors.onPrimary, ...styles.greeting }}>
          {getGreeting()}
        </Text>
        <Text style={{ color: theme.colors.onPrimary, ...styles.petName }}>
          {activePet?.name}
        </Text>
      </View>
      <View style={styles.avatarContainer}>
        {inactivePets.map(pet => {
          return (
            <Avatar
              key={pet.id}
              pet={pet}
              size={'small'}
              onAvatarViewModeTouch={switchPet}
            />
          );
        })}
        {activePet && (
          <Avatar key={activePet.id} pet={activePet} />
        )}
      </View>
    </View>
  );
};

// Styles remain the same
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

// Connect with WatermelonDB observables
const enhance = withObservables([], () => ({
  allPets: database.get<Pet>('pets').query().observe(),
  activePet: database.get<Pet>('pets').query(Q.where('is_active', true)).observeWithColumns(['is_active']).pipe(
    // Handle empty results by returning undefined for activePet
    map(pets => pets.length > 0 ? pets[0] : undefined)
  ),
  inactivePets: database.get<Pet>('pets').query(Q.where('is_active', false)),
}));

// Export the enhanced component
export default enhance(HomeHeaderComponent);
