import { Assessment } from '@core/database';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

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
  const getTips = useCallback(
    (petSpecies: string) => {
      const hurtTips = t(`${petSpecies}:tips:hurt`, {
        returnObjects: true,
      }) as TipTranslation[];
      const hungerTips = t(`${petSpecies}:tips:hunger`, {
        returnObjects: true,
      }) as TipTranslation[];
      const hydrationTips = t(`${petSpecies}:tips:hydration`, {
        returnObjects: true,
      }) as TipTranslation[];
      const hygieneTips = t(`${petSpecies}:tips:hygiene`, {
        returnObjects: true,
      }) as TipTranslation[];
      const happinessTips = t(`${petSpecies}:tips:happiness`, {
        returnObjects: true,
      }) as TipTranslation[];
      const mobilityTips = t(`${petSpecies}:tips:mobility`, {
        returnObjects: true,
      }) as TipTranslation[];
      const encouragementTips = t(`${petSpecies}:tips:encouragement`, {
        returnObjects: true,
      }) as TipTranslation[];

      return {
        hurt: [
          {
            index: 1,
            category: TipCategory.hurt,
            type: TipType.help,
            showWhen: [2.5, 5, 7.5],
            title: hurtTips[0].title,
            text: hurtTips[0].text,
          },
          {
            index: 2,
            category: TipCategory.hurt,
            type: TipType.help,
            showWhen: [0, 2.5],
            title: hurtTips[1].title,
            text: hurtTips[1].text,
          },
          {
            index: 3,
            category: TipCategory.hurt,
            type: TipType.help,
            showWhen: [2.5, 5],
            title: hurtTips[2].title,
            text: hurtTips[2].text,
          },
          {
            index: 4,
            category: TipCategory.hurt,
            type: TipType.help,
            showWhen: [2.5],
            title: hurtTips[3].title,
            text: hurtTips[3].text,
          },
          {
            index: 5,
            category: TipCategory.hurt,
            type: TipType.help,
            showWhen: [2.5],
            title: hurtTips[4].title,
            text: hurtTips[4].text,
          },
        ],
        hunger: [
          {
            index: 1,
            category: TipCategory.hunger,
            type: TipType.help,
            showWhen: [2.5],
            title: hungerTips[0].title,
            text: hungerTips[0].text,
          },
          {
            index: 2,
            category: TipCategory.hunger,
            type: TipType.help,
            showWhen: [0, 2.5, 5],
            title: hungerTips[1].title,
            text: hungerTips[1].text,
          },
          {
            index: 3,
            category: TipCategory.hunger,
            type: TipType.help,
            showWhen: [5],
            title: hungerTips[2].title,
            text: hungerTips[2].text,
          },
          {
            index: 4,
            category: TipCategory.hunger,
            type: TipType.help,
            showWhen: [2.5],
            title: hungerTips[3].title,
            text: hungerTips[3].text,
          },
          {
            index: 5,
            category: TipCategory.hunger,
            type: TipType.help,
            showWhen: [7.5],
            title: hungerTips[4].title,
            text: hungerTips[4].text,
          },
          {
            index: 6,
            category: TipCategory.hunger,
            type: TipType.help,
            showWhen: [5],
            title: hungerTips[5].title,
            text: hungerTips[5].text,
          },
          {
            index: 7,
            category: TipCategory.hunger,
            type: TipType.help,
            showWhen: [7.5],
            title: hungerTips[6].title,
            text: hungerTips[6].text,
          },
          {
            index: 8,
            category: TipCategory.hunger,
            type: TipType.help,
            showWhen: [0],
            title: hungerTips[7].title,
            text: hungerTips[7].text,
          },
        ],
        hydration: [
          {
            index: 1,
            category: TipCategory.hydration,
            type: TipType.help,
            showWhen: [2.5, 5, 7.5],
            title: hydrationTips[0].title,
            text: hydrationTips[0].text,
          },
          {
            index: 2,
            category: TipCategory.hydration,
            type: TipType.help,
            showWhen: [0, 2.5],
            title: hydrationTips[1].title,
            text: hydrationTips[1].text,
          },
          {
            index: 3,
            category: TipCategory.hydration,
            type: TipType.help,
            showWhen: [0, 5],
            title: hungerTips[2].title,
            text: hungerTips[2].text,
          },
          {
            index: 4,
            category: TipCategory.hydration,
            type: TipType.help,
            showWhen: [2.5, 7.5],
            title: hydrationTips[3].title,
            text: hydrationTips[3].text,
          },
          {
            index: 5,
            category: TipCategory.hydration,
            type: TipType.help,
            showWhen: [0],
            title: hydrationTips[4].title,
            text: hydrationTips[4].text,
          },
        ],
        hygiene: [
          {
            index: 1,
            category: TipCategory.hygiene,
            type: TipType.help,
            showWhen: [0, 2.5],
            title: hygieneTips[0].title,
            text: hygieneTips[0].text,
          },
          {
            index: 2,
            category: TipCategory.hygiene,
            type: TipType.help,
            showWhen: [0, 2.5],
            title: hygieneTips[1].title,
            text: hygieneTips[1].text,
          },
          {
            index: 3,
            category: TipCategory.hygiene,
            type: TipType.help,
            showWhen: [5],
            title: hygieneTips[2].title,
            text: hygieneTips[2].text,
          },
          {
            index: 4,
            category: TipCategory.hygiene,
            type: TipType.help,
            showWhen: [0],
            title: hygieneTips[3].title,
            text: hygieneTips[3].text,
          },
          {
            index: 5,
            category: TipCategory.hygiene,
            type: TipType.help,
            showWhen: [2.5, 5],
            title: hygieneTips[4].title,
            text: hygieneTips[4].text,
          },
        ],
        happiness: [
          {
            index: 1,
            category: TipCategory.happiness,
            type: TipType.help,
            showWhen: [2.5],
            title: happinessTips[0].title,
            text: happinessTips[0].text,
          },
          {
            index: 2,
            category: TipCategory.happiness,
            type: TipType.help,
            showWhen: [2.5],
            title: happinessTips[1].title,
            text: happinessTips[1].text,
          },
          {
            index: 3,
            category: TipCategory.happiness,
            type: TipType.help,
            showWhen: [5],
            title: happinessTips[2].title,
            text: happinessTips[2].text,
          },
          {
            index: 4,
            category: TipCategory.happiness,
            type: TipType.help,
            showWhen: [5],
            title: happinessTips[3].title,
            text: happinessTips[3].text,
          },
          {
            index: 5,
            category: TipCategory.happiness,
            type: TipType.help,
            showWhen: [0, 2.5, 5, 7.5],
            title: happinessTips[4].title,
            text: happinessTips[4].text,
          },
          {
            index: 6,
            category: TipCategory.happiness,
            type: TipType.help,
            showWhen: [2.5],
            title: happinessTips[5].title,
            text: happinessTips[5].text,
          },
          {
            index: 7,
            category: TipCategory.happiness,
            type: TipType.help,
            showWhen: [0],
            title: happinessTips[6].title,
            text: happinessTips[6].text,
          },
        ],
        mobility: [
          {
            index: 1,
            category: TipCategory.mobility,
            type: TipType.help,
            showWhen: [5, 7.5],
            title: mobilityTips[0].title,
            text: mobilityTips[0].text,
          },
          {
            index: 2,
            category: TipCategory.mobility,
            type: TipType.help,
            showWhen: [2.5],
            title: mobilityTips[1].title,
            text: mobilityTips[1].text,
          },
          {
            index: 3,
            category: TipCategory.mobility,
            type: TipType.help,
            showWhen: [2.5],
            title: mobilityTips[2].title,
            text: mobilityTips[2].text,
          },
          {
            index: 4,
            category: TipCategory.mobility,
            type: TipType.help,
            showWhen: [5],
            title: mobilityTips[3].title,
            text: mobilityTips[3].text,
          },
          {
            index: 5,
            category: TipCategory.mobility,
            type: TipType.help,
            showWhen: [0],
            title: mobilityTips[4].title,
            text: mobilityTips[4].text,
          },
          {
            index: 6,
            category: TipCategory.mobility,
            type: TipType.help,
            showWhen: [0, 7.5],
            title: mobilityTips[5].title,
            text: mobilityTips[5].text,
          },
          {
            index: 7,
            category: TipCategory.mobility,
            type: TipType.help,
            showWhen: [2.5],
            title: mobilityTips[6].title,
            text: mobilityTips[6].text,
          },
          {
            index: 8,
            category: TipCategory.mobility,
            type: TipType.help,
            showWhen: [7.5],
            title: mobilityTips[7].title,
            text: mobilityTips[7].text,
          },
        ],
        encouragement: [
          {
            index: 1,
            category: TipCategory.encouragement,
            type: TipType.encouragement,
            showWhenCategories: {
              hurt: 0,
              hunger: 0,
              hydration: 0,
              hygiene: 0,
              happiness: 0,
              mobility: 0,
            },
            title: encouragementTips[0].title,
            text: encouragementTips[0].text,
          },
          {
            index: 2,
            category: TipCategory.encouragement,
            type: TipType.encouragement,
            showWhenCategories: {
              hurt: 5,
              hunger: 5,
              hydration: 5,
              hygiene: 5,
              happiness: 0,
              mobility: 5,
            },
            title: hungerTips[1].title,
            text: hungerTips[1].text,
          },
          {
            index: 3,
            category: TipCategory.encouragement,
            type: TipType.encouragement,
            showWhenCategories: {
              hurt: 5,
              hunger: 5,
              hydration: 5,
              hygiene: 5,
              happiness: 0,
              mobility: 5,
            },
            title: encouragementTips[2].title,
            text: encouragementTips[2].text,
          },
          {
            index: 4,
            category: TipCategory.encouragement,
            type: TipType.encouragement,
            showWhenCategories: {
              hurt: 5,
              hunger: 5,
              hydration: 5,
              hygiene: 5,
              happiness: 5,
              mobility: 5,
            },
            title: encouragementTips[3].title,
            text: encouragementTips[3].text,
          },
          {
            index: 5,
            category: TipCategory.encouragement,
            type: TipType.encouragement,
            showWhenCategories: {
              hurt: 0,
              hunger: 0,
              hydration: 0,
              hygiene: 0,
              happiness: 0,
              mobility: 0,
            },
            title: encouragementTips[4].title,
            text: encouragementTips[4].text,
          },
          {
            index: 6,
            category: TipCategory.encouragement,
            type: TipType.encouragement,
            showWhenCategories: {
              hurt: 5,
              hunger: 5,
              hydration: 5,
              hygiene: 5,
              happiness: 5,
              mobility: 5,
            },
            title: encouragementTips[5].title,
            text: encouragementTips[5].text,
          },
          {
            index: 7,
            category: TipCategory.encouragement,
            type: TipType.encouragement,
            showWhenCategories: {
              hurt: 7.5,
              hunger: 7.5,
              hydration: 7.5,
              hygiene: 7.5,
              happiness: 7.5,
              mobility: 7.5,
            },
            title: encouragementTips[6].title,
            text: encouragementTips[6].text,
          },
          {
            index: 8,
            category: TipCategory.encouragement,
            type: TipType.encouragement,
            showWhenCategories: {
              hurt: 7.5,
              hunger: 7.5,
              hydration: 7.5,
              hygiene: 7.5,
              happiness: 7.5,
              mobility: 7.5,
            },
            title: encouragementTips[7].title,
            text: encouragementTips[7].text,
          },
          {
            index: 9,
            category: TipCategory.encouragement,
            type: TipType.encouragement,
            showWhenCategories: {
              hurt: 0,
              hunger: 0,
              hydration: 0,
              hygiene: 0,
              happiness: 0,
              mobility: 0,
            },
            title: encouragementTips[8].title,
            text: encouragementTips[8].text,
          },
          {
            index: 10,
            category: TipCategory.encouragement,
            type: TipType.encouragement,
            showWhenCategories: {
              hurt: 0,
              hunger: 0,
              hydration: 0,
              hygiene: 0,
              happiness: 0,
              mobility: 0,
            },
            title: encouragementTips[9].title,
            text: encouragementTips[9].text,
          },
          {
            index: 11,
            category: TipCategory.encouragement,
            type: TipType.encouragement,
            showWhenCategories: {
              hurt: 5,
              hunger: 5,
              hydration: 5,
              hygiene: 5,
              happiness: 0,
              mobility: 5,
            },
            title: encouragementTips[10].title,
            text: encouragementTips[10].text,
          },
          {
            index: 12,
            category: TipCategory.encouragement,
            type: TipType.encouragement,
            showWhenCategories: {
              hurt: 7.5,
              hunger: 7.5,
              hydration: 7.5,
              hygiene: 7.5,
              happiness: 7.5,
              mobility: 7.5,
            },
            title: encouragementTips[11].title,
            text: encouragementTips[11].text,
          },
          {
            index: 13,
            category: TipCategory.mobility,
            type: TipType.help,
            showWhenCategories: {
              hurt: 5,
              hunger: 5,
              hydration: 5,
              hygiene: 5,
              happiness: 0,
              mobility: 5,
            },
            title: encouragementTips[12].title,
            text: encouragementTips[12].text,
          },
        ],
      } as TipList;
    },
    [t],
  );

  const getAllTips = useCallback(
    (petSpecies: string) => {
      if (petSpecies === 'other') {
        return [];
      }
      const tips = getTips(petSpecies);
      let allTips: Tip[] = [];
      allTips = allTips.concat(
        tips.hurt,
        tips.hunger,
        tips.hydration,
        tips.hygiene,
        tips.happiness,
        tips.mobility,
        tips.encouragement,
      );
      return allTips;
    },
    [getTips],
  );

  const getTipsForAssessment = useCallback(
    (petSpecies: string, assessment: Assessment) => {
      if (petSpecies === 'other') {
        return [];
      }
      const tips = getTips(petSpecies);
      let tipsForAssessment: Tip[] = [];
      tipsForAssessment = tipsForAssessment.concat(
        tips.hurt.filter(tip => tip.showWhen.includes(assessment.hurt)),
      );
      tipsForAssessment = tipsForAssessment.concat(
        tips.hunger.filter(tip => tip.showWhen.includes(assessment.hunger)),
      );
      tipsForAssessment = tipsForAssessment.concat(
        tips.hydration.filter(tip =>
          tip.showWhen.includes(assessment.hydration),
        ),
      );
      tipsForAssessment = tipsForAssessment.concat(
        tips.hygiene.filter(tip => tip.showWhen.includes(assessment.hygiene)),
      );
      tipsForAssessment = tipsForAssessment.concat(
        tips.happiness.filter(tip =>
          tip.showWhen.includes(assessment.happiness),
        ),
      );
      tipsForAssessment = tipsForAssessment.concat(
        tips.mobility.filter(tip => tip.showWhen.includes(assessment.mobility)),
      );
      tipsForAssessment = tipsForAssessment.concat(
        tips.encouragement.filter(tip => {
          const showWhenCategories = tip.showWhenCategories;
          return (
            assessment.hurt >= showWhenCategories.hurt &&
            assessment.hunger >= showWhenCategories.hunger &&
            assessment.hydration >= showWhenCategories.hydration &&
            assessment.hygiene >= showWhenCategories.hygiene &&
            assessment.happiness >= showWhenCategories.happiness &&
            assessment.mobility >= showWhenCategories.mobility
          );
        }),
      );
      return tipsForAssessment;
    },
    [getTips],
  );

  return {getTipsForAssessment, getAllTips};
};

export default useTips;
