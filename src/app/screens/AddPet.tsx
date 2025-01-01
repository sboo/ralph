import {AddPetScreenNavigationProps} from '@/features/navigation/types';
import PetItem from '@/features/pets/components/PetItem';
import usePet, {PetData} from '@/features/pets/hooks/usePet';
import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from 'react-native-paper';

const AddPet: React.FC<AddPetScreenNavigationProps> = ({navigation}) => {
  const theme = useTheme();
  const {createPet} = usePet();

  const onSubmit = (data: PetData) => {
    createPet(data);
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
        <PetItem onSubmit={onSubmit} navigation={navigation} />
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

export default AddPet;
