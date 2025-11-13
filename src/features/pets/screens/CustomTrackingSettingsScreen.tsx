import { emptyCustomTrackingLabels } from '@/features/assessments/helpers/customTracking';
import { event, EVENT_NAMES } from '@/features/events';
import { CustomTrackingSettingsScreenNavigationProps } from '@/features/navigation/types';
import { GradientBackground } from '@/shared/components/gradient-background';
import { getValueColor } from '@/shared/helpers/ColorHelper';
import { getEmoticon } from '@/shared/helpers/TooltipHelper';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Avatar,
  Button,
  Card,
  List,
  Switch,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const CustomTrackingSettingsScreen: React.FC<
  CustomTrackingSettingsScreenNavigationProps
> = ({route, navigation}) => {
  const {t} = useTranslation();
  const theme = useTheme();

  const {
    customTrackingEnabled,
    customTrackingName,
    customTrackingDescription,
    customTrackingLabels,
  } = route.params.customTrackingSettings;

  const [_customTrackingEnabled, _setCustomTrackingEnabled] = React.useState(
    customTrackingEnabled,
  );
  const [_customTrackingName, _setCustomTrackingName] =
    React.useState(customTrackingName);
  const [_customTrackingDescription, _setCustomTrackingDescription] =
    React.useState(customTrackingDescription);
  const [_customTrackingLabels, _setCustomTrackingLabels] = React.useState({
    ...emptyCustomTrackingLabels,
    ...customTrackingLabels,
  });

  const handleCustomTrackingEnabled = (enabled: boolean) => {
    _setCustomTrackingEnabled(enabled);
    event.emit(EVENT_NAMES.CUSTOM_TRACKING_CHANGED, {
      customTrackingEnabled: enabled,
      customTrackingName: _customTrackingName,
      customTrackingDescription: _customTrackingDescription,
      customTrackingLabels: _customTrackingLabels, // Use newLabels instead of _customTrackingLabels
    });
  };

  const handleCustomTrackingNameChanged = (customTrackingName: string) => {
    _setCustomTrackingName(customTrackingName);
    event.emit(EVENT_NAMES.CUSTOM_TRACKING_CHANGED, {
      customTrackingEnabled: _customTrackingEnabled,
      customTrackingName: customTrackingName,
      customTrackingDescription: _customTrackingDescription,
      customTrackingLabels: _customTrackingLabels, // Use newLabels instead of _customTrackingLabels
    });
  };

  const handleCustomTrackingDescriptionChanged = (
    customTrackingDescription: string,
  ) => {
    _setCustomTrackingDescription(customTrackingDescription);
    event.emit(EVENT_NAMES.CUSTOM_TRACKING_CHANGED, {
      customTrackingEnabled: _customTrackingEnabled,
      customTrackingName: _customTrackingName,
      customTrackingDescription: customTrackingDescription,
      customTrackingLabels: _customTrackingLabels, // Use newLabels instead of _customTrackingLabels
    });
  };

  const handleCustomTrackingLabelChanged = (value: string, name: string) => {
    const newLabels = {..._customTrackingLabels, [value]: name};
    _setCustomTrackingLabels(newLabels);
    event.emit(EVENT_NAMES.CUSTOM_TRACKING_CHANGED, {
      customTrackingEnabled: _customTrackingEnabled,
      customTrackingName: _customTrackingName,
      customTrackingDescription: _customTrackingDescription,
      customTrackingLabels: newLabels, // Use newLabels instead of _customTrackingLabels
    });
  };

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={{
        backgroundColor: theme.colors.primaryContainer,
        ...styles.container,
      }}>
      <GradientBackground
        style={styles.gradient}>
        <ScrollView style={styles.scrollView}>
          <Card
            mode="contained"
            style={{backgroundColor: theme.colors.surface, ...styles.card}}>
            <Card.Content style={styles.cardContent}>
              <Avatar.Icon
                icon="clipboard-plus-outline"
                size={50}
                style={{backgroundColor: theme.colors.tertiary}}
              />
              <Text style={styles.cardTitle} variant="headlineMedium">
                {t('settings:customTracking')}
              </Text>
              <Text style={styles.cardText}>
                {t('settings:customTrackingDescription')}
              </Text>
            </Card.Content>
          </Card>

          <Text
            variant="bodyMedium"
            style={{...styles.description, color: theme.colors.error}}>
            {t('settings:customTrackingInfo')}
          </Text>

          <List.Section>
            <List.Item
              title={t('settings:customTrackingEnabledLabel')}
              right={() => (
                <Switch
                  value={_customTrackingEnabled}
                  onValueChange={handleCustomTrackingEnabled}
                />
              )}
            />
          </List.Section>
          {_customTrackingEnabled ? (
            <View>
              <Text variant="bodyLarge" style={styles.description}>
                {t('settings:customTrackingNameInfo')}
              </Text>
              <TextInput
                dense={true}
                mode="outlined"
                placeholder={t('settings:customTrackingNameInputLabel')}
                style={styles.textInput}
                value={_customTrackingName}
                onChangeText={(text: string) =>
                  handleCustomTrackingNameChanged(text)
                }
              />
              <TextInput
                dense={true}
                mode="outlined"
                placeholder={t('settings:customTrackingDescriptionInputLabel')}
                multiline={true}
                style={styles.textInput}
                value={_customTrackingDescription}
                onChangeText={(text: string) =>
                  handleCustomTrackingDescriptionChanged(text)
                }
              />
              <Text variant="bodyLarge" style={styles.description}>
                {t('settings:customTrackingLabelDescription')}
              </Text>
              <TextInput
                dense={true}
                mode="outlined"
                style={styles.textInput}
                value={_customTrackingLabels['0']}
                left={
                  <TextInput.Icon
                    icon={getEmoticon(0)!.icon}
                    color={getValueColor(theme.colors.outline, 0)}
                  />
                }
                onChangeText={(text: string) =>
                  handleCustomTrackingLabelChanged('0', text)
                }
              />
              <TextInput
                dense={true}
                mode="outlined"
                style={styles.textInput}
                value={_customTrackingLabels['2.5']}
                left={
                  <TextInput.Icon
                    icon={getEmoticon(2.5)!.icon}
                    color={getValueColor(theme.colors.outline, 2.5)}
                  />
                }
                onChangeText={(text: string) =>
                  handleCustomTrackingLabelChanged('2.5', text)
                }
              />
              <TextInput
                dense={true}
                mode="outlined"
                style={styles.textInput}
                value={_customTrackingLabels['5'] ?? ''}
                left={
                  <TextInput.Icon
                    icon={getEmoticon(5)!.icon}
                    color={getValueColor(theme.colors.outline, 5)}
                  />
                }
                onChangeText={(text: string) =>
                  handleCustomTrackingLabelChanged('5', text)
                }
              />
              <TextInput
                dense={true}
                mode="outlined"
                style={styles.textInput}
                value={_customTrackingLabels['7.5'] ?? ''}
                left={
                  <TextInput.Icon
                    icon={getEmoticon(7.5)!.icon}
                    color={getValueColor(theme.colors.outline, 7.5)}
                  />
                }
                onChangeText={(text: string) =>
                  handleCustomTrackingLabelChanged('7.5', text)
                }
              />
              <TextInput
                dense={true}
                mode="outlined"
                style={styles.textInput}
                value={_customTrackingLabels['10'] ?? ''}
                left={
                  <TextInput.Icon
                    icon={getEmoticon(10)!.icon}
                    color={getValueColor(theme.colors.outline, 10)}
                  />
                }
                onChangeText={(text: string) =>
                  handleCustomTrackingLabelChanged('10', text)
                }
              />
            </View>
          ) : null}
        </ScrollView>
        <View style={styles.buttons}>
          <Button mode={'contained'} onPress={() => navigation.goBack()}>
            {t('buttons:done')}
          </Button>
        </View>
      </GradientBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    marginBottom: 20,
  },
  cardContent: {
    flexDirection: 'column',
    gap: 10,
    alignItems: 'center',
    margin: 20,
  },
  cardTitle: {
    textAlign: 'center',
  },
  cardText: {
    textAlign: 'center',
  },
  description: {
    marginVertical: 20,
    marginHorizontal: 20,
  },
  textInput: {
    marginBottom: 10,
    marginHorizontal: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
});

export default CustomTrackingSettingsScreen;
