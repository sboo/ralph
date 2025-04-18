import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Card, Icon, Text } from 'react-native-paper';

interface Props {
  color: string;
  title?: string;
  description?: string;
  icon?: string;
}

const RatingSliderToolTip: React.FC<Props> = ({
  color,
  title,
  description,
  icon,
}) => {
  return (
    <Card
      style={{width: Dimensions.get('window').width - 80, ...styles.tooltip}}>
      <Card.Title
        title={title}
        titleNumberOfLines={2}
        // eslint-disable-next-line react/no-unstable-nested-components
        left={props => (
          <Icon {...props} size={24} source={icon} color={color} />
        )}
      />
      {description ? (
        <Card.Content>
          <Text variant="bodyMedium" style={styles.tooltipText}>
            {description}
          </Text>
        </Card.Content>
      ) : null}
    </Card>
  );
};

const styles = StyleSheet.create({
  tooltip: {
    position: 'absolute',
    borderRadius: 15,
    left: 20,
    bottom: 60,
    padding: 10,
    zIndex: 900,
  },
  tooltipText: {
    textAlign: 'center',
  },
});
export default RatingSliderToolTip;
