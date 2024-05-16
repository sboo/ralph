import {t} from 'i18next';
import React, {useState} from 'react';
import {
  Button,
  IconButton,
  Modal,
  Portal,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import {Image, Platform, StyleSheet, View} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';

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
    ImagePicker.openPicker({
      width: 500,
      height: 500,
      mediaType: 'photo',
      cropping: true,
    }).then(image => {
      setTempImages([...tempImages, image.path]);
    });
  };

  const removeImage = (index: number) => {
    const newImages = tempImages.filter((_, i) => i !== index);
    setTempImages(newImages);
  };

  return (
    <Portal>
      <Modal visible={modalVisible} contentContainerStyle={styles.modal}>
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
            style={styles.textInput}
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
          <Button onPress={handleCancel} mode={'contained-tonal'}>
            {t('buttons:cancel')}
          </Button>
          <Button onPress={handleEditNotes} mode={'contained'}>
            {t('buttons:save')}
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 15,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  info: {
    fontSize: 14,
    fontWeight: 'normal',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  formContainer: {
    paddingHorizontal: 20,
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
