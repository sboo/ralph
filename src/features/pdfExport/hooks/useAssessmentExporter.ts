import { database } from '@/core/database';
import { Assessment } from '@/core/database/models/Assessment';
import { Pet } from '@/core/database/models/Pet';
import { DotType } from '@/features/charts/types';
import { calculateDateRange, generateChartData, generateDateRange } from '@/features/charts/utils/helperFunctions';
import { getValueColor } from '@/shared/helpers/ColorHelper';
import { getBase64Image } from '@/shared/helpers/ImageHelper';
import { Q } from '@nozbe/watermelondb';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { useTheme } from 'react-native-paper';
import Share from 'react-native-share';
import { map } from 'rxjs/operators';

const useAssessmentExporter = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [activePet, setActivePet] = useState<Pet | undefined>(undefined);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [customTrackingSettings, setCustomTrackingSettings] = useState<any>({});
  const isWeekly = activePet?.assessmentFrequency === 'WEEKLY';

  // Fetch active pet and its assessments
  useEffect(() => {
    const activePetSubscription = database
      .get<Pet>('pets')
      .query(Q.where('is_active', true))
      .observe()
      .pipe(map(pets => pets.length > 0 ? pets[0] : undefined))
      .subscribe(pet => {
        setActivePet(pet);

        // Parse custom tracking settings
        if (pet?.customTrackingSettings) {
          try {
            const settings = typeof pet.customTrackingSettings === 'string'
              ? JSON.parse(pet.customTrackingSettings)
              : pet.customTrackingSettings;
            setCustomTrackingSettings(settings);
          } catch (e) {
            console.error('Error parsing custom tracking settings:', e);
            setCustomTrackingSettings({});
          }
        }
      });

    return () => {
      activePetSubscription.unsubscribe();
    };
  }, []);

  // When active pet changes, fetch its assessments
  useEffect(() => {
    if (!activePet) {
      setAssessments([]);
      return;
    }

    const assessmentsSubscription = database
      .get<Assessment>('assessments')
      .query(Q.where('pet_id', activePet.id), Q.sortBy('date', 'asc'))
      .observe()
      .subscribe(result => {
        setAssessments(result);
      });

    return () => {
      assessmentsSubscription.unsubscribe();
    };
  }, [activePet]);

  const getItemColor = (score: number) => {
    const color = getValueColor(theme.colors.outline, score);
    return `${color}AA`;
  };

  const getAllAssessmentBase64ImagesList = async () => {
    const images = assessments?.flatMap(assessment =>
      Array.from(assessment.images),
    );
    const base64Images: { [key: string]: string } = {};
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
    const { startDate, endDate } = calculateDateRange(assessments, activePet, isWeekly, maxDays, false);
    const dateRange = generateDateRange(startDate, endDate, isWeekly);

    const { scores, labels, dotTypes, metadata } = generateChartData(dateRange, assessments, isWeekly);
    console.log('Chart data:', { scores, labels, dotTypes, metadata });

    const hasOlderData = assessments.some(a => new Date(a.date) < startDate);

    if (scores.length === 0) {
      return `<div style="width: 780px; height: 400px; display: flex; align-items: center; justify-content: center; background-color: transparent; font-family: 'Inter', sans-serif;">
        <span style="color: #666666; font-size: 14px;">${t('measurements:no_assessments_in_last_3_weeks')}</span>
      </div>`;
    }

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
      const x = scores.length === 1
        ? padding.left + (chartWidth / 2)
        : padding.left + (index * (chartWidth / (scores.length - 1)));
      const y = padding.top + (chartHeight - (chartHeight * score / 60));
      return {
        x,
        y,
        score: score,
        date: labels[index],
        dotType: dotTypes[index]
      };
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

    // Helper function to generate point styles based on dotType
    const getPointStyle = (dotType: DotType) => {
      if (dotType === 'filler') {
        return {
          fill: 'white',
          stroke: '#000000',
          radius: 4,
          strokeWidth: 2
        };
      } else {
        return {
          fill: '#000000',
          stroke: 'white',
          radius: 8,
          strokeWidth: 2
        };
      }
    };

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
        ${Array.from({ length: 7 }, (_, i) => i * 10).map(value => `
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

        <!-- Points with different styles based on dotType -->
        ${points.map(point => {
      const style = getPointStyle(point.dotType);
      return `
            <circle cx="${point.x}" cy="${point.y}" r="${style.radius}"
                    fill="${style.fill}" stroke="${style.stroke}" stroke-width="${style.strokeWidth}" />
          `;
    }).join('')}

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
                  background-color: ${theme.colors.primary};
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
                <div class="assessment" key=${assessment.id}>
                    <div class="row">
                        <p class="date">${new Date(assessment.date).toLocaleDateString()}</p>
                        <p class="score">${assessment.score}</p>
                    </div>
                    <div class="row">
                        <p class="item" style="background-color: ${getItemColor(
            assessment.hurt,
          )}">${t(`${activePet?.species}:assessments:hurt`)}:${assessment.hurt
            }</p>

                        <p class="item" style="background-color: ${getItemColor(
              assessment.hydration,
            )}">${t(`${activePet?.species}:assessments:hydration`)}:${assessment.hydration
            }</p>

                        <p class="item" style="background-color: ${getItemColor(
              assessment.happiness,
            )}">${t(`${activePet?.species}:assessments:happiness`)}:${assessment.happiness
            }</p>
                    </div>

                    <div class="row">
                        <p class="item" style="background-color: ${getItemColor(
              assessment.hunger,
            )}">${t(`${activePet?.species}:assessments:hunger`)}:${assessment.hunger
            }</p>

                        <p class="item" style="background-color: ${getItemColor(
              assessment.hygiene,
            )}">${t(`${activePet?.species}:assessments:hygiene`)}:${assessment.hygiene
            }</p>

                        <p class="item" style="background-color: ${getItemColor(
              assessment.mobility,
            )}">${t(`${activePet?.species}:assessments:mobility`)}:${assessment.mobility
            }</p>
            ${assessment.customValue !== undefined && assessment.customValue !== null ?
              `<p class="item" style="background-color: ${getItemColor(
                assessment.customValue,
              )}">${customTrackingSettings.customTrackingName || t('settings:customTrackingFallbackLabel')}:${assessment.customValue}</p>`
              : ''
            }
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
        await Share.open({ url: `file://${filePath}` });
      } catch (error: any) {
        console.log('Failed to share pdf', error.message);
      }
    }
  };

  return { generateAndSharePDF };
};

export default useAssessmentExporter;