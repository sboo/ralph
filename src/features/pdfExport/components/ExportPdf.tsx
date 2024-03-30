import React from 'react';
import {Button} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {StyleSheet} from 'react-native';
import useAssessmentExporter from '../hooks/useAssessmentExporter';

const ExportPdf: React.FC = () => {
  const {t} = useTranslation();
  const {generateAndSharePDF} = useAssessmentExporter();

  return (
    <Button
      style={styles.button}
      mode={'contained'}
      onPress={() => generateAndSharePDF()}>
      {t('buttons:share_assessments')}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    margin: 20,
  },
});

export default ExportPdf;
