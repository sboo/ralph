import { getImagePath } from '@/support/helpers/ImageHelper';
import moment from 'moment';
import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, ScrollView, Image, View, TouchableOpacity } from 'react-native';
import { Card, IconButton, Text, useTheme } from 'react-native-paper';
import ImageView from 'react-native-image-viewing';
import { ImageSource } from 'react-native-image-viewing/dist/@types';
import { AllNotesNavigationProps } from '@/features/navigation/types';
import { withObservables } from '@nozbe/watermelondb/react';
import { database } from '@/app/database';
import { Q } from '@nozbe/watermelondb';
import { Pet } from '@/app/database/models/Pet';
import { Assessment } from '@/app/database/models/Assessment';
import { map, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

// The presentational component
const AllNotesScreenComponent: React.FC<AllNotesNavigationProps & {
  activePet: Pet | undefined,
  assessmentsWithNotes: Assessment[]
}> = ({ 
  navigation,
  activePet,
  assessmentsWithNotes
}) => {
    const theme = useTheme();
    const [imagesList, setImagesList] = useState<ImageSource[]>();
    const [imageViewerVisible, setImageViewerVisible] = useState(false);
    const [clickedImage, setClickedImage] = useState<number>(0);

    const updateImagesList = (assessment: Assessment) => {
        return assessment.images?.map(image => {
            return { uri: getImagePath(image, true) };
        });
    }

    const openImageViewer = (index: number) => {
        setClickedImage(index);
        setImageViewerVisible(true);
    }

    return (
        <SafeAreaView
            style={{
                backgroundColor: theme.colors.primaryContainer,
                ...styles.container,
            }}>
                <ScrollView style={styles.scrollview}>
                    {assessmentsWithNotes?.map((assessment, index) => (
                        <View key={index}>
                            <Card
                                style={{ ...styles.card, backgroundColor: theme.colors.surface }}
                                mode='contained'
                            >
                                <Card.Content>
                                    <View style={styles.title}>
                                        <Text variant='labelSmall' style={styles.date}>{moment(assessment.date).toDate().toLocaleDateString(undefined, {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}</Text>
                                        <IconButton size={14} icon='pencil'
                                            onPress={() => navigation.navigate('EditAssessment', {
                                                assessmentId: assessment.id,
                                                scrollToNotes: true,
                                            })}
                                        />
                                    </View>
                                    <Text variant='bodyMedium' style={styles.note}>{assessment.notes}</Text>
                                    <View style={styles.imagesHolder}>
                                        {assessment.images ? (
                                            assessment.images.map((image: string) => (
                                                <TouchableOpacity key={image}
                                                    onPress={() => {
                                                        setImagesList(updateImagesList(assessment));
                                                        openImageViewer(assessment.images?.indexOf(image) ?? 0);
                                                    }}>
                                                    <Image
                                                        source={{ uri: getImagePath(image, true) }}
                                                        style={styles.image} />
                                                </TouchableOpacity>
                                            ))
                                        ) : null}
                                    </View>
                                </Card.Content>
                            </Card>
                        </View>
                    ))}
                </ScrollView>
                <ImageView
                    images={imagesList ?? []}
                    imageIndex={clickedImage}
                    visible={imageViewerVisible}
                    onRequestClose={() => setImageViewerVisible(false)}
                />
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
  scrollview: {
      flex: 1,
      paddingHorizontal: 20,
  },
  title: { 
      display: 'flex', 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center'
  },
  date: {
      marginBottom: 5,
  },
  card: {
      marginBottom: 20,
  },
  note: {
      marginBottom: 10,
      marginRight: 10,
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

// Connect the component with WatermelonDB observables
const enhance = withObservables([], () => {
  // Get active pet
  const activePetObservable = database
    .get<Pet>('pets')
    .query(Q.where('is_active', true))
    .observe()
    .pipe(map(pets => pets.length > 0 ? pets[0] : undefined));

  // Create assessments with notes observable that depends on the active pet
  const assessmentsWithNotesObservable = activePetObservable.pipe(
    switchMap(pet => {
      if (!pet) {
        return new Observable<Assessment[]>(subscriber => subscriber.next([]));
      }
      return database
        .get<Assessment>('assessments')
        .query(
          Q.where('pet_id', pet.id),
          Q.where('notes', Q.notEq(null)),
          Q.sortBy('date', 'desc') 
        )
        .observe();
    })
  );

  return {
    activePet: activePetObservable,
    assessmentsWithNotes: assessmentsWithNotesObservable
  };
});

// Export the enhanced component
export default enhance(AllNotesScreenComponent);

