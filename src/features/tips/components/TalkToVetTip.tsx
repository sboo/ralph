import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet} from 'react-native';
import {useTheme, Card, Icon, Text} from 'react-native-paper';

const TalkToVetTip: React.FC = () => {
  const {t} = useTranslation();
  const theme = useTheme();

  return (
    <Card
      mode="contained"
      style={{
        backgroundColor: theme.colors.errorContainer,
        ...styles.tip,
      }}>
      <Card.Title
        title={t('talk_to_vet_title')}
        // eslint-disable-next-line react/no-unstable-nested-components
        left={props => (
          <Icon
            {...props}
            source={'emoticon-sad-outline'}
            color={theme.colors.error}
          />
        )}
      />
      <Card.Content>
        <Text variant="bodyMedium">{t('talk_to_vet_text')}</Text>
      </Card.Content>
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

export default TalkToVetTip;
