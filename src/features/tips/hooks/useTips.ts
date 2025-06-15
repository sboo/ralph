import { Assessment } from '@/core/database';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { tipConfigurations } from '../config/tipConfigurations';

import { Tip, TipCategory, TipList, TipTranslation } from '../types';

const useTips = () => {
  const {t} = useTranslation();
  
  /**
   * Process tip configurations with translations for the given pet species
   */
  const getTips = useCallback(
    (petSpecies: string) => {
      // Get translations for each category
      const categoryTranslations: Record<string, TipTranslation[]> = {
        hurt: t(`${petSpecies}:tips:hurt`, { returnObjects: true }) as TipTranslation[],
        hunger: t(`${petSpecies}:tips:hunger`, { returnObjects: true }) as TipTranslation[],
        hydration: t(`${petSpecies}:tips:hydration`, { returnObjects: true }) as TipTranslation[],
        hygiene: t(`${petSpecies}:tips:hygiene`, { returnObjects: true }) as TipTranslation[],
        happiness: t(`${petSpecies}:tips:happiness`, { returnObjects: true }) as TipTranslation[],
        mobility: t(`${petSpecies}:tips:mobility`, { returnObjects: true }) as TipTranslation[],
        encouragement: t(`${petSpecies}:tips:encouragement`, { returnObjects: true }) as TipTranslation[],
      };
      
      // Process all categories except encouragement, which has a special structure
      const processedCategories = ['hurt', 'hunger', 'hydration', 'hygiene', 'happiness', 'mobility'] as const;
      
      // Create the results object with the same structure as before
      const result = {} as TipList;
      
      // Process regular categories (with showWhen array)
      processedCategories.forEach(category => {
        result[category] = tipConfigurations[category].map(tipConfig => {
          const translations = categoryTranslations[category];
          
          return {
            ...tipConfig,
            title: translations[tipConfig.translationKey].title,
            text: translations[tipConfig.translationKey].text,
            // Ensure the property is present (even if empty) to match original structure
            showWhenCategories: (tipConfig.showWhenCategories || {}) as {[key in TipCategory]: number},
          };
        });
      });
      
      // Process encouragement tips separately (they have showWhenCategories instead of showWhen)
      result.encouragement = tipConfigurations.encouragement.map(tipConfig => {
        const translations = categoryTranslations.encouragement;
        
        return {
          ...tipConfig,
          title: translations[tipConfig.translationKey].title,
          text: translations[tipConfig.translationKey].text,
          // Ensure the property is present (even if empty) to match original structure
          showWhen: tipConfig.showWhen || [],
        };
      });
      
      return result as TipList;
    },
    [t],
  );

  const getAllTips = useCallback(
    (petSpecies: string) => {
      if (petSpecies === 'other') {
        return [];
      }
      const tips = getTips(petSpecies);
      const allTips: Tip[] = Object.values(tips).flat();
      return allTips;
    },
    [getTips],
  );

  /**
   * Returns tips that are relevant to the current assessment values
   */
  const getTipsForAssessment = useCallback(
    (petSpecies: string, assessment: Assessment) => {
      if (petSpecies === 'other') {
        return [];
      }
      
      const tips = getTips(petSpecies);
      const categories = ['hurt', 'hunger', 'hydration', 'hygiene', 'happiness', 'mobility'] as const;
      
      // Filter regular tips that use showWhen
      const regularTips = categories.flatMap(category => 
        tips[category].filter(tip => tip.showWhen?.includes(assessment[category]))
      );
      
      // Filter encouragement tips (they use showWhenCategories with a different logic)
      const encouragementTips = tips.encouragement.filter(tip => {
        const showWhenCategories = tip.showWhenCategories;
        return Object.entries(showWhenCategories ?? {}).every(([category, requiredValue]) => 
          assessment[category as keyof typeof assessment] >= requiredValue
        );
      });
      
      return [...regularTips, ...encouragementTips];
    },
    [getTips],
  );

  return {getTipsForAssessment, getAllTips};
};

export default useTips;
