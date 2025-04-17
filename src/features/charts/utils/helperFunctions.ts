import { Assessment, Pet } from "@core/database";
import moment from "moment";
import { CHART_CONSTANTS, ChartDateRange, ProcessedChartData, ScoreMetadata } from "../types";

/**
 * Calculates the date range for a chart based on the provided assessments, pet status, and other parameters.
 *
 * @param {Assessment[] | null} assessments - The list of assessments or null if there are none.
 * @param {Pet | undefined} pet - The pet object which may contain a paused date.
 * @param {boolean} isWeekly - Determines if the date range should be calculated on a weekly basis.
 * @param {number} maxDays - The maximum number of days to include in the date range.
 * @param {boolean} padding - Whether to pad the date range to the start and end of the week/day. Defaults to true.
 * @returns {ChartDateRange} - An object containing the start and end dates of the calculated date range.
 */
export const calculateDateRange = (
  assessments: Assessment[] | null,
  pet: Pet | undefined,
  isWeekly: boolean,
  maxDays: number,
  padding: boolean = true
): ChartDateRange => {
  const today = new Date();
  const pausedDate = pet?.pausedAt ?? today;
  const hasAssessments = assessments && assessments.length > 0;

  let end;
  if (hasAssessments && !pet?.pausedAt) {
    end = today;
  } else if (hasAssessments) {
    end = assessments[assessments.length - 1].date;
  } else {
    end = pausedDate;
  }

  const firstAssessmentDate = hasAssessments ? assessments[0].date : null;

  // Determine start date based on available data
  const maxDaysAgo = moment(end).subtract(maxDays, 'days');
  let start = firstAssessmentDate 
    ? (padding 
        ? moment.min(moment(firstAssessmentDate), maxDaysAgo)
        : moment(firstAssessmentDate)
      ).startOf(isWeekly ? 'isoWeek' : 'day').toDate()
    : maxDaysAgo.startOf(isWeekly ? 'isoWeek' : 'day').toDate();

  const finalEnd = hasAssessments && !padding
    ? moment(assessments[assessments.length - 1].date)
        .endOf(isWeekly ? 'isoWeek' : 'day').toDate()
    : moment(end).endOf(isWeekly ? 'isoWeek' : 'day').toDate();

    console.log("start", start.toString());
    console.log("end", finalEnd.toString());

  return {
    startDate: start,
    endDate: finalEnd,
  };
};

/**
 * Generates an array of dates between the specified start and end dates.
 * If `isWeekly` is true, only dates that are Mondays (start of the ISO week) are included.
 * 
 * @param {Date} startDate - The start date of the range.
 * @param {Date} endDate - The end date of the range.
 * @param {boolean} isWeekly - If true, only include dates that are Mondays.
 * @returns {Date[]} An array of dates between the start and end dates.
 */
export const generateDateRange = (startDate: Date, endDate: Date, isWeekly: boolean): Date[] => {
  const range: Date[] = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    if (!isWeekly || moment(currentDate).isoWeekday() === 1) {
      range.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return range;
};

/**
 * Processes daily scores for a given date range and assessments.
 *
 * @param {Date[]} dateRange - An array of dates representing the range to process.
 * @param {Results<Measurement> | null} assessments - An array of assessment results or null if no assessments are available.
 * @returns {ScoreMetadata[]} An array of score metadata objects for each date in the date range.
 *
 * Each score metadata object contains:
 * - `score`: The score for the date. If there is no assessment for the date, it defaults to `CHART_CONSTANTS.DEFAULT_SCORE`.
 * - `dotType`: The type of dot to display on the chart. It can be 'actual', 'filler', or 'empty'.
 * - `assessmentDates`: An array containing the date for which the score is calculated.
 *
 * If no assessments are available, the function maps the date range to default scores.
 * If assessments are available, it creates a map for quick lookup of assessments by date.
 * It then processes the date range to determine the score and dot type for each date.
 */
export const processDailyScores = (
  dateRange: Date[],
  assessments: Assessment[] | null
): ScoreMetadata[] => {
  if (!assessments?.length) {
    return dateRange.map((date, index) => ({
      score: index === dateRange.length - 1 ? null : CHART_CONSTANTS.DEFAULT_SCORE,
      dotType: index === dateRange.length - 1 ? 'empty' : 'filler',
      assessmentDates: [date],
    }));
  }

  // Create a map for quick lookup of assessments by date
  const assessmentMap = new Map(
    assessments.map(a => [moment(a.date).format('YYYY-MM-DD'), a])
  );

  // Find the first assessment index in the dateRange
  const firstAssessmentIndex = dateRange.findIndex(date =>
    assessmentMap.has(moment(date).format('YYYY-MM-DD'))
  );

  // Process the date range
  return dateRange.map((date, index) => {
    const dateKey = moment(date).format('YYYY-MM-DD');
    const assessment = assessmentMap.get(dateKey);

    if (assessment) {
      // If there's an assessment for this date, use its score
      return {
        score: assessment.score,
        dotType: 'actual',
        assessmentDates: [date],
      };
    }

    // Handle dates without assessments
    const isLastDate = index === dateRange.length - 1;

    if (index < firstAssessmentIndex || firstAssessmentIndex === -1) {
      // Before the first assessment, return default score
      return {
        score: CHART_CONSTANTS.DEFAULT_SCORE,
        dotType: 'filler',
        assessmentDates: [date],
      };
    }

    // Find the most recent previous assessment
    const previousAssessment = dateRange
      .slice(0, index)
      .reverse()
      .map(prevDate => assessmentMap.get(moment(prevDate).format('YYYY-MM-DD')))
      .find(prev => !!prev);

    return {
      score: previousAssessment?.score || CHART_CONSTANTS.DEFAULT_SCORE,
      dotType: isLastDate ? 'empty' : 'filler',
      assessmentDates: [date],
    };
  });
};


/**
 * Processes weekly scores based on a given date range and assessments.
 *
 * @param {Date[]} dateRange - An array of dates representing the start of each week.
 * @param {Results<Measurement> | null} assessments - An array of assessment results or null.
 * @returns {ScoreMetadata[]} An array of score metadata for each week in the date range.
 *
 * The function calculates the score for each week in the date range. If there are no assessments
 * for a week, it uses the previous week's score or a default score. If there are assessments,
 * it calculates the average score for the week. The function also determines the type of dot
 * to display on the chart based on the number of assessments.
 *
 * Each element in the returned array contains:
 * - `score`: The calculated score for the week.
 * - `dotType`: The type of dot to display ('actual', 'average', 'filler', or 'empty').
 * - `assessmentDates`: An array of dates when assessments were created, sorted in ascending order.
 */
export const processWeeklyScores = (
  dateRange: Date[],
  assessments: Assessment[] | null
): ScoreMetadata[] => {
  // Default score for weeks with no assessments
  let previousWeekScore: number = CHART_CONSTANTS.DEFAULT_SCORE;

  if (!assessments?.length) {
    // No assessments, map the entire date range to default or empty scores
    return dateRange.map((monday, index) => ({
      score: index === dateRange.length - 1 ? null : CHART_CONSTANTS.DEFAULT_SCORE,
      dotType: index === dateRange.length - 1 ? 'empty' : 'filler',
      assessmentDates: [monday],
    }));
  }

  return dateRange.map(monday => {
    const weekStart = moment(monday).startOf('isoWeek');
    const weekEnd = moment(monday).endOf('isoWeek');

    // Filter assessments falling within the current week
    const weekAssessments = assessments.filter(a =>
      moment(a.date).isBetween(weekStart, weekEnd, 'day', '[]')
    );

    if (!weekAssessments.length) {
      // If no assessments, use the previous week's score
      const isLastWeek = moment(monday).isSame(moment(), 'week');
      return {
        score: previousWeekScore,
        dotType: isLastWeek ? 'empty' : 'filler',
        assessmentDates: [monday],
      };
    }

    // Process week with assessments
    const score =
      weekAssessments.length === 1
        ? weekAssessments[0].score
        : Math.round(
            weekAssessments.reduce((sum, a) => sum + a.score, 0) / weekAssessments.length
          );

    const dotType = weekAssessments.length === 1 ? 'actual' : 'average';

    previousWeekScore = score; // Update the previous week's score

    return {
      score,
      dotType,
      assessmentDates: weekAssessments.map(a => new Date(a.date)).sort((a, b) => a.getTime() - b.getTime()),
    };
  });
};

/**
 * Generates chart data based on the provided date range and assessments.
 *
 * @param dateRange - An array of Date objects representing the range of dates for the chart.
 * @param assessments - The assessment results, which can be either a Results<Measurement> object or null.
 * @param isWeekly - A boolean indicating whether the chart data should be processed weekly or daily.
 * @returns An object containing processed chart data, including scores, dot types, metadata, and labels.
 */
export const generateChartData = (dateRange: Date[], assessments: Assessment[] | null, isWeekly: boolean): ProcessedChartData => {
  const scoreData = isWeekly
    ? processWeeklyScores(dateRange, assessments)
    : processDailyScores(dateRange, assessments);

    console.log("scoreData", scoreData);

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
}