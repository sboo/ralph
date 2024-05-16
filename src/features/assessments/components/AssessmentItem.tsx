import React, {RefObject, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Image, Platform, ScrollView, StyleSheet, View} from 'react-native';
import {Button, Divider, Text} from 'react-native-paper';
import RatingSlider from '@/support/components/RatingSlider';
import {Measurement} from '@/app/models/Measurement.ts';
import NotesModal from './NotesModal';

interface Props {
  petName: string;
  petSpecies: string;
  date: Date;
  assessment?: Measurement | null;
  onCancel: () => void;
  onSubmit: (
    hurt: number,
    hunger: number,
    hydration: number,
    hygiene: number,
    happiness: number,
    mobility: number,
    notes?: string,
    images?: string[],
  ) => void;
}

const AssessmentItem: React.FC<Props> = ({
  petName,
  petSpecies,
  date,
  onSubmit,
  onCancel,
  assessment: measurement,
}) => {
  const {t} = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [hurt, setHurt] = useState<number | undefined>(measurement?.hurt);
  const [hunger, setHunger] = useState<number | undefined>(measurement?.hunger);
  const [hydration, setHydration] = useState<number | undefined>(
    measurement?.hydration,
  );
  const [hygiene, setHygiene] = useState<number | undefined>(
    measurement?.hygiene,
  );
  const [happiness, setHappiness] = useState<number | undefined>(
    measurement?.happiness,
  );
  const [mobility, setMoboility] = useState<number | undefined>(
    measurement?.mobility,
  );
  const [notes, setNotes] = useState<string | undefined>(measurement?.notes);
  const [images, setImages] = useState<string[] | undefined>(
    Array.from(measurement?.images ?? []),
  );

  const scrollViewRef = useRef<ScrollView>();

  const areMetricsFilled = !(
    hurt === undefined ||
    hunger === undefined ||
    hydration === undefined ||
    hygiene === undefined ||
    happiness === undefined ||
    mobility === undefined
  );

  const addNotesFromModal = (text?: string, noteImages?: string[]) => {
    setNotes(text);
    setImages(noteImages);
    setModalVisible(false);
    scrollViewRef.current?.scrollToEnd({animated: true});
  };

  const _onSubmit = () => {
    if (!areMetricsFilled) {
      return;
    }

    onSubmit(
      hurt,
      hunger,
      hydration,
      hygiene,
      happiness,
      mobility,
      notes,
      images,
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      ref={scrollViewRef as RefObject<ScrollView> | null}>
      <Text variant={'titleSmall'} style={styles.date}>
        {t('date')}: {date.toLocaleDateString()}
      </Text>
      <Text variant={'bodyLarge'} style={styles.intro}>
        {t('measurements:intro', {petName})}
      </Text>
      <Text style={styles.label}>{t(`${petSpecies}:assessments:hurt`)}</Text>
      <Text style={styles.info}>
        {t(`${petSpecies}:assessments:hurtInfo`, {petName})}
      </Text>
      <RatingSlider
        onRatingChange={value => setHurt(value)}
        initialRating={hurt}
        optionTexts={t(`${petSpecies}:assessments:hurtOptions`, {
          returnObjects: true,
          petName,
        })}
      />

      <Text style={styles.label}>{t(`${petSpecies}:assessments:hunger`)}</Text>
      <Text style={styles.info}>
        {t(`${petSpecies}:assessments:hungerInfo`, {petName})}
      </Text>
      <RatingSlider
        onRatingChange={value => setHunger(value)}
        initialRating={hunger}
        optionTexts={t(`${petSpecies}:assessments:hungerOptions`, {
          returnObjects: true,
          petName,
        })}
      />
      <Text style={styles.label}>
        {t(`${petSpecies}:assessments:hydration`)}
      </Text>
      <Text style={styles.info}>
        {t(`${petSpecies}:assessments:hydrationInfo`, {petName})}
      </Text>
      <RatingSlider
        onRatingChange={value => setHydration(value)}
        initialRating={hydration}
        optionTexts={t(`${petSpecies}:assessments:hydrationOptions`, {
          returnObjects: true,
          petName,
        })}
      />
      <Text style={styles.label}>{t(`${petSpecies}:assessments:hygiene`)}</Text>
      <Text style={styles.info}>
        {t(`${petSpecies}:assessments:hygieneInfo`, {petName})}
      </Text>
      <RatingSlider
        onRatingChange={value => setHygiene(value)}
        initialRating={hygiene}
        optionTexts={t(`${petSpecies}:assessments:hygieneOptions`, {
          returnObjects: true,
          petName,
        })}
      />
      <Text style={styles.label}>
        {t(`${petSpecies}:assessments:happiness`)}
      </Text>
      <Text style={styles.info}>
        {t(`${petSpecies}:assessments:happinessInfo`, {petName})}
      </Text>
      <RatingSlider
        onRatingChange={value => setHappiness(value)}
        initialRating={happiness}
        optionTexts={t(`${petSpecies}:assessments:happinessOptions`, {
          returnObjects: true,
          petName,
        })}
      />
      <Text style={styles.label}>
        {t(`${petSpecies}:assessments:mobility`)}
      </Text>
      <Text style={styles.info}>
        {t(`${petSpecies}:assessments:mobilityInfo`, {petName})}
      </Text>
      <RatingSlider
        onRatingChange={value => setMoboility(value)}
        initialRating={mobility}
        optionTexts={t(`${petSpecies}:assessments:mobilityOptions`, {
          returnObjects: true,
          petName,
        })}
      />
      <Divider style={styles.divider} />
      <View style={styles.notesHolder}>
        {!notes ? null : (
          <Text style={styles.notesText} variant={'bodySmall'}>
            {notes}
          </Text>
        )}
        <View style={styles.imagesHolder}>
          {images?.map((image, index) => {
            const path = (Platform.OS === 'android' ? 'file://' : '') + image;
            return (
              <Image key={index} source={{uri: path}} style={styles.image} />
            );
          })}
        </View>
        <Button
          onPress={() => setModalVisible(true)}
          icon={!notes ? 'note-plus' : 'note-edit'}
          mode={'contained-tonal'}
          style={styles.notesButton}>
          {t('measurements:notes')}
        </Button>
      </View>
      <NotesModal
        petName={petName}
        notes={notes}
        images={images}
        modalVisible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onEditNotes={addNotesFromModal}
      />
      <Divider style={styles.divider} />
      <View style={styles.buttons}>
        <Button onPress={onCancel} mode={'outlined'} icon={'chevron-left'}>
          {t('buttons:back')}
        </Button>
        <Button
          disabled={!areMetricsFilled}
          onPress={_onSubmit}
          mode={'contained'}>
          {t('buttons:submit')}
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {},
  date: {
    marginBottom: 20,
  },
  intro: {
    marginBottom: 50,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  info: {
    fontSize: 14,
    fontWeight: 'normal',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  slider: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  divider: {
    marginBottom: 20,
  },
  notesHolder: {
    marginBottom: 20,
    display: 'flex',
    flexDirection: 'column',
  },
  notesText: {
    paddingHorizontal: 20,
  },
  notesButton: {
    alignSelf: 'center',
  },
  imagesHolder: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  image: {
    width: 50,
    height: 50,
    alignSelf: 'center',
    borderRadius: 5,
  },
});

export default AssessmentItem;
