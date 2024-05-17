import {useTheme} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {Platform} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import {getValueColor} from '@/support/helpers/ColorHelper';
import Share from 'react-native-share';
import usePet from '@/features/pets/hooks/usePet';
import useAssessments from '@/features/assessments/hooks/useAssessments';
import {getBase64Image, getImagePath} from '@/support/helpers/ImageHelper';

const useAssessmentExporter = () => {
  const {t} = useTranslation();
  const theme = useTheme();
  const {activePet} = usePet();
  const {assessments} = useAssessments(activePet);

  const getItemColor = (score: number) => {
    const color = getValueColor(theme.colors.outline, score);
    return `${color}AA`;
  };

  const getAllAssessmentBase64ImagesList = async () => {
    const images = assessments?.flatMap(assessment =>
      Array.from(assessment.images),
    );
    console.log('All assessment images', images);
    const base64Images: {[key: string]: string} = {};
    await Promise.all(
      images?.map(async image => {
        const base64Image = await getBase64Image(image);
        base64Images[image] = base64Image;
      }) ?? [],
    );
    return base64Images;
  };

  // console.log('All assessment images', getAllAssessmentBase64Images());

  const getHtmlContent = async () => {
    const base64Images = await getAllAssessmentBase64ImagesList();
    const avatar = activePet?.avatar
      ? `<img src="${await getBase64Image(activePet.avatar)}" class="avatar" />`
      : '';
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
              h1, h2, h3, h4, h5, h6 {
                font-family: "Inter", sans-serif;
             }
             .avatar {
                width: 100px;
                height: 100px;
                border-radius: 50px;
                margin-right: 20px;
             }
              .assessment {
                  margin-top: 40px;
                  page-break-inside: avoid;
              }
              p {
                  margin: 0;
                  padding: 0;
                  font-family: "Inter", sans-serif;
              }
              .row {
                  display: flex;
                  flex-direction: row;
                  flex-wrap: wrap;
                  justify-content: space-between;
              }
              .notesrow {
                  margin-bottom: 10px;
                  font-family: "Inter", sans-serif;
              }
              .imagerow {
                margin-top: 10px;
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                justify-content: flex-start;
                gap: 10px;
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
        <div class="row">
          <h1>${activePet?.name}</h1>
          ${avatar}
        </div>
          <div>
            ${assessments
              ?.map(assessment => {
                let notes = '';
                if (assessment.notes) {
                  notes = `<div class="notesrow">
                            <h5>${t('measurements:notes')}</h5>
                            <p>${assessment.notes
                              .split(/\r?\n/)
                              .join('<br />')}</p>
                          </div>`;
                }
                let images = '';
                if (assessment.images) {
                  images = `<div class="imagerow">
                              ${assessment.images
                                ?.map(
                                  image =>
                                    `<img src="${base64Images[image]}" style="width: 200px; height: 200px;" />`,
                                )
                                .join('')}
                            </div>`;
                }
                return `
                <div class="assessment" key=${assessment._id.toHexString()}>
                    <div class="row">
                        <p class="date">${assessment.createdAt.toLocaleDateString()}</p>
                        <p class="score">${assessment.score}</p>
                    </div>
                    <div class="row">
                        <p class="item" style="background-color: ${getItemColor(
                          assessment.hurt,
                        )}">${t(`${activePet?.species}:assessments:hurt`)}:${
                  assessment.hurt
                }</p>

                        <p class="item" style="background-color: ${getItemColor(
                          assessment.hydration,
                        )}">${t(
                  `${activePet?.species}:assessments:hydration`,
                )}:${assessment.hydration}</p>

                        <p class="item" style="background-color: ${getItemColor(
                          assessment.happiness,
                        )}">${t(
                  `${activePet?.species}:assessments:happiness`,
                )}:${assessment.happiness}</p>
                    </div>

                    <div class="row">
                        <p class="item" style="background-color: ${getItemColor(
                          assessment.hunger,
                        )}">${t(`${activePet?.species}:assessments:hunger`)}:${
                  assessment.hunger
                }</p>

                        <p class="item" style="background-color: ${getItemColor(
                          assessment.hygiene,
                        )}">${t(`${activePet?.species}:assessments:hygiene`)}:${
                  assessment.hygiene
                }</p>

                        <p class="item" style="background-color: ${getItemColor(
                          assessment.mobility,
                        )}">${t(
                  `${activePet?.species}:assessments:mobility`,
                )}:${assessment.mobility}</p>
                    </div>
                    ${notes}
                    ${images}
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
        html: await getHtmlContent(),
        fileName: 'assessments',
        directory: Platform.OS === 'android' ? 'Downloads' : 'Documents',
      };
      let file = await RNHTMLtoPDF.convert(PDFOptions);
      if (!file.filePath) {
        return null;
      }
      return file.filePath;
    } catch (error: any) {
      console.error('Failed to generate pdf', error.message);
      return null;
    }
  };

  const generateAndSharePDF = async () => {
    const filePath = await createPDF();
    if (filePath) {
      // Share the PDF file
      try {
        await Share.open({url: `file://${filePath}`});
      } catch (error: any) {
        console.log('Failed to share pdf', error.message);
      }
    }
  };

  return {generateAndSharePDF};
};

export default useAssessmentExporter;
