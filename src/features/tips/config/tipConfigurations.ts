import { TipCategory, TipType } from '../hooks/useTips';

/**
 * Centralized configuration for all available tips in the application
 * Tips are organized by category and reference translation keys
 */
export const tipConfigurations = {
  hurt: [
    { index: 1, category: TipCategory.hurt, type: TipType.help, showWhen: [2.5, 5, 7.5], translationKey: 0 },
    { index: 2, category: TipCategory.hurt, type: TipType.help, showWhen: [0, 2.5], translationKey: 1 },
    { index: 3, category: TipCategory.hurt, type: TipType.help, showWhen: [2.5, 5], translationKey: 2 },
    { index: 4, category: TipCategory.hurt, type: TipType.help, showWhen: [2.5], translationKey: 3 },
    { index: 5, category: TipCategory.hurt, type: TipType.help, showWhen: [2.5], translationKey: 4 },
  ],
  hunger: [
    { index: 1, category: TipCategory.hunger, type: TipType.help, showWhen: [2.5], translationKey: 0 },
    { index: 2, category: TipCategory.hunger, type: TipType.help, showWhen: [0, 2.5, 5], translationKey: 1 },
    { index: 3, category: TipCategory.hunger, type: TipType.help, showWhen: [5], translationKey: 2 },
    { index: 4, category: TipCategory.hunger, type: TipType.help, showWhen: [2.5], translationKey: 3 },
    { index: 5, category: TipCategory.hunger, type: TipType.help, showWhen: [7.5], translationKey: 4 },
    { index: 6, category: TipCategory.hunger, type: TipType.help, showWhen: [5], translationKey: 5 },
    { index: 7, category: TipCategory.hunger, type: TipType.help, showWhen: [7.5], translationKey: 6 },
    { index: 8, category: TipCategory.hunger, type: TipType.help, showWhen: [0], translationKey: 7 },
  ],
  hydration: [
    { index: 1, category: TipCategory.hydration, type: TipType.help, showWhen: [2.5, 5, 7.5], translationKey: 0 },
    { index: 2, category: TipCategory.hydration, type: TipType.help, showWhen: [0, 2.5], translationKey: 1 },
    { index: 3, category: TipCategory.hydration, type: TipType.help, showWhen: [0, 5], translationKey: 2, useHungerTranslation: true },
    { index: 4, category: TipCategory.hydration, type: TipType.help, showWhen: [2.5, 7.5], translationKey: 3 },
    { index: 5, category: TipCategory.hydration, type: TipType.help, showWhen: [0], translationKey: 4 },
  ],
  hygiene: [
    { index: 1, category: TipCategory.hygiene, type: TipType.help, showWhen: [0, 2.5], translationKey: 0 },
    { index: 2, category: TipCategory.hygiene, type: TipType.help, showWhen: [0, 2.5], translationKey: 1 },
    { index: 3, category: TipCategory.hygiene, type: TipType.help, showWhen: [5], translationKey: 2 },
    { index: 4, category: TipCategory.hygiene, type: TipType.help, showWhen: [0], translationKey: 3 },
    { index: 5, category: TipCategory.hygiene, type: TipType.help, showWhen: [2.5, 5], translationKey: 4 },
  ],
  happiness: [
    { index: 1, category: TipCategory.happiness, type: TipType.help, showWhen: [2.5], translationKey: 0 },
    { index: 2, category: TipCategory.happiness, type: TipType.help, showWhen: [2.5], translationKey: 1 },
    { index: 3, category: TipCategory.happiness, type: TipType.help, showWhen: [5], translationKey: 2 },
    { index: 4, category: TipCategory.happiness, type: TipType.help, showWhen: [5], translationKey: 3 },
    { index: 5, category: TipCategory.happiness, type: TipType.help, showWhen: [0, 2.5, 5, 7.5], translationKey: 4 },
    { index: 6, category: TipCategory.happiness, type: TipType.help, showWhen: [2.5], translationKey: 5 },
    { index: 7, category: TipCategory.happiness, type: TipType.help, showWhen: [0], translationKey: 6 },
  ],
  mobility: [
    { index: 1, category: TipCategory.mobility, type: TipType.help, showWhen: [5, 7.5], translationKey: 0 },
    { index: 2, category: TipCategory.mobility, type: TipType.help, showWhen: [2.5], translationKey: 1 },
    { index: 3, category: TipCategory.mobility, type: TipType.help, showWhen: [2.5], translationKey: 2 },
    { index: 4, category: TipCategory.mobility, type: TipType.help, showWhen: [5], translationKey: 3 },
    { index: 5, category: TipCategory.mobility, type: TipType.help, showWhen: [0], translationKey: 4 },
    { index: 6, category: TipCategory.mobility, type: TipType.help, showWhen: [0, 7.5], translationKey: 5 },
    { index: 7, category: TipCategory.mobility, type: TipType.help, showWhen: [2.5], translationKey: 6 },
    { index: 8, category: TipCategory.mobility, type: TipType.help, showWhen: [7.5], translationKey: 7 },
  ],
  encouragement: [
    {
      index: 1, 
      category: TipCategory.encouragement, 
      type: TipType.encouragement, 
      showWhenCategories: {
        hurt: 0, hunger: 0, hydration: 0, hygiene: 0, happiness: 0, mobility: 0
      }, 
      translationKey: 0
    },
    {
      index: 2, 
      category: TipCategory.encouragement, 
      type: TipType.encouragement, 
      showWhenCategories: {
        hurt: 5, hunger: 5, hydration: 5, hygiene: 5, happiness: 0, mobility: 5
      }, 
      translationKey: 1,
      useHungerTranslation: true
    },
    {
      index: 3, 
      category: TipCategory.encouragement, 
      type: TipType.encouragement, 
      showWhenCategories: {
        hurt: 5, hunger: 5, hydration: 5, hygiene: 5, happiness: 0, mobility: 5
      }, 
      translationKey: 2
    },
    {
      index: 4, 
      category: TipCategory.encouragement, 
      type: TipType.encouragement, 
      showWhenCategories: {
        hurt: 5, hunger: 5, hydration: 5, hygiene: 5, happiness: 5, mobility: 5
      }, 
      translationKey: 3
    },
    {
      index: 5, 
      category: TipCategory.encouragement, 
      type: TipType.encouragement, 
      showWhenCategories: {
        hurt: 0, hunger: 0, hydration: 0, hygiene: 0, happiness: 0, mobility: 0
      }, 
      translationKey: 4
    },
    {
      index: 6, 
      category: TipCategory.encouragement, 
      type: TipType.encouragement, 
      showWhenCategories: {
        hurt: 5, hunger: 5, hydration: 5, hygiene: 5, happiness: 5, mobility: 5
      }, 
      translationKey: 5
    },
    {
      index: 7, 
      category: TipCategory.encouragement, 
      type: TipType.encouragement, 
      showWhenCategories: {
        hurt: 7.5, hunger: 7.5, hydration: 7.5, hygiene: 7.5, happiness: 7.5, mobility: 7.5
      }, 
      translationKey: 6
    },
    {
      index: 8, 
      category: TipCategory.encouragement, 
      type: TipType.encouragement, 
      showWhenCategories: {
        hurt: 7.5, hunger: 7.5, hydration: 7.5, hygiene: 7.5, happiness: 7.5, mobility: 7.5
      }, 
      translationKey: 7
    },
    {
      index: 9, 
      category: TipCategory.encouragement, 
      type: TipType.encouragement, 
      showWhenCategories: {
        hurt: 0, hunger: 0, hydration: 0, hygiene: 0, happiness: 0, mobility: 0
      }, 
      translationKey: 8
    },
    {
      index: 10, 
      category: TipCategory.encouragement, 
      type: TipType.encouragement, 
      showWhenCategories: {
        hurt: 0, hunger: 0, hydration: 0, hygiene: 0, happiness: 0, mobility: 0
      }, 
      translationKey: 9
    },
    {
      index: 11, 
      category: TipCategory.encouragement, 
      type: TipType.encouragement, 
      showWhenCategories: {
        hurt: 5, hunger: 5, hydration: 5, hygiene: 5, happiness: 0, mobility: 5
      }, 
      translationKey: 10
    },
    {
      index: 12, 
      category: TipCategory.encouragement, 
      type: TipType.encouragement, 
      showWhenCategories: {
        hurt: 7.5, hunger: 7.5, hydration: 7.5, hygiene: 7.5, happiness: 7.5, mobility: 7.5
      }, 
      translationKey: 11
    },
    {
      index: 13, 
      category: TipCategory.mobility, 
      type: TipType.help, 
      showWhenCategories: {
        hurt: 5, hunger: 5, hydration: 5, hygiene: 5, happiness: 0, mobility: 5
      }, 
      translationKey: 12
    },
  ]
};