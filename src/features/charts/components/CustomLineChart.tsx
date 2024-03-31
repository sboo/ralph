import {LineChart} from 'react-native-chart-kit';
import {Dataset} from 'react-native-chart-kit/dist/HelperTypes';

class CustomLineChart extends LineChart {
  getXMaxValues = (data: Dataset[]) => {
    const xmax = data.reduce((acc, cur) => {
      return cur.data.length > acc ? cur.data.length : acc;
    }, 0);
    return Math.max(1, xmax - 1);
  };

  render() {
    return super.render();
  }
}

export default CustomLineChart;
