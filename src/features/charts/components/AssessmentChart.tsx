import React, { RefObject, useCallback, useMemo, useRef } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Icon, useTheme } from 'react-native-paper';
import moment from 'moment';
import CustomDot from '@/support/components/CustomChartDot';
import useAssessments from '@/features/assessments/hooks/useAssessments';
import usePet from '@/features/pets/hooks/usePet';
import { Results } from 'realm';
import { Measurement } from '@/app/models/Measurement';
import { AssessmentChartProps, CHART_CONSTANTS, ChartDateRange, DotType, EMOTIONS, ProcessedChartData, ScoreMetadata } from '../types';
import { calculateDateRange, generateDateRange, processWeeklyScores, processDailyScores } from '../utils/helperFunctions';


const AssessmentChart: React.FC<AssessmentChartProps> = ({ onDataPointClick }) => {
  const chartScrollViewRef = useRef<ScrollView>();
  const theme = useTheme();
  const { activePet } = usePet();
  const { assessments } = useAssessments(activePet);
  const isWeekly = activePet?.assessmentFrequency === 'WEEKLY';
  const windowWidth = Dimensions.get('window').width;

  const { startDate, endDate } = useMemo(
    () => calculateDateRange(assessments, activePet, isWeekly),
    [activePet?.pausedAt, assessments, isWeekly]
  );

  const dateRange = useMemo(
    () => generateDateRange(startDate, endDate, isWeekly),
    [startDate, endDate, isWeekly]
  );

  const { scoresWithDates, labels, dotTypes }: ProcessedChartData = useMemo(() => {
    const scoreData = isWeekly
      ? processWeeklyScores(dateRange, assessments)
      : processDailyScores(dateRange, assessments);

    return {
      scoresWithDates: scoreData.map(item => (item.score ?? CHART_CONSTANTS.DEFAULT_SCORE)),
      dotTypes: scoreData.map(item => item.dotType),
      labels: dateRange.map(date =>
        isWeekly
          ? `W${moment(date).isoWeek()}`
          : date.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })
      ),
    };
  }, [dateRange, assessments, isWeekly]);

  const chartWidth = useMemo(() => {
    const diff = moment(endDate).diff(startDate, isWeekly ? 'weeks' : 'days');
    const multiplier = Math.max(1, diff / 9);
    return windowWidth * multiplier - 40;
  }, [windowWidth, isWeekly, startDate, endDate]);

  const chartConfig = useMemo(
    () => ({
      fillShadowGradientToOpacity: 0,
      fillShadowGradientFromOpacity: 0,
      backgroundGradientFrom: theme.colors.primaryContainer,
      backgroundGradientTo: theme.colors.primaryContainer,
      backgroundGradientFromOpacity: 0,
      backgroundGradientToOpacity: 0,
      decimalPlaces: 0,
      color: () => theme.colors.onPrimaryContainer,
      labelColor: () => theme.colors.onPrimaryContainer,
      propsForDots: {
        r: '2',
        strokeWidth: '2',
        stroke: '#fff',
      },
    }),
    [theme.colors]
  );

  const chartData = useMemo(
    () => ({
      labels,
      datasets: [
        { data: scoresWithDates },
        {
          data: Array(scoresWithDates.length).fill(CHART_CONSTANTS.NEUTRAL_SCORE),
          withDots: false,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        },
        { data: [CHART_CONSTANTS.DEFAULT_SCORE], withDots: false },
        { data: [CHART_CONSTANTS.MAX_SCORE], withDots: false },
      ],
    }),
    [labels, scoresWithDates]
  );

  const renderDotContent = useCallback(
    ({ x, y, index, indexData }: { x: number; y: number; index: number; indexData: number }) => (
      <CustomDot
        key={index}
        value={indexData}
        index={index}
        x={x}
        y={y}
        paused={Boolean(activePet?.pausedAt)}
        dotType={dotTypes[index]}
        onDotPress={(idx, value) => onDataPointClick?.(dateRange[idx])}
      />
    ),
    [dotTypes, activePet?.pausedAt, dateRange, onDataPointClick]
  );

  return (
    <View style={[styles.chartContainer, { backgroundColor: theme.colors.primaryContainer }]}>
      <View style={styles.chartLabels}>
        {Object.values(EMOTIONS).map(({ icon, color }) => (
          <Icon key={icon} size={20} source={icon} color={color} />
        ))}
      </View>
      <ScrollView
        style={styles.chartScrollView}
        horizontal
        ref={chartScrollViewRef as RefObject<ScrollView>}
        onContentSizeChange={() => chartScrollViewRef.current?.scrollToEnd({ animated: false })}
      >
        <LineChart
          style={styles.chart}
          data={chartData}
          width={chartWidth}
          height={200}
          yAxisLabel=""
          yAxisSuffix=""
          fromZero
          withInnerLines={false}
          withOuterLines={false}
          withHorizontalLabels={false}
          verticalLabelRotation={-45}
          xLabelsOffset={10}
          chartConfig={chartConfig}
          renderDotContent={renderDotContent}
          bezier
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    paddingHorizontal: 15,
  },
  chartScrollView: {
    marginLeft: 50,
    paddingBottom: 10,
  },
  chart: {
    paddingRight: 10,
  },
  chartLabels: {
    justifyContent: 'space-around',
    height: 195,
    left: 15,
    position: 'absolute',
  },
});

export default React.memo(AssessmentChart);