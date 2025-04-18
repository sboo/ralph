import { getImageFilename, getImagePath } from "@/shared/helpers/ImageHelper";
import * as RNFS from '@dr.pogodin/react-native-fs';

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


  export const storeImages = async (
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