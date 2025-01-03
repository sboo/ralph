import {Measurement} from '@/app/models/Measurement';
import {Pet} from '@/app/models/Pet';
import {useQuery, useRealm} from '@realm/react';
import moment from 'moment';
import * as RNFS from '@dr.pogodin/react-native-fs';

import {useMemo} from 'react';
import {Platform} from 'react-native';
import { getImageFilename, getImagePath } from '@/support/helpers/ImageHelper';
import { t, use } from 'i18next';

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

  const assessmentsWithNotes = useMemo(() => {
    if (!pet) {
      return null;
    }
    return _assessments
    .filtered('petId = $0', pet._id)
    .filtered('notes != null')
    .sorted('createdAt', true);
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
    const newImages = images.filter(
      image => !assessmentImages?.includes(getImageFilename(image)),
    );

    const deletedImages = assessmentImages?.filter(
      image => !images.includes(getImagePath(image, true)),
    );

    if (deletedImages) {
      await Promise.allSettled(
        deletedImages.map(async image => {
          const imagePath = getImagePath(image);
          const exists = await RNFS.exists(imagePath);
          if (exists) {
            await RNFS.unlink(imagePath);
          }
        }),
      );
    }

    await Promise.allSettled(
      newImages.map(async image => {
        const filename = `${Date.now()}_${image.split('/').pop()}`;
        const path = getImagePath(filename);
        await RNFS.moveFile(image, path);
        const idx = images.findIndex(img => img === image);
        images[idx] = path;
      }),
    );

    return images.map(image => getImageFilename(image));
  };

  return {assessments, lastAssessments, assessmentsWithNotes, addAssessment, editAssessment};
};

export default useAssessments;
