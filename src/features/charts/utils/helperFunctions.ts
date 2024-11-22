import { Measurement } from "@/app/models/Measurement";
import { Pet } from "@/app/models/Pet";
import { Results } from "realm";
import { ChartDateRange, CHART_CONSTANTS, ScoreMetadata, DotType } from "../types";
import moment from "moment";

export const calculateDateRange = (
  assessments: Results<Measurement> | null,
  pet: Pet | undefined,
  isWeekly: boolean
): ChartDateRange => {
  const end = pet?.pausedAt
    ? (assessments?.[assessments.length - 1]?.createdAt || new Date())
    : new Date();

  let start;
  if (isWeekly) {
    const sevenWeeksAgo = moment(end).subtract(CHART_CONSTANTS.WEEKS_TO_SHOW, 'weeks').startOf('isoWeek');
    const firstAssessment = assessments?.[0]?.createdAt;

    start = firstAssessment
      ? moment.min(moment(firstAssessment).startOf('isoWeek'), sevenWeeksAgo).toDate()
      : sevenWeeksAgo.toDate();
  } else {
    start = assessments?.[0]?.createdAt || moment(end).subtract(CHART_CONSTANTS.DAYS_TO_SHOW, 'days').toDate();
    start = moment.min(moment(start), moment(end).subtract(CHART_CONSTANTS.DAYS_TO_SHOW, 'days')).toDate();
  }

  return {
    startDate: moment(start).startOf('day').toDate(),
    endDate: moment(end).endOf('day').toDate(),
  };
};

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

export const processDailyScores = (
  dateRange: Date[],
  assessments: Results<Measurement> | null
): ScoreMetadata[] => {
  if (!assessments?.length) {
    return dateRange.map((date, index, arr) => ({
      score: index === arr.length - 1 ? null : CHART_CONSTANTS.DEFAULT_SCORE,
      dotType: index === arr.length - 1 ? 'empty' : 'filler',
      assessmentDates: [date]
    }));
  }

  const assessmentMap = new Map(
    assessments.map(a => [moment(a.date).format('YYYY-MM-DD'), a])
  );

  // Find the first assessment date index
  const firstAssessmentIndex = dateRange.findIndex(date =>
    assessmentMap.has(moment(date).format('YYYY-MM-DD'))
  );

  return dateRange.map((date, index, arr) => {
    const dateKey = moment(date).format('YYYY-MM-DD');
    const assessment = assessmentMap.get(dateKey);

    if (assessment) {
      return { score: assessment.score, dotType: 'actual', assessmentDates: [date] };
    }

    const isLastScore = index === arr.length - 1;

    // If before first assessment, use default score with filler
    if (firstAssessmentIndex === -1 || index < firstAssessmentIndex) {
      return { score: CHART_CONSTANTS.DEFAULT_SCORE, dotType: 'filler', assessmentDates: [date] };
    }

    // Find the most recent previous assessment
    for (let i = index - 1; i >= 0; i--) {
      const prevDate = moment(dateRange[i]).format('YYYY-MM-DD');
      const prevAssessment = assessmentMap.get(prevDate);
      if (prevAssessment) {
        return {
          score: prevAssessment.score,
          dotType: isLastScore ? 'empty' : 'filler',
          assessmentDates: [date]
        };
      }
    }

    return {
      score: CHART_CONSTANTS.DEFAULT_SCORE,
      dotType: isLastScore ? 'empty' : 'filler',
      assessmentDates: [date]
    };
  });
};

export const processWeeklyScores = (
  dateRange: Date[],
  assessments: Results<Measurement> | null
): ScoreMetadata[] => {

  let previousWeekScore: number = CHART_CONSTANTS.DEFAULT_SCORE;

  return dateRange.map((monday, index, arr) => {
    if (!assessments?.length) {
      return index === arr.length - 1
        ? { score: null, dotType: 'empty' as DotType, assessmentDates: [monday] }
        : { score: CHART_CONSTANTS.DEFAULT_SCORE, dotType: 'filler' as DotType, assessmentDates: [monday] };
    }

    const weekStart = moment(monday).startOf('isoWeek');
    const weekEnd = moment(monday).endOf('isoWeek');
    const weekAssessments = assessments.filter(a =>
      moment(a.date).isBetween(weekStart, weekEnd, 'day', '[]')
    );

    if (!weekAssessments.length) {
      const isLastWeek = moment(monday).isSame(moment(), 'week');
      return {
        score: previousWeekScore ?? CHART_CONSTANTS.DEFAULT_SCORE,
        dotType: isLastWeek ? 'empty' as DotType : 'filler' as DotType, 
        assessmentDates: [monday]
      };
    }

    const result = weekAssessments.length === 1
      ? {
        score: weekAssessments[0].score,
        dotType: 'actual' as DotType,
        assessmentDates: [weekAssessments[0].date]
      }
      : {
        score: Math.round(
          weekAssessments.reduce((sum, a) => sum + a.score, 0) / weekAssessments.length
        ),
        dotType: 'average' as DotType,
        assessmentDates: weekAssessments.map(a => a.createdAt).sort((a, b) => a.getTime() - b.getTime())
      };

    previousWeekScore = result.score;
    return result;
  });
};