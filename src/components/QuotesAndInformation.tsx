import React, {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton, useTheme} from 'react-native-paper';
import {StyleSheet} from 'react-native';
import {Card, Icon, Text} from 'react-native-paper';

interface Quote {
  icon?: string;
  title?: string;
  text?: string;
  color?: string;
}

interface Props {
  averageScore: number;
}

const QuotesAndInformation: React.FC<Props> = ({averageScore}) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const [information, setInformation] = useState<Quote>({});

  const getIcon = (topic: string) => {
    switch (topic) {
      case 'hurt':
        return 'heart';
      case 'hunger':
        return 'food-drumstick';
      case 'hydration':
        return 'cup-water';
      case 'hygiene':
        return 'shower';
      case 'happiness':
        return 'emoticon-happy';
      case 'mobility':
        return 'paw';
      case 'more':
        return 'information';
      default:
        return 'information';
    }
  };

  const getRandomQuote = useCallback(() => {
    const topics = [
      'hurt',
      'hunger',
      'hydration',
      'hygiene',
      'happiness',
      'mobility',
      'more',
    ];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const randomNumber = Math.floor(Math.random() * 3) + 1;

    return {
      icon: getIcon(randomTopic),
      title: t(`quotes:${randomTopic}_${randomNumber}_title`),
      text: t(`quotes:${randomTopic}_${randomNumber}_text`),
    };
  }, [t]);

  useEffect(() => {
    if (averageScore < 30) {
      return setInformation({
        icon: 'emoticon-sad-outline',
        title: t('talk_to_vet_title'),
        text: t('talk_to_vet_text'),
        color: theme.colors.error,
      });
    } else {
      setInformation(getRandomQuote());
    }
  }, [getRandomQuote, averageScore, t, theme]);

  const backgroundColor =
    averageScore < 30
      ? theme.colors.errorContainer
      : theme.colors.primaryContainer;

  return (
    <Card
      mode="contained"
      style={{
        backgroundColor: backgroundColor,
        ...styles.quote,
      }}>
      <Card.Title
        title={information.title}
        // eslint-disable-next-line react/no-unstable-nested-components
        left={props => (
          <Icon
            {...props}
            source={information.icon}
            color={information.color ?? theme.colors.onPrimaryContainer}
          />
        )}
      />
      <Card.Content>
        <Text variant="bodyMedium">{information.text}</Text>
      </Card.Content>

      <Card.Actions>
        {averageScore >= 30 ? (
          <IconButton
            size={20}
            icon="refresh"
            iconColor={'#cfcfcf'}
            mode={'contained-tonal'}
            style={styles.IconButton}
            onPress={() => setInformation(getRandomQuote())}
          />
        ) : null}
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  quote: {
    marginTop: 45,
    borderRadius: 15,
  },
  IconButton: {
    backgroundColor: 'transparent',
  },
});

export default QuotesAndInformation;
