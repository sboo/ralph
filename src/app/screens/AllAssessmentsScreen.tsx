import React from 'react';
import {useTranslation} from 'react-i18next';
import {SafeAreaView, ScrollView, StyleSheet} from 'react-native';
import {useQuery} from '@realm/react';
import {Divider, List, useTheme} from 'react-native-paper';
import {Measurement} from '@/app/models/Measurement';
import {AllAssessmentsScreenNavigationProps} from '@/features/navigation/types.tsx';
import LinearGradient from 'react-native-linear-gradient';
import ExportPdf from '@/features/pdfExport/components/ExportPdf';

const AllAssessmentsScreen: React.FC<AllAssessmentsScreenNavigationProps> = ({
  navigation,
}) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const assessments = useQuery(Measurement, collection =>
    collection.sorted('createdAt', true),
  );

  const getIcon = (score: number) => {
    if (score < 30) {
      return 'emoticon-sad-outline';
    } else if (score < 45) {
      return 'emoticon-neutral-outline';
    } else {
      return 'emoticon-happy-outline';
    }
  };

  const getIconColor = (score: number) => {
    if (score < 6) {
      return '#F44336';
    } else if (score < 15) {
      return '#F49503';
    } else if (score < 30) {
      return '#F0E106';
    } else if (score < 45) {
      return '#74D400';
    } else {
      return '#4CAF50';
    }
  };

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
        <ScrollView style={styles.scrollview}>
          <ExportPdf />
          <Divider style={styles.divider} />
          {assessments.map((assessment, index) => (
            <List.Item
              key={index}
              title={assessment.createdAt.toLocaleDateString()}
              description={`${t('measurements:score')}: ${assessment.score}`}
              // eslint-disable-next-line react/no-unstable-nested-components
              left={() => (
                <List.Icon
                  color={getIconColor(assessment.score)}
                  icon={getIcon(assessment.score)}
                />
              )}
              // eslint-disable-next-line react/no-unstable-nested-components
              right={() => <List.Icon color="#afafaf" icon="pencil" />}
              onPress={() => {
                navigation.navigate('EditAssessment', {
                  assessmentId: assessment._id.toHexString(),
                });
              }}
            />
          ))}
          <Divider style={styles.divider} />
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
    padding: 20,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  scrollview: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  assessmentItem: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  divider: {
    marginVertical: 20,
  },
});

export default AllAssessmentsScreen;
