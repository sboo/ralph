import React from 'react';
import {Trans, useTranslation} from 'react-i18next';
import {StyleSheet} from 'react-native';
import {useTheme, Card, Icon, Text} from 'react-native-paper';

const GetStartedTip: React.FC = () => {
  const {t} = useTranslation();
  const theme = useTheme();

  // eslint-disable-next-line react/no-unstable-nested-components
  const RedDot = () => (
    <Text variant={'bodyLarge'} style={{color: theme.colors.error}}>
      ⬤
    </Text>
  );


  return (
    <Card
      mode="contained"
      style={{
        backgroundColor: theme.colors.primaryContainer,
        ...styles.introduction,
      }}>
      <Card.Title
        title={t('introduction_title')}
        // eslint-disable-next-line react/no-unstable-nested-components
        left={props => (
          <Icon
            {...props}
            source="calendar-month-outline"
            color={theme.colors.onPrimaryContainer}
          />
        )}
      />
      <Card.Content>
        <Text variant="bodyMedium">
          <Trans
            i18nKey={'introduction_text'}
            components={{redDot: <RedDot />}}
          />
        </Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  introduction: {
    marginTop: 45,
    borderRadius: 15,
  },
});

export default GetStartedTip;
