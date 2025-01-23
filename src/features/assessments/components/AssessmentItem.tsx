import React, { RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Divider, Text } from 'react-native-paper';
import RatingSlider from '@/support/components/RatingSlider';
import { Measurement } from '@/app/models/Measurement.ts';
import NotesModal from './NotesModal';
import { getImagePath } from '@/support/helpers/ImageHelper';
import ImageView from 'react-native-image-viewing';
import RatingButtons from '@/support/components/RatingButtons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/app/store/storageKeys';
import { OptionText } from '@/support/helpers/TooltipHelper';
import { CustomTrackingSettings } from '../helpers/customTracking';

interface Props {
  petName: string;
  petSpecies: string;
  date: Date;
  assessment?: Measurement | null;
  scrollToNotes?: boolean;
  customTracking: CustomTrackingSettings;
  onCancel: () => void;
  onSubmit: (
    hurt: number,
    hunger: number,
    hydration: number,
    hygiene: number,
    happiness: number,
    mobility: number,
    customValue?: number,
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
  customTracking,
  scrollToNotes
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [useRatingButtons, setUseRatingButtons] = React.useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [clickedImage, setClickedImage] = useState<number>(0);
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
  const [mobility, setMobility] = useState<number | undefined>(
    measurement?.mobility,
  );
  const [customValue, setCustomValue] = useState<number | undefined>(
    measurement?.customValue ?? undefined,
  );
  const [notes, setNotes] = useState<string | undefined>(measurement?.notes);
  const [images, setImages] = useState<string[] | undefined>(
    Array.from(measurement?.images ?? []).map(image => {
      return getImagePath(image, true);
    }),
  );

  useEffect(() => {
    const getUseRatingButtons = async () => {
      const useRatingButtons = await AsyncStorage.getItem(STORAGE_KEYS.USE_RATING_BUTTONS);
      setUseRatingButtons(useRatingButtons === 'true');
    }
    getUseRatingButtons().then(() => setLoading(false));
  }, []);

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
    scrollViewRef.current?.scrollToEnd({ animated: true });
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
      customValue,
      notes,
      images,
    );
  };

  const imagesList = useMemo(() => {
    return images?.map(image => {
      return { uri: image };
    });
  }, [images]);

  const openImageViewer = (index: number) => {
    setClickedImage(index);
    setImageViewerVisible(true);
  }

  useEffect(() => {
    if (!loading && scrollToNotes) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [loading, scrollToNotes]);

  const renderCustomTracking = () => {
    if (!customTracking.customTrackingEnabled) {
      return null;
    }
    const optionTexts: OptionText[] = Object.keys(customTracking.customTrackingLabels).map(key => {
      return {
        value: parseFloat(key),
        title: customTracking.customTrackingLabels[key],
        description: ''
      }
    });
    return (
      <>
      <Divider style={styles.divider} />
        <Text style={styles.label}>{customTracking.customTrackingName || t('settings:customTracking')}</Text>
        <Text style={styles.info}>
          {customTracking.customTrackingDescription}
        </Text>
        {useRatingButtons ? (<RatingButtons
          onRatingChange={value => setCustomValue(value)}
          initialRating={customValue}
          optionTexts={optionTexts}
        />) : (<RatingSlider
          onRatingChange={value => setCustomValue(value)}
          initialRating={customValue}
          optionTexts={optionTexts}
        />)}
      </>
    )

  }

  if (loading) {
    return null;
    // (
    //   <View style={styles.loadingContainer}>
    //     <ActivityIndicator size="large" />
    //   </View>
    // );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      ref={scrollViewRef as RefObject<ScrollView> | null}>
      <Text variant={'titleSmall'} style={styles.date}>
        {t('date')}: {date.toLocaleDateString()}
      </Text>
      <Text variant={'bodyLarge'} style={styles.intro}>
        {t('measurements:intro', { petName })}
      </Text>
      <Text style={styles.label}>{t(`${petSpecies}:assessments:hurt`)}</Text>
      <Text style={styles.info}>
        {t(`${petSpecies}:assessments:hurtInfo`, { petName })}
      </Text>
      {useRatingButtons ? (<RatingButtons
        onRatingChange={value => setHurt(value)}
        initialRating={hurt}
        optionTexts={t(`${petSpecies}:assessments:hurtOptions`, {
          returnObjects: true,
          petName,
        }) as OptionText[]}
      />) : (<RatingSlider
        onRatingChange={value => setHurt(value)}
        initialRating={hurt}
        optionTexts={t(`${petSpecies}:assessments:hurtOptions`, {
          returnObjects: true,
          petName,
        }) as OptionText[]}
      />)}

      <Text style={styles.label}>{t(`${petSpecies}:assessments:hunger`)}</Text>
      <Text style={styles.info}>
        {t(`${petSpecies}:assessments:hungerInfo`, { petName })}
      </Text>
      {useRatingButtons ? (
        <RatingButtons
          onRatingChange={value => setHunger(value)}
          initialRating={hunger}
          optionTexts={t(`${petSpecies}:assessments:hungerOptions`, {
            returnObjects: true,
            petName,
          }) as OptionText[]}
        />
      ) : (
        <RatingSlider
          onRatingChange={value => setHunger(value)}
          initialRating={hunger}
          optionTexts={t(`${petSpecies}:assessments:hungerOptions`, {
            returnObjects: true,
            petName,
          }) as OptionText[]}
        />
      )}
      <Text style={styles.label}>
        {t(`${petSpecies}:assessments:hydration`)}
      </Text>
      <Text style={styles.info}>
        {t(`${petSpecies}:assessments:hydrationInfo`, { petName })}
      </Text>
      {useRatingButtons ? (
        <RatingButtons
          onRatingChange={value => setHydration(value)}
          initialRating={hydration}
          optionTexts={t(`${petSpecies}:assessments:hydrationOptions`, {
            returnObjects: true,
            petName,
          }) as OptionText[]}
        />
      ) : (
        <RatingSlider
          onRatingChange={value => setHydration(value)}
          initialRating={hydration}
          optionTexts={t(`${petSpecies}:assessments:hydrationOptions`, {
            returnObjects: true,
            petName,
          }) as OptionText[]}
        />
      )}
      <Text style={styles.label}>{t(`${petSpecies}:assessments:hygiene`)}</Text>
      <Text style={styles.info}>
        {t(`${petSpecies}:assessments:hygieneInfo`, { petName })}
      </Text>
      {useRatingButtons ? (
        <RatingButtons
          onRatingChange={value => setHygiene(value)}
          initialRating={hygiene}
          optionTexts={t(`${petSpecies}:assessments:hygieneOptions`, {
            returnObjects: true,
            petName,
          }) as OptionText[]}
        />
      ) : (
        <RatingSlider
          onRatingChange={value => setHygiene(value)}
          initialRating={hygiene}
          optionTexts={t(`${petSpecies}:assessments:hygieneOptions`, {
            returnObjects: true,
            petName,
          }) as OptionText[]}
        />
      )}
      <Text style={styles.label}>
        {t(`${petSpecies}:assessments:happiness`)}
      </Text>
      <Text style={styles.info}>
        {t(`${petSpecies}:assessments:happinessInfo`, { petName })}
      </Text>
      {useRatingButtons ? (
        <RatingButtons
          onRatingChange={value => setHappiness(value)}
          initialRating={happiness}
          optionTexts={t(`${petSpecies}:assessments:happinessOptions`, {
            returnObjects: true,
            petName,
          }) as OptionText[]}
        />
      ) : (
        <RatingSlider
          onRatingChange={value => setHappiness(value)}
          initialRating={happiness}
          optionTexts={t(`${petSpecies}:assessments:happinessOptions`, {
            returnObjects: true,
            petName,
          }) as OptionText[]}
        />
      )}
      <Text style={styles.label}>
        {t(`${petSpecies}:assessments:mobility`)}
      </Text>
      <Text style={styles.info}>
        {t(`${petSpecies}:assessments:mobilityInfo`, { petName })}
      </Text>
      {useRatingButtons ? (
        <RatingButtons
          onRatingChange={value => setMobility(value)}
          initialRating={mobility}
          optionTexts={t(`${petSpecies}:assessments:mobilityOptions`, {
            returnObjects: true,
            petName,
          }) as OptionText[]}
        />
      ) : (
        <RatingSlider
          onRatingChange={value => setMobility(value)}
          initialRating={mobility}
          optionTexts={t(`${petSpecies}:assessments:mobilityOptions`, {
            returnObjects: true,
            petName,
          }) as OptionText[]}
        />
      )}


      {renderCustomTracking()}


      <Divider style={styles.divider} />
      <View style={styles.notesHolder}>
        <Text style={styles.label}>
          {t('measurements:notes')}
        </Text>
        {!notes ? null : (
          <Text style={styles.notesText} variant={'bodyMedium'}>
            {notes}
          </Text>
        )}
        <View style={styles.imagesHolder}>
          {images?.map((image, index) => {
            const path = (Platform.OS === 'android' ? 'file://' : '') + image;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => openImageViewer(index)}>
                <Image source={{ uri: path }} style={styles.image} />
              </TouchableOpacity>
            );
          })}
        </View>
        <Button
          onPress={() => setModalVisible(true)}
          icon={!notes ? 'note-plus' : 'note-edit'}
          mode={'contained-tonal'}
          style={styles.notesButton}>
          {!notes ? t('measurements:add_note') : t('measurements:edit_note')}
        </Button>
      </View>
      <ImageView
        images={imagesList ?? []}
        imageIndex={clickedImage}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  container: {
    padding: 20,
  },
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
    marginBottom: 10,
  },
  notesButton: {
    alignSelf: 'center',
  },
  imagesHolder: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
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
