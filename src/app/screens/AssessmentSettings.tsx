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
  const { assessmentFrequency, assessmentsPaused } = route.params;
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

          <Card mode="contained" style={{ backgroundColor: theme.colors.surface, ...styles.card }}>
            <Card.Content style={styles.cardContent}>
              <Avatar.Icon icon="clipboard-check-outline" size={50} style={{ backgroundColor: theme.colors.tertiary }} />
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
  cardText: {
    textAlign: 'center',
  },
  listItemRadio: {
    // height: 60,
  }
});

export default AssessmentSettings;