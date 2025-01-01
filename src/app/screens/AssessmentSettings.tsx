import { AssessmentSettingsScreenNavigationProps } from "@/features/navigation/types";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, SafeAreaView, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useTheme, List, Switch, Card, Avatar, Text } from "react-native-paper";
import { AssessmentFrequency } from "../models/Pet";
import { event, EVENT_NAMES } from '@/features/events';

const AssessmentSettings: React.FC<AssessmentSettingsScreenNavigationProps> = ({ route }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { assessmentFrequency, assessmentsPaused, isExistingPet } = route.params;
  const [_assessmentFrequency, _setAssessmentFrequency] = useState(assessmentFrequency);
  const [_assessmentsPaused, _setAssessmentsPaused] = useState(assessmentsPaused);

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

          <Card mode="contained" style={{backgroundColor: theme.colors.surface, ...styles.card}}>
            <Card.Content style={styles.cardContent}>
              <Avatar.Icon  icon="clipboard-check-outline" size={50} style={{ backgroundColor: theme.colors.tertiary}} />
              <Text variant='headlineMedium'>{t('settings:assessments')}</Text>
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
              titleStyle={{color: _assessmentsPaused ? theme.colors.onSurfaceDisabled: ''}}
              onPress={() => handleAssessmentFrequency('DAILY')}
              right={() => _assessmentFrequency === 'DAILY' && (
                <List.Icon icon="check" color={_assessmentsPaused ? theme.colors.onSurfaceDisabled: ''} />
              )}
            />
            <List.Item
              disabled={_assessmentsPaused}
              title={t('settings:weekly')}
              titleStyle={{color: _assessmentsPaused ? theme.colors.onSurfaceDisabled: ''}}
              onPress={() => handleAssessmentFrequency('WEEKLY')}
              right={() => _assessmentFrequency === 'WEEKLY' && (
                <List.Icon icon="check" color={_assessmentsPaused ? theme.colors.onSurfaceDisabled: ''} />
              )}
            />
          </List.Section>
          {isExistingPet ? (
            <List.Section>
              <List.Item
                title={t('settings:pauseAssessmentsLabel')}
                description={t('settings:pauseAssessmentsLabelInfo')}
                right={() => (
                  <Switch
                    value={_assessmentsPaused}
                    onValueChange={handleAssemmentPaused}
                  />
                )}
              />
            </List.Section>
          ) : null}
        </ScrollView>
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
  cardContent:{
    flexDirection: 'column', 
    gap: 10, 
    alignItems: 'center',
    margin: 20,
  },
  cardText: {
    textAlign: 'center',
  }
});

export default AssessmentSettings;