import {Measurement} from '@/app/models/Measurement';
import React, {useCallback, useEffect, useState} from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import {Card, Icon, IconButton, Text} from 'react-native-paper';
import useTips, {Tip, TipCategory} from '../hooks/useTips';
import {getTipBackgroundColor} from '@/support/helpers/ColorHelper';
import {useTranslation} from 'react-i18next';
import Carousel from 'react-native-reanimated-carousel';

interface TipsProps {
  assessment: Measurement;
}

const Tips: React.FC<TipsProps> = ({assessment}) => {
  const [currentTips, setCurrentTips] = useState<Tip[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [tips, setTips] = useState<Tip[]>([]);
  const {getTipsForAssessment} = useTips();
  const {t} = useTranslation();

  useEffect(() => {
    setTips(getTipsForAssessment(assessment));
  }, [assessment, getTipsForAssessment]);

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

  const numberOfTips = 4;
  const getRandomTip = useCallback(() => {
    const randomNumbers: number[] = [];
    while (randomNumbers.length < numberOfTips) {
      const randomNumber = Math.floor(Math.random() * tips.length);
      if (!randomNumbers.includes(randomNumber)) {
        randomNumbers.push(randomNumber);
      }
    }
    const randomTips = randomNumbers.map(index => tips[index]);
    setCurrentTips(randomTips);
  }, [tips]);

  const width = Dimensions.get('window').width - 40;
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
          <Text style={currentIndex === index ? styles.activeDot : styles.dot}>
            •
          </Text>
        ))}
      </View>
    </View>
  );

  return (
    <Card
      mode={'contained'}
      style={{
        backgroundColor: getTipBackgroundColor(currentTips[currentIndex]?.type),
        ...styles.tip,
      }}>
      <Carousel
        loop
        width={width}
        height={(width / 16) * 7}
        autoPlay={true}
        autoPlayInterval={7000}
        data={currentTips}
        scrollAnimationDuration={1000}
        onSnapToItem={index => setCurrentIndex(index)}
        renderItem={({item}) => (
          <>
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
          </>
        )}
      />
      <Card.Actions>
        <IndicatorDots />
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  tip: {
    marginTop: 45,
    borderRadius: 15,
    marginBottom: 100,
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
