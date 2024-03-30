import React, {useEffect, useState} from 'react';
import {Button, useTheme} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useQuery} from '@realm/react';
import {Measurement} from '@/app/models/Measurement';
import {Platform} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import {StyleSheet} from 'react-native';
import {STORAGE_KEYS} from '@/app/store/storageKeys';
import AsyncStorage from '@react-native-async-storage/async-storage';
import getValueColor from '@/support/helpers/RatingsHelper';

const ExportPdf: React.FC = () => {
  const {t} = useTranslation();
  const theme = useTheme();
  const measurements = useQuery(Measurement, collection =>
    collection.sorted('createdAt'),
  );
  const [petType, setPetType] = useState<string>('');
  const [petName, setPetName] = useState<string>('');

  // Load pet name and type from storage
  useEffect(() => {
    const fetchPetName = async () => {
      const name = await AsyncStorage.getItem(STORAGE_KEYS.PET_NAME);
      if (name !== null) {
        setPetName(name);
      }
    };
    const fetchPetType = async () => {
      const type = await AsyncStorage.getItem(STORAGE_KEYS.PET_TYPE);
      setPetType(type ?? '');
    };

    fetchPetName();
    fetchPetType();
  }, []);

  const getItemColor = (score: number) => {
    const color = getValueColor(theme.colors.outline, score);
    return `${color}AA`;
  };

  const getHtmlContent = () => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Pdf Content</title>
          <style>
              body {
                  font-size: 16px;
                  color: #000000;
                  padding: 40px;
              }
              h1 {
                  text-align: center;
              }
              .measurement {
                  margin-bottom: 20px;
              }
              p {
                  margin: 0;
                  padding: 0;
              }
              .row {
                  display: flex;
                  flex-direction: row;
                  flex-wrap: wrap;
                  justify-content: space-between;
              }
              .date {
                  font-family: "Inter", sans-serif;
                  font-weight: 700;
                  color: #000000;
                  background-color: #f0f0f0;
                  font-size: 17px;
                  padding: 5px;
                  flex-grow: 1;
              }
              .score {
                  font-family: "Inter", sans-serif;
                  font-weight: 700;
                  color: #000000;
                  background-color: #f0f0f0;
                  font-size: 17px;
                  text-align: right;
                  flex-wrap: wrap;
                  padding: 5px;
              }
              .item {
                  font-family: "Inter", sans-serif;
                  font-weight: 400;
                  color: #000000;
                  font-size: 12px;
                  flex-wrap: wrap;
                  padding: 5px;
                  flex: 1 1 0px;
              }
          </style>
      </head>
      <body>
          <h1>${petName}</h1>
          <div class="confirmationBox_content">
          ${measurements
            .map(
              measurement =>
                `<div
                    class="measurement"
                    key=${measurement._id.toHexString()}
  
                  >
                  <div class="row">
                      <p class="date">${measurement.createdAt.toLocaleDateString()}</p>
                      <p class="score">${measurement.score}</p>
                  </div>
                  <div class="row">
                      <p class="item" style="background-color: ${getItemColor(
                        measurement.hurt,
                      )}">${t('measurements:hurt')}:${measurement.hurt}</p>

                      <p class="item" style="background-color: ${getItemColor(
                        measurement.hydration,
                      )}">${t('measurements:hydration')}:${
                  measurement.hydration
                }</p>

                      <p class="item" style="background-color: ${getItemColor(
                        measurement.happiness,
                      )}">${t('measurements:happiness')}:${
                  measurement.happiness
                }</p>
                  </div>

                  <div class="row">
                      <p class="item" style="background-color: ${getItemColor(
                        measurement.hurt,
                      )}">${t('measurements:hunger')}:${measurement.hunger}</p>

                      <p class="item" style="background-color: ${getItemColor(
                        measurement.hygiene,
                      )}">${t('measurements:hygiene')}:${
                  measurement.hygiene
                }</p>

                      <p class="item" style="background-color: ${getItemColor(
                        measurement.mobility,
                      )}">${t('measurements:mobility')}:${
                  measurement.mobility
                }</p>
                  </div>
              </div>`,
            )
            .join('')}
      </div>
      </body>
      </html>
  `;
  };

  const createPDF = async (): Promise<string | null> => {
    try {
      let PDFOptions = {
        html: getHtmlContent(),
        fileName: 'assessments',
        directory: Platform.OS === 'android' ? 'Downloads' : 'Documents',
      };
      let file = await RNHTMLtoPDF.convert(PDFOptions);
      if (!file.filePath) {
        return null;
      }
      return file.filePath;
    } catch (error) {
      console.error('Failed to generate pdf', error.message);
      return null;
    }
  };

  const generateAndSharePDF = async () => {
    const filePath = await createPDF();
    if (filePath) {
      // Share the PDF file
      // Share.open({url: filePath});
    }
  };

  return (
    <Button
      style={styles.button}
      mode={'contained'}
      onPress={() => generateAndSharePDF()}>
      {t('generate_pdf')}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    margin: 20,
  },
});

export default ExportPdf;
