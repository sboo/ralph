import * as ImagePicker from 'expo-image-picker';
import { t } from 'i18next';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import {
  Button,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

interface Props {
  petName: string;
  notes?: string;
  images?: string[];
  modalVisible: boolean;
  onEditNotes: (text?: string, images?: string[]) => void;
  onCancel: () => void;
}

const NotesModal: React.FC<Props> = ({
  petName,
  notes,
  images,
  modalVisible,
  onCancel,
  onEditNotes,
}) => {
  const theme = useTheme();
  const [tempNotes, setTempNotes] = useState<string | undefined>(notes);
  const [tempImages, setTempImages] = useState<string[]>(images ?? []);

  const handleCancel = () => {
    setTempNotes(notes);
    setTempImages(images ?? []);
    onCancel();
  };

  const handleEditNotes = () => {
    onEditNotes(tempNotes, tempImages);
  };

  const openImagePicker = () => {
    console.log('Opening image picker...');
    ImagePicker.launchImageLibraryAsync({
      aspect: [1, 1],
      mediaTypes: ['images'],
      allowsEditing: true,
    })
      .then(image => {
        setTempImages([...tempImages, image.assets?.[0]?.uri ?? '']);
      })
      .catch(err => {
        console.log('Error while picking image: ', err);
      });
  };

  const removeImage = (index: number) => {
    const newImages = tempImages.filter((_, i) => i !== index);
    setTempImages(newImages);
  };

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="fade"
      navigationBarTranslucent
      statusBarTranslucent
      onRequestClose={handleCancel}>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={'padding'}
          style={styles.keyboardAvoidingContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <Text variant={'titleLarge'}>{t('measurements:notes')}</Text>
              <Text style={styles.info}>
                {t('measurements:notesInfo', {petName})}:
              </Text>
              <View style={styles.formContainer}>
                <TextInput
                  defaultValue={tempNotes}
                  mode="outlined"
                  onChangeText={text => setTempNotes(text)}
                  multiline
                  style={{
                    backgroundColor: theme.colors.surfaceVariant,
                    ...styles.textInput,
                  }}
                />
                <View style={styles.imagesHolder}>
                  {tempImages.map((image, index) => {
                    const path = (Platform.OS === 'android' ? 'file://' : '') + image;
                    return (
                      <View style={styles.imageHolder} key={index}>
                        <Image source={{uri: path}} style={styles.image} />
                        <IconButton
                          style={styles.deleteIcon}
                          icon="minus-circle"
                          size={20}
                          mode={'contained'}
                          iconColor={theme.colors.error}
                          containerColor={'transparent'}
                          onPress={() => removeImage(index)}
                        />
                      </View>
                    );
                  })}
                  {tempImages.length < 3 ? (
                    <IconButton
                      icon="image-plus"
                      size={20}
                      style={styles.addImageButton}
                      onPress={openImagePicker}
                    />
                  ) : null}
                </View>
              </View>
              <View style={styles.buttons}>
                <Button 
                  onPress={handleCancel} 
                  mode={'contained-tonal'}
                  style={styles.button}
                >
                  {t('buttons:cancel')}
                </Button>
                <Button 
                  onPress={handleEditNotes} 
                  mode={'contained'}
                  style={styles.button}
                >
                  {t('buttons:save')}
                </Button>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  keyboardAvoidingContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 15,
  },
  scrollContent: {
    padding: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10, // Add some gap between buttons
  },
  button: {
    flex: 1, // Make each button take equal space
  },
  info: {
    fontSize: 14,
    fontWeight: 'normal',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  formContainer: {
    marginBottom: 20,
  },
  textInput: {
    height: 120,
  },
  imagesHolder: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  imageHolder: {
    position: 'relative',
  },
  deleteIcon: {
    position: 'absolute',
    top: -25,
    right: -25,
  },
  image: {
    width: 50,
    height: 50,
    alignSelf: 'center',
    borderRadius: 5,
  },
  addImageButton: {
    alignSelf: 'center',
  },
});

export default NotesModal;