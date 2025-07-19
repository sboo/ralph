import { withActivePetAssessments } from '@/core/database/hoc';
import { Assessment } from '@/core/database/models/Assessment';
import { Pet } from '@/core/database/models/Pet';
import CustomDot from '@/shared/components/CustomChartDot';
import { compose } from '@nozbe/watermelondb/react';
import moment from 'moment';
import React, { RefObject, useCallback, useMemo, useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Icon, useTheme } from 'react-native-paper';
import { AssessmentChartProps, CHART_CONSTANTS, EMOTIONS } from '../types';
import { calculateDateRange, generateChartData, generateDateRange } from '../utils/helperFunctions';
import WeeklyAssessmentDialog from './WeeklyAssessmentDialog';

// The presentational component
const AssessmentChartComponent: React.FC<AssessmentChartProps & { 
  activePet: Pet | undefined,
  assessments: Assessment[] 
}> = ({ 
  onDataPointClick, 
  activePet, 
  assessments 
}) => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const chartScrollViewRef = useRef<ScrollView>(null);
  const theme = useTheme();
  const isWeekly = activePet?.assessmentFrequency === 'WEEKLY';
  const windowWidth = Dimensions.get('window').width;

  const maxDays = isWeekly ? CHART_CONSTANTS.WEEKS_TO_SHOW * 7 : CHART_CONSTANTS.DAYS_TO_SHOW;
  const { startDate, endDate } = useMemo(
    () => calculateDateRange(assessments, activePet, isWeekly, maxDays),
    [activePet?.pausedAt, assessments, isWeekly, maxDays]
  );

  const dateRange = useMemo(
    () => generateDateRange(startDate, endDate, isWeekly),
    [startDate, endDate, isWeekly]
  );

  const { scores, labels, dotTypes, metadata } = useMemo (
    () => generateChartData(dateRange, assessments, isWeekly),
    [dateRange, assessments, isWeekly]
  );

  const handleDotPress = useCallback((index: number) => {
    if (!metadata[index]) return;

    const scoreData = metadata[index];

    if (!scoreData.assessmentDates?.length) return;

    if (scoreData.assessmentDates.length === 1) {
      console.log('Single assessment date:', scoreData.assessmentDates[0]);
      // For single assessments, directly call onDataPointClick with the actual date
      onDataPointClick?.(moment(scoreData.assessmentDates[0]).format('YYYY-MM-DD'));
    } else {
      // For averages, show the dialog
      console.log('Opening dialog for dates:', scoreData.assessmentDates);
      setSelectedDates(scoreData.assessmentDates.map(date => moment(date).format('YYYY-MM-DD')));
      setDialogVisible(true);
    }
  }, [isWeekly, metadata, onDataPointClick]);

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
        r: '6',
        strokeWidth: '25',
        stroke: 'transparent',
      },
    }),
    [theme.colors]
  );

  const chartData = useMemo(
    () => ({
      labels,
      datasets: [
        { data: scores },
        {
          data: Array(scores.length).fill(CHART_CONSTANTS.NEUTRAL_SCORE),
          withDots: false,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        },
        { data: [CHART_CONSTANTS.DEFAULT_SCORE], withDots: false },
        { data: [CHART_CONSTANTS.MAX_SCORE], withDots: false },
      ],
    }),
    [labels, scores]
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
        onPress={() => handleDotPress(index)}
      />
    ),
    [dotTypes, activePet?.pausedAt, handleDotPress]
  );

  return (
    <>
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
          onDataPointClick={(data) => handleDotPress(data.index)}
        />
      </ScrollView>
    </View>
    <WeeklyAssessmentDialog
        visible={dialogVisible}
        onDismiss={() => setDialogVisible(false)}
        dates={selectedDates}
        onDateSelect={onDataPointClick || (() => {})}
      />
    </>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    paddingLeft: 15,
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

const enhance: (component: React.ComponentType<any>) => React.ComponentType<any> = compose(
  // Add assessments from active pet, sorted by date ascending
  withActivePetAssessments({
    sortBy: { column: 'date', direction: 'asc' }
  }),
);

// Export the enhanced component
export default enhance(AssessmentChartComponent);