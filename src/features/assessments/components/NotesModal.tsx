import {t} from 'i18next';
import React, {useEffect, useState} from 'react';
import {Button, Modal, Portal, Text, TextInput} from 'react-native-paper';
import {KeyboardAvoidingView, StyleSheet, View} from 'react-native';

interface Props {
  petName: string;
  notes?: string;
  modalVisible: boolean;
  onEditNotes: (text?: string) => void;
  onCancel: () => void;
}

const NotesModal: React.FC<Props> = ({
  petName,
  notes,
  modalVisible,
  onCancel,
  onEditNotes,
}) => {
  const [tempNotes, setTempNotes] = useState<string | undefined>(notes);

  const handleEditNotes = () => {
    onEditNotes(tempNotes);
  };

  return (
    <Portal>
      <Modal visible={modalVisible} contentContainerStyle={styles.modal}>
        <Text variant={'titleLarge'}>{t('measurements:notes')}</Text>
        <Text style={styles.info}>
          {t('measurements:notesInfo', {petName})}:
        </Text>
        <View style={{paddingHorizontal: 20, marginBottom: 20}}>
          <TextInput
            defaultValue={tempNotes}
            mode="outlined"
            onChangeText={text => setTempNotes(text)}
            multiline
            style={styles.textInput}
          />
        </View>
        <View style={styles.buttons}>
          <Button onPress={onCancel} mode={'contained-tonal'}>
            {t('buttons:cancel')}
          </Button>
          <Button onPress={handleEditNotes} mode={'contained'}>
            {t('buttons:add')}
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
  textInput: {
    height: 120,
  },
});

export default NotesModal;
