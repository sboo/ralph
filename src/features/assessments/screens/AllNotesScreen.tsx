import { withActivePetAssessments } from '@/core/database/hoc';
import { Assessment } from '@/core/database/models/Assessment';
import { AllNotesNavigationProps } from '@/features/navigation/types';
import { getImagePath } from '@/shared/helpers/ImageHelper';
import { compose } from '@nozbe/watermelondb/react';
import moment from 'moment';
import React, { useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import ImageView from 'react-native-image-viewing';
import { ImageSource } from 'react-native-image-viewing/dist/@types';
import { Card, IconButton, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

// The presentational component
const AllNotesScreenComponent: React.FC<
  AllNotesNavigationProps & {
    assessmentsWithNotes: Assessment[];
  }
> = ({navigation, assessmentsWithNotes}) => {
  const theme = useTheme();
  const [imagesList, setImagesList] = useState<ImageSource[]>();
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [clickedImage, setClickedImage] = useState<number>(0);

  const updateImagesList = (assessment: Assessment) => {
    return assessment.images?.map(image => {
      return {uri: getImagePath(image, true)};
    });
  };

  const openImageViewer = (index: number) => {
    setClickedImage(index);
    setImageViewerVisible(true);
  };

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={{
        backgroundColor: theme.colors.primaryContainer,
        ...styles.container,
      }}>
      <ScrollView style={styles.scrollview}>
        {assessmentsWithNotes?.map((assessment, index) => (
          <View key={assessment.id}>
            <Card
              style={{...styles.card, backgroundColor: theme.colors.surface}}
              mode="contained">
              <Card.Content>
                <View style={styles.title}>
                  <Text variant="labelSmall" style={styles.date}>
                    {moment(assessment.date)
                      .toDate()
                      .toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                  </Text>
                  <IconButton
                    size={14}
                    icon="pencil"
                    onPress={() =>
                      navigation.navigate('EditAssessment', {
                        assessmentId: assessment.id,
                        scrollToNotes: true,
                      })
                    }
                  />
                </View>
                <Text variant="bodyMedium" style={styles.note}>
                  {assessment.notes}
                </Text>
                <View style={styles.imagesHolder}>
                  {assessment.images
                    ? assessment.images.map((image: string) => (
                        <TouchableOpacity
                          key={image}
                          onPress={() => {
                            setImagesList(updateImagesList(assessment));
                            openImageViewer(
                              assessment.images?.indexOf(image) ?? 0,
                            );
                          }}>
                          <Image
                            source={{uri: getImagePath(image, true)}}
                            style={styles.image}
                          />
                        </TouchableOpacity>
                      ))
                    : null}
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
    alignItems: 'center',
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

const enhance = compose(
  withActivePetAssessments({
    sortBy: {column: 'date', direction: 'desc'},
    withNotes: true,
  }),
);

// Export the enhanced component
export default enhance(AllNotesScreenComponent);
