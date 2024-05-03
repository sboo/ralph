import {Measurement} from '@/app/models/Measurement';
import {Pet} from '@/app/models/Pet';
import {useQuery, useRealm} from '@realm/react';
import moment from 'moment';

import React from 'react';

export interface AssessmentData {
  date: Date;
  hurt: number;
  hunger: number;
  hydration: number;
  hygiene: number;
  happiness: number;
  mobility: number;
}

const useAssessments = (pet?: Pet) => {
  const realm = useRealm();
  const _assessments = useQuery(Measurement);

  const assessments = React.useMemo(() => {
    if (!pet) {
      return null;
    }
    return _assessments.filtered('pet._id = $0', pet._id).sorted('createdAt');
  }, [_assessments, pet]);

  const lastAssessments = React.useMemo(() => {
    if (!pet) {
      return null;
    }
    return _assessments
      .filtered('pet._id = $0', pet._id)
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

  const addAssessment = (assessmentData: AssessmentData) => {
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
        pet: pet,
      });
    });
  };

  const editAssessment = (
    assessment: Measurement,
    assessmentData: AssessmentData,
  ) => {
    realm.write(() => {
      assessment.score = calculateScore(assessmentData);
      assessment.hurt = assessmentData.hurt;
      assessment.hunger = assessmentData.hunger;
      assessment.hydration = assessmentData.hydration;
      assessment.hygiene = assessmentData.hygiene;
      assessment.happiness = assessmentData.happiness;
      assessment.mobility = assessmentData.mobility;
    });
  };

  return {assessments, lastAssessments, addAssessment, editAssessment};
};

export default useAssessments;
