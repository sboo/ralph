import { withActivePetAssessments } from '@/core/database/hoc';
import { Assessment } from '@/core/database/models/Assessment';
import { Pet } from '@/core/database/models/Pet';
import { getImagePath } from '@/shared/helpers/ImageHelper';
import { compose } from '@nozbe/watermelondb/react';
import moment from 'moment';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import ImageView from 'react-native-image-viewing';
import { ImageSource } from 'react-native-image-viewing/dist/@types';
import { Avatar, Card, IconButton, Text, useTheme } from 'react-native-paper';

interface Props {
    onNotePress: (assessmentId: string) => void;
    activePet?: Pet;
    assessments?: Assessment[];
}

// The presentational component
const AllNotesComponent: React.FC<Props> = ({ 
    onNotePress, 
    assessments: assessmentsWithNotes = []
}) => {
    const { t } = useTranslation();
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
    
    if (!assessmentsWithNotes?.length) {
        return (
            <View style={styles.container}>
                <Card
                    style={{ ...styles.card, backgroundColor: theme.colors.surface }}
                    mode='contained'
                >
                    <Card.Content style={styles.noNotesCard}>
                        <Avatar.Icon icon="note-outline" size={50} style={{ backgroundColor: theme.colors.tertiary }} />
                        <Text variant='headlineMedium'>{t('measurements:notes')}</Text>

                        <Text style={styles.noNotes}>{t('measurements:no_notes')}</Text>
                    </Card.Content>
                </Card>
            </View>
        )
    }

    return (
        <View style={styles.container}>
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
                                    onPress={() => onNotePress(assessment.id)}
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
            <ImageView
                images={imagesList ?? []}
                imageIndex={clickedImage}
                visible={imageViewerVisible}
                onRequestClose={() => setImageViewerVisible(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    noNotesCard: {
        flexDirection: 'column',
        gap: 10,
        alignItems: 'center',
        margin: 20,
    },
    noNotes: {
        textAlign: 'center',
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
        sortBy: { column: 'created_at', direction: 'asc' },
        withNotes: true,
      }),
);

// Export the enhanced component
export default enhance(AllNotesComponent);

