import {useTheme} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {Platform} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import {getValueColor} from '@/support/helpers/ColorHelper';
import Share from 'react-native-share';
import usePet from '@/features/pets/hooks/usePet';
import useAssessments from '@/features/assessments/hooks/useAssessments';
import {getBase64Image} from '@/support/helpers/ImageHelper';

const useAssessmentExporter = () => {
  const {t} = useTranslation();
  const theme = useTheme();
  const {activePet, getHeaderColor} = usePet();
  const {assessments} = useAssessments(activePet);

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

  const generateChartScript = () => {
    if (!assessments?.length) return '';

    // Filter assessments to last 3 weeks
    const threeWeeksAgo = new Date();
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21); // 21 days = 3 weeks
    
    const recentAssessments = assessments
      .filter(a => new Date(a.createdAt) >= threeWeeksAgo)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Get dates and scores for the chart
    const dates = recentAssessments.map(a => 
      a.createdAt.toLocaleDateString(undefined, {month: 'numeric', day: 'numeric'})
    ).join("','");
    const scores = recentAssessments.map(a => a.score).join(',');

    return `
      <script>
        function drawChart() {
          const canvas = document.getElementById('assessmentChart');
          const ctx = canvas.getContext('2d');
          
          const dates = ['${dates}'];
          const scores = [${scores}];
          
          const padding = {
            left: 30,
            right: 80,
            top: 40,
            bottom: 40
          };
          
          const width = canvas.width - (padding.left + padding.right);
          const height = canvas.height - (padding.top + padding.bottom);

          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw threshold line at 35
          const thresholdY = padding.top + (height - (height * 35) / 60);
          ctx.strokeStyle = '#9CA3AF';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(padding.left, thresholdY);
          ctx.lineTo(canvas.width - padding.right, thresholdY);
          ctx.stroke();
          ctx.setLineDash([]);

          // Draw axes
          ctx.strokeStyle = '#666666';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(padding.left, padding.top);
          ctx.lineTo(padding.left, canvas.height - padding.bottom);
          ctx.lineTo(canvas.width - padding.right, canvas.height - padding.bottom);
          ctx.stroke();

          // Y-axis labels
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#666666';
          for (let i = 0; i <= 6; i++) {
            const value = i * 10;
            const y = padding.top + (height - (height * value) / 60);
            ctx.fillText(value.toString(), padding.left - 5, y);
          }

          // Only draw the chart if we have data
          if (dates.length > 0) {
            // X-axis labels
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            const step = width / Math.max(dates.length - 1, 1); // Avoid division by zero if only one point
            dates.forEach((date, i) => {
              const x = padding.left + i * step;
              ctx.save();
              ctx.translate(x, canvas.height - padding.bottom + 15);
              ctx.rotate(Math.PI / 4);
              ctx.fillText(date, 0, 0);
              ctx.restore();
            });

            // Draw curve
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2.5;
            
            const points = scores.map((score, i) => ({
              x: padding.left + i * step,
              y: padding.top + (height - (height * score) / 60)
            }));
            
            if (points.length >= 2) {
              ctx.beginPath();
              ctx.moveTo(points[0].x, points[0].y);
              
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
                
                ctx.bezierCurveTo(
                  controlPoint1.x, controlPoint1.y,
                  controlPoint2.x, controlPoint2.y,
                  next.x, next.y
                );
              }
              ctx.stroke();
            } else if (points.length === 1) {
              // If we only have one point, draw it without a line
              ctx.beginPath();
              ctx.moveTo(points[0].x, points[0].y);
              ctx.stroke();
            }
                      
            // Draw points
            points.forEach(point => {
              // White fill
              ctx.beginPath();
              ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
              ctx.fillStyle = '#ffffff';
              ctx.fill();
              
              // Black border
              ctx.beginPath();
              ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
              ctx.strokeStyle = '#000000';
              ctx.lineWidth = 2;
              ctx.stroke();
            });
          } else {
            // Draw "No data" message if no recent assessments
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#666666';
            ctx.font = '14px Inter';
            ctx.fillText('No assessments in the last 3 weeks', canvas.width / 2, canvas.height / 2);
          }
        }
      </script>
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
          ${generateChartScript()}
          <style>
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
      <body onload="drawChart()">
        <div class="top-section">
        <div class="header-section">
          <div class="row">
            <h1>${activePet?.name}</h1>
            ${avatar}
          </div>
        </div>
          <div class="chart-container">
            <canvas id="assessmentChart" width="780" height="400"></canvas>
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