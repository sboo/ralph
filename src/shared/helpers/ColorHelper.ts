import { TipType } from '@/features/tips/types';
import { ColorSchemeName } from 'react-native';

const getValueColor = (neutralColor: string, value: number | undefined) => {
  if (value === undefined) {
    return neutralColor;
  }
  const rating = Math.round(value / 2.5) * 2.5;
  switch (rating) {
    case 0:
      return '#F44336';
    case 2.5:
      return '#F49503';
    case 5:
      return '#F0E106';
    case 7.5:
      return '#74D400';
    case 10:
      return '#4CAF50';
    default:
      return '#F0E106';
  }
};

// Better tip card backgrounds with proper contrast
const getTipBackgroundColor = (tipType?: TipType, effectiveAppearance?: ColorSchemeName) => {
  const isDark = effectiveAppearance === 'dark';
  
  switch (tipType) {
    case TipType.encouragement:
      return isDark ? 'rgba(150, 230, 223, 0.20)' : 'rgba(168, 237, 234, 0.35)'; // Teal - increased opacity
    case TipType.help:
      return isDark ? 'rgba(249, 212, 86, 0.25)' : 'rgba(250, 217, 98, 0.40)'; // Yellow - increased opacity
    default:
      return isDark ? 'rgba(253, 198, 217, 0.20)' : 'rgba(254, 214, 227, 0.35)'; // Pink - increased opacity
  }
};

export { getTipBackgroundColor, getValueColor };
