import { SegmentedButtons } from '@/shared/components/SegmentedButtons/SegmentedButtons';
import { getValueColor } from '@/shared/helpers/ColorHelper';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { getEmoticon, getTooltipContent, OptionText } from '../helpers/TooltipHelper';
import RatingSliderToolTip from './RatingSliderToolTip';

interface Props {
    initialRating: number | undefined;
    onRatingChange?: (rating: number) => void;
    optionTexts: OptionText[];
}


const RatingButtons: React.FC<Props> = ({
    initialRating,
    onRatingChange,
    optionTexts,
}) => {
    const theme = useTheme();
    const [selectedRating, setSelectedRating] = useState<number | undefined>(
        initialRating,
    );
    const [pressed, setPressed] = useState(false);
    useEffect(() => {
        if (initialRating !== undefined) {
            setSelectedRating(initialRating);
        }
    }, [initialRating]);


    const onPressIn = (value: number) => {
        setSelectedRating(value);
        setPressed(true);
    }

    const onValueChange = (value: number) => {
        onRatingChange?.(value);
    };

    // eslint-disable-next-line react/no-unstable-nested-components
    const Tooltip = () => {
        if (!pressed) {
            return null;
        }
        const tooltipContent = getTooltipContent(selectedRating, optionTexts);
        return (
            <RatingSliderToolTip
                color={getValueColor(
                    theme.colors.outline,
                    selectedRating ?? 5,
                )}
                {...tooltipContent}
            />
        );
    };

    return (
        <View style={styles.container}>
            <Tooltip />
            <TouchableWithoutFeedback 
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            >
            <SegmentedButtons
                value={selectedRating?.toString() ?? ''}
                onValueChange={value => onValueChange(parseFloat(value))}
                density='small'
                theme={{ colors: { secondaryContainer: getValueColor(theme.colors.outline, selectedRating) }}}
                buttons={[
                    {
                        value: '0',
                        icon: getEmoticon(0)?.icon, 
                        uncheckedColor: getValueColor(theme.colors.outline, 0),
                        style: styles.button,
                        onPressIn:() => onPressIn(0),
                        onPressOut:() => setPressed(false)
                    },
                    {
                        value: '2.5',
                        icon: getEmoticon(2.5)?.icon, 
                        uncheckedColor: getValueColor(theme.colors.outline, 2.5),
                        style: styles.button,
                        onPressIn:() => onPressIn(2.5),
                        onPressOut:() => setPressed(false)
                    },
                    {
                        value: '5',
                        icon: getEmoticon(5)?.icon, 
                        uncheckedColor: getValueColor(theme.colors.outline, 5),
                        style: styles.button,
                        onPressIn:() => onPressIn(5),
                        onPressOut:() => setPressed(false)
                    },
                    {
                        value: '7.5',
                        icon: getEmoticon(7.5)?.icon, 
                        uncheckedColor: getValueColor(theme.colors.outline, 7.5),
                        style: styles.button,
                        onPressIn:() => onPressIn(7.5),
                        onPressOut:() => setPressed(false)
                    },
                    {
                        value: '10',
                        icon: getEmoticon(10)?.icon, 
                        uncheckedColor: getValueColor(theme.colors.outline, 10),
                        style: styles.button,
                        onPressIn:() => onPressIn(10),
                        onPressOut:() => setPressed(false)
                    },
                ]}
            />
            </TouchableWithoutFeedback>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        marginBottom: 20,
        alignItems: 'center',
    },
    button: {
        minWidth: 0,
    }
});

export default RatingButtons;
