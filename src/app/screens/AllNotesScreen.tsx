import useAssessments from '@/features/assessments/hooks/useAssessments';
import usePet from '@/features/pets/hooks/usePet';
import { getImagePath } from '@/support/helpers/ImageHelper';
import moment from 'moment';
import React, { useMemo, useState } from 'react';
import { StyleSheet, SafeAreaView, ScrollView, Image, View, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Card, Icon, IconButton, Text, useTheme } from 'react-native-paper';
import ImageView from 'react-native-image-viewing';
import { Measurement } from '../models/Measurement';
import { ImageSource } from 'react-native-image-viewing/dist/@types';
import { AllNotesNavigationProps } from '@/features/navigation/types';


const AllNotesScreen: React.FC<AllNotesNavigationProps> = ({ navigation }) => {

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
                                                assessmentId: assessment._id.toHexString(),
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

export default AllNotesScreen;

