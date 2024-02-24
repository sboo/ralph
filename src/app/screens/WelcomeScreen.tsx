import React, {useState} from 'react';
import {View, Text, TextInput, Button, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../../support/storageKeys';
import {NavigationProp, ParamListBase} from '@react-navigation/native';

interface Props {
  navigation: NavigationProp<ParamListBase>;
}

const WelcomeScreen: React.FC<Props> = ({navigation}) => {
  const [petName, setPetName] = useState<string>('');

  const storeDogInfo = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PET_NAME, petName);
      // Navigate to the next screen after successful storage
      navigation.navigate('Home');
    } catch (error) {
      // Error saving data
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Welcome to Dog's Quality of Life Tracker!
      </Text>
      <TextInput
        placeholder="Enter your pet's name"
        value={petName}
        onChangeText={(text: string) => setPetName(text)}
        style={styles.input}
      />
      <Button title="Continue" onPress={storeDogInfo} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
});

export default WelcomeScreen;
