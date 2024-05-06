import useAssessments from '@/features/assessments/hooks/useAssessments';
import usePet from '@/features/pets/hooks/usePet';
import CustomDot from '@/support/components/CustomChartDot';
import moment from 'moment';
import React, {RefObject, useEffect, useMemo, useRef, useState} from 'react';
import {Dimensions, ScrollView, StyleSheet, View} from 'react-native';
import {LineChart} from 'react-native-chart-kit';
import {LineChartData} from 'react-native-chart-kit/dist/line-chart/LineChart';
import {Icon, useTheme} from 'react-native-paper';

interface AssessmentChartProps {
  onDataPointClick?: (date: Date) => void;
}

const AssessmentChart: React.FC<AssessmentChartProps> = ({
  onDataPointClick,
}) => {
  const [chartWidthMultiplier, setChartWidthMultiplier] = useState(1);
  const chartScrollViewRef = useRef<ScrollView>();

  const theme = useTheme();
  const {activePet} = usePet();
  const {assessments} = useAssessments(activePet);

  const scores = useMemo(() => {
    console.log('getScores', assessments?.[0]?.petId);
    // Get the date range for the last 7 days or since the first assessment
    const startDate = (
      assessments && assessments.length > 0
        ? moment.min(
            moment(assessments[0].createdAt),
            moment().subtract(7, 'days'),
          )
        : moment().subtract(7, 'days')
    ).toDate();
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const dateRange = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dateRange.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    const scoresWithDates = dateRange.map(date => {
      const assessment = assessments?.find(
        m => m.date === moment(date).format('YYYY-MM-DD'),
      );
      return assessment ? assessment.score : null;
    });
    const labels = dateRange.map(date =>
      date.toLocaleDateString(undefined, {month: 'numeric', day: 'numeric'}),
    );
    return {scoresWithDates, labels, dateRange};
  }, [assessments]);

  useEffect(() => {
    const firstAssessmentDate =
      assessments && assessments.length > 0
        ? assessments[0].createdAt
        : new Date();
    const daysSinceFirstAssessment = moment().diff(
      moment(firstAssessmentDate),
      'days',
    );
    setChartWidthMultiplier(Math.max(1, daysSinceFirstAssessment / 9));
  }, [assessments]);

  const {scoresWithDates, labels, dateRange} = scores;
  const data = useMemo(() => {
    return {
      labels: labels,
      datasets: [
        {
          data: scoresWithDates,
        },
        {
          data: Array(scoresWithDates.length).fill(30),
          withDots: false,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        },
        {
          data: [0],
          withDots: false,
        },
        {
          data: [60],
          withDots: false,
        },
      ],
    };
  }, [labels, scoresWithDates]);

  return (
    <View
      style={{
        backgroundColor: theme.colors.primaryContainer,
        ...styles.chartContainer,
      }}>
      <View style={styles.chartLabels}>
        <Icon size={20} source={'emoticon-excited-outline'} color="#4CAF50" />
        <Icon size={20} source={'emoticon-neutral-outline'} color="#F49503" />
        <Icon size={20} source={'emoticon-sad-outline'} color="#F44336" />
      </View>
      <ScrollView
        style={styles.chartScrollView}
        horizontal={true}
        ref={chartScrollViewRef as RefObject<ScrollView> | null}
        onContentSizeChange={() =>
          chartScrollViewRef.current?.scrollToEnd({animated: false})
        }>
        <LineChart
          style={styles.chart}
          data={data as LineChartData}
          width={Dimensions.get('window').width * chartWidthMultiplier - 40}
          height={200}
          yAxisLabel=""
          yAxisSuffix=""
          fromZero={true}
          withInnerLines={false}
          withOuterLines={false}
          withHorizontalLabels={false}
          verticalLabelRotation={-45}
          xLabelsOffset={10}
          chartConfig={{
            fillShadowGradientToOpacity: 0,
            fillShadowGradientFromOpacity: 0,
            backgroundGradientFrom: theme.colors.primaryContainer,
            backgroundGradientTo: theme.colors.primaryContainer,
            backgroundGradientFromOpacity: 0,
            backgroundGradientToOpacity: 0,
            decimalPlaces: 0, // optional, defaults to 2dp
            color: () => theme.colors.onPrimaryContainer,
            labelColor: () => theme.colors.onPrimaryContainer,
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#fff',
            },
          }}
          renderDotContent={({x, y, index, indexData}): any => (
            <CustomDot
              key={index}
              value={indexData}
              index={index}
              x={x}
              y={y}
              scores={data.datasets[0].data as number[]}
            />
          )}
          bezier
          onDataPointClick={({index}) => {
            if (onDataPointClick) {
              onDataPointClick(dateRange[index]);
            }
          }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  bodyContainer: {
    flex: 1,
    padding: 20,
  },
  chartTitle: {
    fontSize: 18,
    marginVertical: 15,
    paddingHorizontal: 20,
  },
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  introduction: {
    marginTop: 45,
    borderRadius: 15,
    marginBottom: 100,
  },
});

export default AssessmentChart;
