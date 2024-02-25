import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

interface Props {
  initialRating: number | undefined;
  onRatingChange?: (rating: number) => void;
}

const RatingButtons: React.FC<Props> = ({initialRating, onRatingChange}) => {
  const [selectedRating, setSelectedRating] = useState(initialRating);

  // Call the onRatingChange callback whenever the selectedRating changes
  useEffect(() => {
    if (onRatingChange) {
      onRatingChange(selectedRating as number);
    }
  }, [selectedRating, onRatingChange]);

  const handlePress = (rating: number) => {
    setSelectedRating(rating);
  };

  // Function to dynamically change the button style based on selection
  const getButtonStyle = (rating: number) => [
    styles.button,
    selectedRating === rating && styles.selectedButton, // Apply selected style if this button is selected
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => handlePress(0)}
        style={[getButtonStyle(0), styles.leftButton]}>
        <Text>Bad</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handlePress(5)}
        style={getButtonStyle(5)}>
        <Text>Good</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handlePress(10)}
        style={[getButtonStyle(10), styles.rightButton]}>
        <Text>Excellent</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
  },
  button: {
    flex: 1, // This makes each button expand evenly
    padding: 10,
    alignItems: 'center', // Center the text inside each button
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectedButton: {
    backgroundColor: '#007bff', // Background color for selected button
    borderColor: '#007bff', // Border color for selected button
    color: '#ffffff', // Adjust text color if needed
  },
  leftButton: {
    borderTopLeftRadius: 4, // Round the left corner of the left button
    borderBottomLeftRadius: 4, // Adjust radius as needed
  },
  rightButton: {
    borderTopRightRadius: 4, // Round the right corner of the right button
    borderBottomRightRadius: 4, // Adjust radius as needed
    borderLeftWidth: 0, // Remove the left border to prevent double-width lines between buttons
  },
});

export default RatingButtons;
