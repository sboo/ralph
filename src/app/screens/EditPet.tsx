import {EditPetScreenNavigationProps} from '@/features/navigation/types';
import PetItem from '@/features/pets/components/PetItem';
import usePet, {PetData} from '@/features/pets/hooks/usePet';
import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from 'react-native-paper';

const EditPet: React.FC<EditPetScreenNavigationProps> = ({navigation}) => {
  const theme = useTheme();
  const {activePet, updatePet, deletePet} = usePet();

  if (!activePet) {
    navigation.goBack();
    return;
  }

  const onSubmit = (data: PetData) => {
    if (data.delete) {
      deletePet(activePet._id);
      navigation.goBack();
      return;
    }
    try {
    updatePet(activePet._id, data);
    } catch (error) {
      console.error('Error updating pet', error);
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView
      style={{
        backgroundColor: theme.colors.primaryContainer,
        ...styles.container,
      }}>
      <LinearGradient
        colors={[
          theme.colors.primaryContainer,
          theme.colors.background,
          theme.colors.primaryContainer,
        ]}
        locations={[0, 0.75, 1]}
        style={styles.gradient}>
        <PetItem pet={activePet} onSubmit={onSubmit} navigation={navigation} />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
});

export default EditPet;
