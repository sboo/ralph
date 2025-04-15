import useAssessments from '@/features/assessments/hooks/useAssessments';
import usePet from '@/features/pets/hooks/usePet';
import { getImagePath } from '@/support/helpers/ImageHelper';
import moment from 'moment';
import React, { useMemo, useState } from 'react';
import { StyleSheet, ScrollView, Image, View, TouchableOpacity } from 'react-native';
import { Avatar, Card, Icon, IconButton, Text, useTheme } from 'react-native-paper';
import ImageView from 'react-native-image-viewing';
import { Measurement } from '@/app/models/Measurement';
import { ImageSource } from 'react-native-image-viewing/dist/@types';
import { useTranslation } from 'react-i18next';

interface Props {
    onNotePress: (assessmentId: string) => void;
}

const AllNotes: React.FC<Props> = ({ onNotePress }) => {

    const { t } = useTranslation();
    const theme = useTheme();
    const { activePet } = usePet();
    const { assessmentsWithNotes } = useAssessments(activePet);
    const [imagesList, setImagesList] = useState<ImageSource[]>();
    const [imageViewerVisible, setImageViewerVisible] = useState(false);
    const [clickedImage, setClickedImage] = useState<number>(0);
    
    const updateImagesList = (assessment: Measurement) => {
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
                                    onPress={() => onNotePress(assessment._id.toHexString())}
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

export default AllNotes;

