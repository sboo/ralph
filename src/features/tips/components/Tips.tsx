import { Assessment, Pet } from '@/app/database';
import { getTipBackgroundColor } from '@/support/helpers/ColorHelper';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Card, Icon, Text } from 'react-native-paper';
import { SwiperFlatList } from 'react-native-swiper-flatlist';
import useTips, { Tip, TipCategory } from '../hooks/useTips';
interface TipsProps {
  activePet: Pet;
  assessment?: Assessment;
  numberOfTips?: number | undefined;
}

const Tips: React.FC<TipsProps> = ({activePet, assessment, numberOfTips}) => {
  const [currentTips, setCurrentTips] = useState<Tip[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [tips, setTips] = useState<Tip[]>([]);
  const {getTipsForAssessment, getAllTips} = useTips();
  const {t} = useTranslation();

  useEffect(() => {
    if (assessment) {
      setTips(getTipsForAssessment(activePet?.species, assessment));
    } else {
      setTips(getAllTips(activePet.species));
    }
  }, [activePet, assessment, getTipsForAssessment, getAllTips]);

  const getIcon = useCallback((category?: TipCategory) => {
    switch (category) {
      case TipCategory.hurt:
        return 'heart';
      case TipCategory.hunger:
        return 'food-drumstick';
      case TipCategory.hydration:
        return 'cup-water';
      case TipCategory.hygiene:
        return 'shower';
      case TipCategory.happiness:
        return 'emoticon-happy';
      case TipCategory.mobility:
        return 'paw';

      case TipCategory.encouragement:
        return 'white-balance-sunny';
      default:
        return 'information';
    }
  }, []);

  const getRandomTip = useCallback(() => {
    const randomNumbers: number[] = [];
    while (randomNumbers.length < (numberOfTips ?? tips.length)) {
      const randomNumber = Math.floor(Math.random() * tips.length);
      if (!randomNumbers.includes(randomNumber)) {
        randomNumbers.push(randomNumber);
      }
    }
    const randomTips = randomNumbers.map(index => tips[index]);
    setCurrentTips(randomTips);
  }, [numberOfTips, tips]);

  useEffect(() => {
    if (tips.length > 0) {
      getRandomTip();
    }
  }, [getRandomTip, tips]);

  // eslint-disable-next-line react/no-unstable-nested-components
  const IndicatorDots = () => (
    <View style={styles.footer}>
      <Text variant={'bodySmall'} style={styles.tipInfo}>
        {t('tips:info')}
      </Text>
      <View style={styles.dotsHolder}>
        {[...new Array(numberOfTips).keys()].map(index => (
          <Text
            key={index}
            style={currentIndex === index ? styles.activeDot : styles.dot}>
            •
          </Text>
        ))}
      </View>
    </View>
  );

  if (tips.length === 0) {
    return null;
  }

  return (
    <Card
      mode={'contained'}
      style={{
        backgroundColor: getTipBackgroundColor(currentTips[currentIndex]?.type),
        ...styles.tip,
      }}>
      <SwiperFlatList
        style={styles.swiper}
        // autoplay
        // autoplayLoop
        // autoplayDelay={7}
        data={currentTips}
        onChangeIndex={({index}) => setCurrentIndex(index)}
        renderItem={({item}) => (
          <View style={styles.cardContent}>
            <Card.Title
              title={item?.title}
              titleNumberOfLines={2}
              titleVariant={'titleMedium'}
              // eslint-disable-next-line react/no-unstable-nested-components
              left={props => (
                <Icon {...props} source={getIcon(item?.category)} />
              )}
            />
            <Card.Content>
              <Text variant="bodyMedium">{item?.text}</Text>
            </Card.Content>
          </View>
        )}
      />
      <Card.Actions>
        <IndicatorDots />
      </Card.Actions>
    </Card>
  );
};

const width = Dimensions.get('window').width - 40;
const height = (width / 16) * 8;

const styles = StyleSheet.create({
  tip: {
    marginTop: 45,
    borderRadius: 15,
  },
  swiper: {
    // justifyContent: 'center',
  },
  cardContent: {
    width,
    height,
    justifyContent: 'flex-start',
  },
  IconButton: {
    backgroundColor: 'transparent',
  },
  footer: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  tipInfo: {
    color: '#7f7f7f',
    fontStyle: 'italic',
  },
  dotsHolder: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    fontSize: 20,
    color: '#7f7f7f',
  },
  activeDot: {
    fontSize: 20,
    color: 'black',
  },
});

export default Tips;
