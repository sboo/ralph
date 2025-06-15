export interface TipTranslation {
  title: string;
  text: string;
}

export interface Tip {
  index: number;
  category: TipCategory;
  type: TipType;
  showWhen?: number[];
  showWhenCategories?: {[key in Exclude<TipCategory, TipCategory.encouragement>]: number};
  translationKey: number;
}

export interface TipList {
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