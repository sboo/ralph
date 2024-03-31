import {Measurement} from '@/app/models/Measurement';
import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import {Card, Icon, IconButton, Text} from 'react-native-paper';
import useTips, {Tip, TipCategory} from '../hooks/useTips';
import {getTipBackgroundColor} from '@/support/helpers/ColorHelper';

interface TipsProps {
  assessment: Measurement;
}

const Tips: React.FC<TipsProps> = ({assessment}) => {
  const [currentTip, setCurrentTip] = useState<Tip>();
  const [tips, setTips] = useState<Tip[]>([]);
  const {getTipsForAssessment} = useTips();

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
        return 'star-outline';
      default:
        return 'information';
    }
  }, []);

  const getRandomTip = useCallback(() => {
    const randomNumber = Math.floor(Math.random() * tips.length);
    return setCurrentTip(tips[randomNumber]);
  }, [tips]);

  useEffect(() => {
    if (tips.length > 0) {
      getRandomTip();
    }
  }, [getRandomTip, tips]);

  return (
    <Card
      mode={'contained'}
      style={{
        backgroundColor: getTipBackgroundColor(currentTip?.type),
        ...styles.tip,
      }}>
      <Card.Title
        title={currentTip?.title}
        titleNumberOfLines={2}
        titleVariant={'titleMedium'}
        // eslint-disable-next-line react/no-unstable-nested-components
        left={props => (
          <Icon {...props} source={getIcon(currentTip?.category)} />
        )}
      />
      <Card.Content>
        <Text variant="bodyMedium">{currentTip?.text}</Text>
      </Card.Content>

      <Card.Actions>
        <IconButton
          size={20}
          icon="refresh"
          iconColor={'#cfcfcf'}
          mode={'contained-tonal'}
          style={styles.IconButton}
          onPress={getRandomTip}
        />
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
});

export default Tips;
