import {useEffect, useState} from 'react';
import {useTheme} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useQuery} from '@realm/react';
import {Measurement} from '@/app/models/Measurement';
import {Platform} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import {STORAGE_KEYS} from '@/app/store/storageKeys';
import AsyncStorage from '@react-native-async-storage/async-storage';
import getValueColor from '@/support/helpers/RatingsHelper';
import Share from 'react-native-share';

const useAssessmentExporter = () => {
  const {t} = useTranslation();
  const theme = useTheme();
  const assessments = useQuery(Measurement, collection =>
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
            @media print { * { -webkit-print-color-adjust: exact !important; } }
              body {
                  font-size: 16px;
                  color: #000000;
                  padding: 40px;
              }
              h1 {
                  text-align: center;
                  font-family: "Inter", sans-serif;
              }
              .assessment {
                  margin-top: 20px;
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
              .page-break-before {
                display: block;
                page-break-before: always; 
                page-break-after: auto;
                page-break-inside: avoid;
            }
          </style>
      </head>
      <body>
          <h1>${petName}</h1>
          <div class="confirmationBox_content">
          ${assessments
            .map((assessment, index) => {
              let pageBreak = '';
              if ((index + 1) % 8 === 0) {
                pageBreak = '<div class="page-break-before"> </div>';
              }
              return `${pageBreak}
              <div class="assessment" key=${assessment._id.toHexString()}>
                  <div class="row">
                      <p class="date">${assessment.createdAt.toLocaleDateString()}</p>
                      <p class="score">${assessment.score}</p>
                  </div>
                  <div class="row">
                      <p class="item" style="background-color: ${getItemColor(
                        assessment.hurt,
                      )}">${t('measurements:hurt')}:${assessment.hurt}</p>

                      <p class="item" style="background-color: ${getItemColor(
                        assessment.hydration,
                      )}">${t('measurements:hydration')}:${
                assessment.hydration
              }</p>

                      <p class="item" style="background-color: ${getItemColor(
                        assessment.happiness,
                      )}">${t('measurements:happiness')}:${
                assessment.happiness
              }</p>
                  </div>

                  <div class="row">
                      <p class="item" style="background-color: ${getItemColor(
                        assessment.hurt,
                      )}">${t('measurements:hunger')}:${assessment.hunger}</p>

                      <p class="item" style="background-color: ${getItemColor(
                        assessment.hygiene,
                      )}">${t('measurements:hygiene')}:${assessment.hygiene}</p>

                      <p class="item" style="background-color: ${getItemColor(
                        assessment.mobility,
                      )}">${t('measurements:mobility')}:${
                assessment.mobility
              }</p>
                  </div>
              </div>`;
            })
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
      await Share.open({url: `file://${filePath}`});
    }
  };

  return {generateAndSharePDF};
};

export default useAssessmentExporter;
