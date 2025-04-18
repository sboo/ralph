import { Assessment } from '@/core/database';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { tipConfigurations } from '../config/tipConfigurations';

interface TipTranslation {
  title: string;
  text: string;
}

export interface Tip {
  index: number;
  category: TipCategory;
  type: TipType;
  showWhen: number[];
  showWhenCategories: {[key in TipCategory]: number};
  title: string;
  text: string;
}

interface TipList {
  hurt: Tip[];
  hunger: Tip[];
  hydration: Tip[];
  hygiene: Tip[];
  happiness: Tip[];
  mobility: Tip[];
  encouragement: Tip[];
}

export enum TipCategory {
  hurt = 'hurt',
  hunger = 'hunger',
  hydration = 'hydration',
  hygiene = 'hygiene',
  happiness = 'happiness',
  mobility = 'mobility',
  encouragement = 'encouragement',
}

export enum TipType {
  help = 'help',
  encouragement = 'encouragement',
}

const useTips = () => {
  const {t} = useTranslation();
  
  /**
   * Process tip configurations with translations for the given pet species
   */
  const getTips = useCallback(
    (petSpecies: string) => {
      // Get translations for each category
      const categoryTranslations: Record<string, TipTranslation[]> = {
        hurt: t(`${petSpecies}:tips:hurt`, { returnObjects: true }),
        hunger: t(`${petSpecies}:tips:hunger`, { returnObjects: true }),
        hydration: t(`${petSpecies}:tips:hydration`, { returnObjects: true }),
        hygiene: t(`${petSpecies}:tips:hygiene`, { returnObjects: true }),
        happiness: t(`${petSpecies}:tips:happiness`, { returnObjects: true }),
        mobility: t(`${petSpecies}:tips:mobility`, { returnObjects: true }),
        encouragement: t(`${petSpecies}:tips:encouragement`, { returnObjects: true }),
      };
      
      // Process all categories except encouragement, which has a special structure
      const processedCategories = ['hurt', 'hunger', 'hydration', 'hygiene', 'happiness', 'mobility'] as const;
      
      // Create the results object with the same structure as before
      const result = {} as TipList;
      
      // Process regular categories (with showWhen array)
      processedCategories.forEach(category => {
        result[category] = tipConfigurations[category].map(tipConfig => {
          const translations = categoryTranslations[category];
          // Handle special case where a tip uses translations from a different category
          const translationSource = tipConfig.useHungerTranslation ? 
                                    categoryTranslations.hunger : 
                                    translations;
          
          return {
            ...tipConfig,
            title: translationSource[tipConfig.translationKey].title,
            text: translationSource[tipConfig.translationKey].text,
            // Ensure the property is present (even if empty) to match original structure
            showWhenCategories: (tipConfig.showWhenCategories || {}) as {[key in TipCategory]: number},
          };
        });
      });
      
      // Process encouragement tips separately (they have showWhenCategories instead of showWhen)
      result.encouragement = tipConfigurations.encouragement.map(tipConfig => {
        const translations = tipConfig.useHungerTranslation ? 
                             categoryTranslations.hunger : 
                             categoryTranslations.encouragement;
        
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
        tips[category].filter(tip => tip.showWhen.includes(assessment[category]))
      );
      
      // Filter encouragement tips (they use showWhenCategories with a different logic)
      const encouragementTips = tips.encouragement.filter(tip => {
        const showWhenCategories = tip.showWhenCategories;
        return Object.entries(showWhenCategories).every(([category, requiredValue]) => 
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
