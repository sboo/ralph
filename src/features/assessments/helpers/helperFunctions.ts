
export interface AssessmentData {
    date: string;
    hurt: number;
    hunger: number;
    hydration: number;
    hygiene: number;
    happiness: number;
    mobility: number;
    customValue?: number,
    notes?: string;
    images?: string[];
  }

export const calculateScore = (assessmentData: AssessmentData) => {
    console.log('calculateScore', assessmentData);
    const sum =  (
      assessmentData.hurt +
      assessmentData.hunger +
      assessmentData.hydration +
      assessmentData.hygiene +
      assessmentData.happiness +
      assessmentData.mobility
    );
    if(assessmentData.customValue !== undefined && assessmentData.customValue !== null) {
      return Math.round((sum + assessmentData.customValue) / 7 * 6);
    }
    return sum;
  };