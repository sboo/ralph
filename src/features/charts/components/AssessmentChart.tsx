import React, { RefObject, useCallback, useMemo, useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Icon, useTheme } from 'react-native-paper';
import moment from 'moment';
import CustomDot from '@/support/components/CustomChartDot';
import useAssessments from '@/features/assessments/hooks/useAssessments';
import usePet from '@/features/pets/hooks/usePet';

interface AssessmentChartProps {
  onDataPointClick?: (date: Date) => void;
}

const AssessmentChart: React.FC<AssessmentChartProps> = ({ onDataPointClick }) => {
  const [chartWidthMultiplier, setChartWidthMultiplier] = useState(1);
  const chartScrollViewRef = useRef<ScrollView>();
  const theme = useTheme();
  const { activePet } = usePet();
  const { assessments } = useAssessments(activePet);

  // Memoized date calculations
  const { startDate, endDate } = useMemo(() => {
    const end = activePet?.pausedAt
      ? (assessments?.[assessments.length - 1]?.createdAt || new Date())
      : new Date();
    const start = assessments?.[0]?.createdAt || moment(end).subtract(7, 'days').toDate();

    return {
      startDate: moment.min(moment(start), moment(end).subtract(7, 'days')).startOf('day').toDate(),
      endDate: moment(end).endOf('day').toDate()
    };
  }, [activePet?.pausedAt, assessments]);

  // Memoized date range
  const dateRange = useMemo(() => {
    const range: Date[] = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      range.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return range;
  }, [startDate, endDate]);

  // Memoized scores calculation
  const { scoresWithDates, labels, dotTypes } = useMemo(() => {
    const assessmentMap = new Map(
      assessments?.map(a => [moment(a.date).format('YYYY-MM-DD'), a]) || []
    );

    const scoresWithMetadata = dateRange.map((date, index, arr) => {
      const dateKey = moment(date).format('YYYY-MM-DD');
      const assessment = assessmentMap.get(dateKey);

      // If there are no assessments at all, handle differently
      if (assessments?.length === 0) {
        // Only mark the last point as empty, all others as filler with a default score
        if (index === arr.length - 1) {
          return { score: null, dotType: 'empty' };
        }
        return { score: 0, dotType: 'filler' }; // Use a default score of 30 or any other default value
      }

      if (assessment) {
        return { score: assessment.score, dotType: 'actual' };
      }

      // Find the first assessment date
      let firstAssessmentIndex = -1;
      dateRange.forEach((date, index) => {
        if (firstAssessmentIndex === -1) {
          const dateKey = moment(date).format('YYYY-MM-DD');
          if (assessmentMap.has(dateKey)) {
            firstAssessmentIndex = index;
          }
        }
      });

      const isLastScore = index === arr.length - 1;

      // Find previous valid score
      for (let i = index - 1; i >= 0; i--) {
        const prevDate = moment(dateRange[i]).format('YYYY-MM-DD');
        const prevAssessment = assessmentMap.get(prevDate);
        if (prevAssessment) {
          return { score: prevAssessment.score, dotType: isLastScore ? 'empty' : 'filler' };
        } 
      }
      if (firstAssessmentIndex === -1 || index < firstAssessmentIndex) {
        return { score: 0, dotType: 'filler' };
      }
      return { score: 0, dotType: 'empty' };
    });

    return {
      scoresWithDates: scoresWithMetadata.map(item => item.score ?? 0),
      dotTypes: scoresWithMetadata.map(item => item.dotType),
      labels: dateRange.map(date =>
        date.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })
      ),
    };
  }, [dateRange, assessments]);

  // Memoized chart data
  const data = useMemo(() => ({
    labels,
    datasets: [
      { data: scoresWithDates },
      {
        data: Array(scoresWithDates.length).fill(30),
        withDots: false,
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      },
      { data: [0], withDots: false },
      { data: [60], withDots: false },
    ],
  }), [labels, scoresWithDates]);

  // Memoized chart config
  const chartConfig = useMemo(() => ({
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
  }), [theme.colors]);

  // Memoized render dot content
  const renderDotContent = useCallback(({ x, y, index, indexData }: { x: number, y: number, index: number, indexData: number }) => (
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
  ), [data.datasets, dotTypes, activePet?.pausedAt, dateRange, onDataPointClick]);

  // Update chart width when necessary
  React.useEffect(() => {
    const daysDiff = moment(endDate).diff(startDate, 'days');
    setChartWidthMultiplier(Math.max(1, daysDiff / 9));
  }, [startDate, endDate]);

  return (
    <View style={[styles.chartContainer, { backgroundColor: theme.colors.primaryContainer }]}>
      <View style={styles.chartLabels}>
        <Icon size={20} source="emoticon-excited-outline" color="#4CAF50" />
        <Icon size={20} source="emoticon-neutral-outline" color="#F49503" />
        <Icon size={20} source="emoticon-sad-outline" color="#F44336" />
      </View>
      <ScrollView
        style={styles.chartScrollView}
        horizontal
        ref={chartScrollViewRef as RefObject<ScrollView>}
        onContentSizeChange={() =>
          chartScrollViewRef.current?.scrollToEnd({ animated: false })
        }
      >
        <LineChart
          style={styles.chart}
          data={data}
          width={Dimensions.get('window').width * chartWidthMultiplier - 40}
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