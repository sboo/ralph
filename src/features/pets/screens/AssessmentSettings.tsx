import { CustomTrackingSettings } from "@/features/assessments/helpers/customTracking";
import { event, EVENT_NAMES } from '@/features/events';
import { AssessmentSettingsScreenNavigationProps } from "@/features/navigation/types";
import { AssessmentFrequency } from "@core/database/models/Pet";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Avatar, Button, Card, Divider, List, Switch, Text, useTheme } from "react-native-paper";

const AssessmentSettings: React.FC<AssessmentSettingsScreenNavigationProps> = ({ route, navigation }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { assessmentFrequency, assessmentsPaused, customTrackingSettings } = route.params;
  const [_assessmentFrequency, _setAssessmentFrequency] = useState(assessmentFrequency);
  const [_assessmentsPaused, _setAssessmentsPaused] = useState(assessmentsPaused);
  const [_customTrackingSettings, _setCustomTrackingSettings] = useState<CustomTrackingSettings>(customTrackingSettings);


  useEffect(() => {
    const handleCustomTrackingSettings = (customTrackingSettings: CustomTrackingSettings) => {
      _setCustomTrackingSettings(customTrackingSettings)
    }
    event.on(EVENT_NAMES.CUSTOM_TRACKING_CHANGED, handleCustomTrackingSettings);
    return () => {
      event.off(EVENT_NAMES.CUSTOM_TRACKING_CHANGED, handleCustomTrackingSettings);
    }
  }, [_setCustomTrackingSettings]);

  const handleAssessmentFrequency = (frequency: AssessmentFrequency) => {
    event.emit(EVENT_NAMES.ASSESSMENT_FREQUENCY_CHANGED, frequency);
    _setAssessmentFrequency(frequency);
  }

  const handleAssemmentPaused = (paused: boolean) => {
    event.emit(EVENT_NAMES.ASSESSMENT_PAUSED, paused);
    _setAssessmentsPaused(paused);
  }

  return (
    <SafeAreaView
      style={{
        backgroundColor: theme.colors.primaryContainer,
        ...styles.container,
      }}>
      <LinearGradient
        colors={[
          theme.colors.primaryContainer,
          theme.colors.background,
          theme.colors.primaryContainer,
        ]}
        locations={[0, 0.75, 1]}
        style={styles.gradient}>
        <ScrollView style={styles.scrollView}>

          <Card mode="contained" style={{ backgroundColor: theme.colors.surface, ...styles.card }}>
            <Card.Content style={styles.cardContent}>
              <Avatar.Icon icon="clipboard-check-outline" size={50} style={{ backgroundColor: theme.colors.tertiary }} />
              <Text style={styles.cardTitle} variant='headlineMedium'>{t('settings:assessments')}</Text>
              <Text style={styles.cardText}>{t('settings:assessmentsDescription')}</Text>
            </Card.Content>
          </Card>

          <List.Section>
            <List.Item
              title={t('settings:assessmentFrequency')}
              description={t('settings:assessmentFrequencyLabelInfo')}
            />
            <List.Item
              disabled={_assessmentsPaused}
              title={t('settings:daily')}
              style={styles.listItemRadio}
              titleStyle={{ color: _assessmentsPaused ? theme.colors.onSurfaceDisabled : '' }}
              onPress={() => handleAssessmentFrequency('DAILY')}
              right={() => (
                <List.Icon icon="check" color={_assessmentFrequency === 'DAILY' ? (_assessmentsPaused ? theme.colors.onSurfaceDisabled : '') : 'transparent'} />
              )}
            />
            <List.Item
              disabled={_assessmentsPaused}
              title={t('settings:weekly')}
              style={styles.listItemRadio}
              titleStyle={{ color: _assessmentsPaused ? theme.colors.onSurfaceDisabled : '' }}
              onPress={() => handleAssessmentFrequency('WEEKLY')}
              right={() => (
                <List.Icon icon="check" color={_assessmentFrequency === 'WEEKLY' ? (_assessmentsPaused ? theme.colors.onSurfaceDisabled : '') : 'transparent'} />
              )}
            />
          </List.Section>
          <Divider />
          <List.Section>
            <List.Item
              title={t('settings:customTracking')}
              description={t('settings:customTrackingDescriptionShort')}
            />
            <List.Item
              title={t('settings:customTrackingEnabledLabel')}

              right={props => <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text variant='bodySmall'>{
                  _customTrackingSettings?.customTrackingEnabled ? t('settings:on') : t('settings:off')
                }</Text>
                <List.Icon {...props} icon="chevron-right" />
              </View>
              }
              onPress={() => navigation.navigate('CustomTrackingSettings', {
                customTrackingSettings: _customTrackingSettings
              })}
            />
          </List.Section>
          <Divider />
          <List.Section>
            <List.Item
              title={t('settings:pauseAssessmentsLabel')}
              description={t('settings:pauseAssessmentsLabelInfo')}
              descriptionNumberOfLines={3}
              right={() => (
                <Switch
                  value={_assessmentsPaused}
                  onValueChange={handleAssemmentPaused}
                />
              )}
            />
          </List.Section>
        </ScrollView>
        <View style={styles.buttons}>
          <Button
            mode={'contained'}
            onPress={() => navigation.goBack()}
          >
            {t('buttons:done')}
          </Button>
        </View>
      </LinearGradient>
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
  listItemRadio: {
    // height: 60,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  }
});

export default AssessmentSettings;