export type DotType = 'actual' | 'average' | 'empty' | 'filler';

export interface AssessmentChartProps {
    onDataPointClick?: (date: Date) => void;
}

export interface ScoreMetadata {
    score: number | null;
    dotType: DotType;
    assessmentDates?: Date[];
}

export interface ChartDateRange {
    startDate: Date;
    endDate: Date;
}

export interface ProcessedChartData {
    scoresWithDates: number[];
    labels: string[];
    dotTypes: DotType[];
    metadata: ScoreMetadata[];
}

export interface WeeklyDialogProps {
    visible: boolean;
    onDismiss: () => void;
    dates: Date[];
    onDateSelect: (date: Date) => void;
  }

// Constants
export const CHART_CONSTANTS = {
    DEFAULT_SCORE: 0,
    MAX_SCORE: 60,
    NEUTRAL_SCORE: 30,
    WEEKS_TO_SHOW: 7,
    DAYS_TO_SHOW: 7,
} as const;

export const EMOTIONS = {
    HAPPY: { icon: 'emoticon-excited-outline', color: '#4CAF50' },
    NEUTRAL: { icon: 'emoticon-neutral-outline', color: '#F49503' },
    SAD: { icon: 'emoticon-sad-outline', color: '#F44336' },
} as const;