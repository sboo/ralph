import {Measurement} from '@/app/models/Measurement';
import {Pet} from '@/app/models/Pet';
import {useQuery, useRealm} from '@realm/react';
import moment from 'moment';
import * as RNFS from '@dr.pogodin/react-native-fs';

import {useMemo} from 'react';
import {Platform} from 'react-native';

export interface AssessmentData {
  date: Date;
  hurt: number;
  hunger: number;
  hydration: number;
  hygiene: number;
  happiness: number;
  mobility: number;
  notes?: string;
  images?: string[];
}

const useAssessments = (pet?: Pet) => {
  const realm = useRealm();
  const _assessments = useQuery(Measurement);

  const assessments = useMemo(() => {
    if (!pet) {
      return null;
    }
    return _assessments.filtered('petId = $0', pet._id).sorted('createdAt');
  }, [_assessments, pet]);

  const lastAssessments = useMemo(() => {
    if (!pet) {
      return null;
    }
    return _assessments
      .filtered('petId= $0', pet._id)
      .sorted('createdAt', true);
  }, [_assessments, pet]);

  const calculateScore = (assessmentData: AssessmentData) => {
    return (
      assessmentData.hurt +
      assessmentData.hunger +
      assessmentData.hydration +
      assessmentData.hygiene +
      assessmentData.happiness +
      assessmentData.mobility
    );
  };

  const addAssessment = async (assessmentData: AssessmentData) => {
    if (!pet) {
      return;
    }
    const noteImages = await storeImages(assessmentData.images);

    realm.write(() => {
      const dateString = moment(assessmentData.date).format('YYYY-MM-DD');
      realm.create(Measurement, {
        date: dateString,
        score: calculateScore(assessmentData),
        hurt: assessmentData.hurt,
        hunger: assessmentData.hunger,
        hydration: assessmentData.hydration,
        hygiene: assessmentData.hygiene,
        happiness: assessmentData.happiness,
        mobility: assessmentData.mobility,
        createdAt: assessmentData.date,
        petId: pet._id,
        notes: assessmentData.notes,
        images: noteImages,
      });
    });
  };

  const editAssessment = async (
    assessment: Measurement,
    assessmentData: AssessmentData,
  ) => {
    const noteImages = await storeImages(
      assessmentData.images,
      Array.from(assessment.images ?? []),
    );

    realm.write(() => {
      assessment.score = calculateScore(assessmentData);
      assessment.hurt = assessmentData.hurt;
      assessment.hunger = assessmentData.hunger;
      assessment.hydration = assessmentData.hydration;
      assessment.hygiene = assessmentData.hygiene;
      assessment.happiness = assessmentData.happiness;
      assessment.mobility = assessmentData.mobility;
      assessment.notes = assessmentData.notes;
      assessment.images = noteImages as any; //this cast is necessary because Realm.List is not compatible with string[], but Realm will handle it
    });
  };

  const storeImages = async (
    images: string[] = [],
    assessmentImages?: string[],
  ) => {
    const newImages = images?.filter(
      image => !assessmentImages?.includes(image),
    );
    const deletedImages = assessmentImages?.filter(
      image => !images?.includes(image),
    );
    if (deletedImages) {
      await Promise.allSettled(
        deletedImages?.map(async image => {
          const exists = await RNFS.exists(image);
          if (exists) {
            await RNFS.unlink(image);
          }
        }),
      );
    }
    await Promise.allSettled(
      newImages.map(async image => {
        const path = getImageFilePath(image);
        await RNFS.moveFile(image, path);
        const idx = images?.findIndex(img => img === image);
        images[idx] = path;
      }),
    );
    return images;
  };

  const getImageFilePath = (
    imagePath: string,
    addAndroidFilePrepend = false,
  ) => {
    const filename = `${Date.now()}_${imagePath.split('/').pop()}`;
    const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
    if (Platform.OS === 'android' && addAndroidFilePrepend) {
      return `file://${path}`;
    }
    return path;
  };

  return {assessments, lastAssessments, addAssessment, editAssessment};
};

export default useAssessments;
