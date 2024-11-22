import {useTheme} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {Platform} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import {getValueColor} from '@/support/helpers/ColorHelper';
import Share from 'react-native-share';
import usePet from '@/features/pets/hooks/usePet';
import useAssessments from '@/features/assessments/hooks/useAssessments';
import {getBase64Image} from '@/support/helpers/ImageHelper';
import { calculateDateRange, generateDateRange, processWeeklyScores, processDailyScores } from '@/features/charts/utils/helperFunctions';
import { useMemo } from 'react';
import { CHART_CONSTANTS, ProcessedChartData } from '@/features/charts/types';
import moment from 'moment';


const useAssessmentExporter = () => {
  const {t} = useTranslation();
  const theme = useTheme();
  const {activePet, getHeaderColor} = usePet();
  const {assessments} = useAssessments(activePet);
  const isWeekly = activePet?.assessmentFrequency === 'WEEKLY';

  const getItemColor = (score: number) => {
    const color = getValueColor(theme.colors.outline, score);
    return `${color}AA`;
  };

  const getAllAssessmentBase64ImagesList = async () => {
    const images = assessments?.flatMap(assessment =>
      Array.from(assessment.images),
    );
    const base64Images: {[key: string]: string} = {};
    await Promise.all(
      images?.map(async image => {
        const base64Image = await getBase64Image(image);
        base64Images[image] = base64Image;
      }) ?? [],
    );
    return base64Images;
  };

  const generateChart = () => {
    if (!assessments?.length) return '';

    const maxDays = isWeekly ? 70 : 21;
    const { startDate, endDate } = calculateDateRange(assessments, activePet, isWeekly, maxDays);
    const dateRange = generateDateRange(startDate, endDate, isWeekly);

    const { scores, labels, dotTypes, metadata }: ProcessedChartData = ((dateRange, assessments, isWeekly) => {
      const scoreData = isWeekly
        ? processWeeklyScores(dateRange, assessments)
        : processDailyScores(dateRange, assessments);
  
      return {
        scores: scoreData.map(item => (item.score ?? CHART_CONSTANTS.DEFAULT_SCORE)),
        dotTypes: scoreData.map(item => item.dotType),
        metadata: scoreData,
        labels: dateRange.map(date =>
          isWeekly
            ? `W${moment(date).isoWeek()}`
            : date.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })
        ),
      };
    })(dateRange, assessments, isWeekly);


    // Filter assessments to last 3 or 10 weeks, depending on mode

    const hasOlderData = assessments.some(a => new Date(a.createdAt) < startDate);

    if (scores.length === 0) {
      return `<div style="width: 780px; height: 400px; display: flex; align-items: center; justify-content: center; background-color: transparent; font-family: 'Inter', sans-serif;">
        <span style="color: #666666; font-size: 14px;">${t('measurements:no_assessments_in_last_3_weeks')}</span>
      </div>`;
    }

    console.log('scores', scores);

    const padding = {
      left: 30,
      right: 80,
      top: 40,
      bottom: hasOlderData ? 60 : 40
    };

    const width = 780;
    const height = 400;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Create points for the bezier curve
    const points = scores.map((score, index) => {
      // If there's only one point, position it in the center
      const x = scores.length === 1 
        ? padding.left + (chartWidth / 2)  // Center point
        : padding.left + (index * (chartWidth / (scores.length - 1))); // Normal spacing
      
      const y = padding.top + (chartHeight - (chartHeight * score / 60));
      return { x, y, score: score, date: labels[index] };
    });

    // Generate path data for the bezier curve
    let pathData = '';
    if (points.length >= 2) {
      pathData = `M ${points[0].x} ${points[0].y}`;
      
      for (let i = 0; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[i + 1];
        
        const controlPoint1 = {
          x: current.x + (next.x - points[Math.max(0, i - 1)].x) / 6,
          y: current.y + (next.y - points[Math.max(0, i - 1)].y) / 6
        };
        
        const controlPoint2 = {
          x: next.x - (points[Math.min(points.length - 1, i + 2)].x - current.x) / 6,
          y: next.y - (points[Math.min(points.length - 1, i + 2)].y - current.y) / 6
        };
        
        pathData += ` C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${next.x} ${next.y}`;
      }
    }

    return `
      <svg width="${width}" height="${height}" style="background-color: transparent;">
        <!-- Axes -->
        <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}" 
              stroke="#666666" stroke-width="1" />
        <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" 
              stroke="#666666" stroke-width="1" />

        <!-- Threshold line -->
        <line x1="${padding.left}" 
              y1="${padding.top + (chartHeight - (chartHeight * 30 / 60))}" 
              x2="${width - padding.right}" 
              y2="${padding.top + (chartHeight - (chartHeight * 30 / 60))}"
              stroke="#9CA3AF" stroke-width="1" stroke-dasharray="4,4" />

        <!-- Y-axis labels -->
        ${Array.from({length: 7}, (_, i) => i * 10).map(value => `
          <text x="${padding.left - 5}" 
                y="${padding.top + (chartHeight - (chartHeight * value / 60))}"
                text-anchor="end" 
                alignment-baseline="middle"
                font-family="Inter, sans-serif"
                font-size="12"
                fill="#666666">${value}</text>
        `).join('')}

        <!-- X-axis labels -->
        ${points.map(point => `
          <text x="${point.x}" 
                y="${height - padding.bottom + 15}"
                text-anchor="start"
                transform="rotate(45, ${point.x}, ${height - padding.bottom + 15})"
                font-family="Inter, sans-serif"
                font-size="12"
                fill="#666666">${point.date}</text>
        `).join('')}

        <!-- Line (only if more than one point) -->
        ${points.length > 1 ? `
          <path d="${pathData}"
                fill="none"
                stroke="#000000"
                stroke-width="2.5" />
        ` : ''}

        <!-- Points -->
        ${points.map(point => `
          <circle cx="${point.x}" cy="${point.y}" r="4"
                  fill="white" stroke="#000000" stroke-width="2" />
        `).join('')}

        ${hasOlderData ? `
          <text x="${width - padding.right}" 
                y="${height}"
                text-anchor="end"
                font-family="Inter, sans-serif"
                font-style="italic"
                font-size="12"
                fill="#666666">${t('measurements:showing_last_3_weeks_of_data')}</text>
        ` : ''}
      </svg>
    `;
  };

  const headerColor = getHeaderColor(theme);

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
          <title>${activePet?.name}</title>
          <style>
            @font-face {
              font-family: "Inter", sans-serif;
              font-style: normal;
              font-weight: 400;
              src: local('Inter');
            }
            @media print { * { -webkit-print-color-adjust: exact !important; } }
             body {
                  font-size: 16px;
                  color: #000000;
                  padding: 0;
                  margin: 0;
              }
              .header-section {
                  background-color: ${headerColor};
                  color: #ffffff;
                  padding: 40px;
                  border-bottom-left-radius: 25px;
                  border-bottom-right-radius: 25px;
             }
             .top-section {
                  background-color: rgb(219, 225, 255);                  
                  border-bottom-left-radius: 25px;
                  border-bottom-right-radius: 25px;
             }
             .content-section {
                  padding: 0 40px;
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
              .chart-container {
                  margin: 20px 0;
                  padding: 0 40px 40px 40px;
                  page-break-inside: avoid;
                  background-color: transparent;
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
          </style>
      </head>
      <body>
        <div class="top-section">
          <div class="header-section">
            <div class="row">
              <h1>${activePet?.name}</h1>
              ${avatar}
            </div>
          </div>
          <div class="chart-container">
            ${generateChart()}
          </div>
        </div>
        <div class="content-section">
          <div>
            ${assessments
              ?.map(assessment => {
                let notes = '';
                if (assessment.notes) {
                  notes = `<div class="notesrow">
                            <h5>${t('measurements:notes')}</h5>
                            <p>${assessment.notes.split(/\r?\n/).join('<br />')}</p>
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
                        )}">${t(`${activePet?.species}:assessments:hydration`)}:${
                  assessment.hydration
                }</p>

                        <p class="item" style="background-color: ${getItemColor(
                          assessment.happiness,
                        )}">${t(`${activePet?.species}:assessments:happiness`)}:${
                  assessment.happiness
                }</p>
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
                        )}">${t(`${activePet?.species}:assessments:mobility`)}:${
                  assessment.mobility
                }</p>
                    </div>
                    ${notes}
                    ${images}
                </div>`;
              })
              .join('')}
          </div>
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