import {TipType} from '@/features/tips/hooks/useTips';

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
    default:
    case 5:
      return '#F0E106';
    case 7.5:
      return '#74D400';
    case 10:
      return '#4CAF50';
  }
};

const getTipBackgroundColor = (tipType?: TipType) => {
  switch (tipType) {
    default:
    case TipType.help:
      return '#F0E10655';
    case TipType.encouragement:
      return '#74D40055';
  }
};

export {getValueColor, getTipBackgroundColor};
