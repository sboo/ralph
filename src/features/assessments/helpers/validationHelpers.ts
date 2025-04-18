/**
 * Assessment validation utility functions
 */

/**
 * Checks if all required metrics for an assessment are filled
 * 
 * @param metrics Object containing the required assessment metrics
 * @returns boolean indicating if all required metrics are provided
 */
export const areMetricsFilled = (metrics: {
  hurt?: number;
  hunger?: number;
  hydration?: number;
  hygiene?: number;
  happiness?: number;
  mobility?: number;
}): boolean => {
  return !(
    metrics.hurt === undefined ||
    metrics.hunger === undefined ||
    metrics.hydration === undefined ||
    metrics.hygiene === undefined ||
    metrics.happiness === undefined ||
    metrics.mobility === undefined
  );
};

/**
 * Checks if assessment has notes or images
 * 
 * @param notes Optional notes text
 * @param images Optional array of image paths
 * @returns boolean indicating if the assessment has notes or images
 */
export const hasNotesOrImages = (
  notes?: string,
  images?: string[]
): boolean => {
  return (!!notes && notes.trim().length > 0) || (!!images && images.length > 0);
};