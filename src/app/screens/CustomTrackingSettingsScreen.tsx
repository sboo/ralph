import React, { useMemo } from 'react';
import { event, EVENT_NAMES } from "@/features/events";
import { CustomTrackingSettingsScreenNavigationProps } from "@/features/navigation/types";
import { useTranslation } from 'react-i18next';
import { Avatar, Card, List, Switch, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { getEmoticon } from '@/support/helpers/TooltipHelper';
import { getValueColor } from '@/support/helpers/ColorHelper';
import { emptyCustomTrackingLabels } from '@/features/assessments/helpers/customTracking';

const CustomTrackingSettingsScreen: React.FC<CustomTrackingSettingsScreenNavigationProps> = ({ route }) => {
    const { t } = useTranslation();
    const theme = useTheme();


    const { customTrackingEnabled, customTrackingName, customTrackingDescription, customTrackingLabels } = route.params.customTrackingSettings;

    const [_customTrackingEnabled, _setCustomTrackingEnabled] = React.useState(customTrackingEnabled);
    const [_customTrackingName, _setCustomTrackingName] = React.useState(customTrackingName);
    const [_customTrackingDescription, _setCustomTrackingDescription] = React.useState(customTrackingDescription);
    const [_customTrackingLabels, _setCustomTrackingLabels] = React.useState({ ...emptyCustomTrackingLabels, ...customTrackingLabels });

    const customTrackingSettings = useMemo(() => {
        return {
            customTrackingEnabled: _customTrackingEnabled,
            customTrackingName: _customTrackingName,
            customTrackingDescription: _customTrackingDescription,
            customTrackingLabels: _customTrackingLabels,
        }
    }, [_customTrackingEnabled, _customTrackingName, _customTrackingDescription, _customTrackingLabels]);


    const handleCustomTrackingEnabled = (enabled: boolean) => {
        event.emit(EVENT_NAMES.CUSTOM_TRACKING_CHANGED, customTrackingSettings);
        _setCustomTrackingEnabled(enabled);
    }

    
    const handleCustomTrackingLabelChanged = (value: string, name: string) => {
        const newLabels = { ..._customTrackingLabels, [value]: name };
        event.emit(EVENT_NAMES.CUSTOM_TRACKING_CHANGED, customTrackingSettings);
        _setCustomTrackingLabels(newLabels);
    }

    return (
        <SafeAreaView
            style={{
                backgroundColor: theme.colors.primaryContainer,
                ...styles.container,
            }}>
            <LinearGradient
                colors={[
                    theme.colors.primaryContainer,
                    theme.colors.background,
                    theme.colors.primaryContainer,
                ]}
                locations={[0, 0.75, 1]}
                style={styles.gradient}>
                <ScrollView style={styles.scrollView}>

                    <Card mode="contained" style={{ backgroundColor: theme.colors.surface, ...styles.card }}>
                        <Card.Content style={styles.cardContent}>
                            <Avatar.Icon icon="clipboard-plus-outline" size={50} style={{ backgroundColor: theme.colors.tertiary }} />
                            <Text variant='headlineMedium'>{t('settings:customTracking')}</Text>
                            <Text style={styles.cardText}>{t('settings:customTrackingDescription')}</Text>
                        </Card.Content>
                    </Card>

                    <List.Section>
                        <List.Item
                            title={t('settings:customTrackingEnabledLabel')}
                            descriptionNumberOfLines={3}
                            right={() => (
                                <Switch
                                    value={_customTrackingEnabled}
                                    onValueChange={handleCustomTrackingEnabled}
                                />
                            )}
                        />
                    </List.Section>
                    {_customTrackingEnabled ?
                        (
                            <View>
                                <Text variant='bodyLarge'
                                    style={styles.description}

                                >
                                    {t('settings:customTrackingNameInfo')}
                                </Text>
                                <TextInput
                                    dense={true}
                                    mode='outlined'
                                    placeholder={t('settings:customTrackingNameInputLabel')}
                                    style={styles.textInput}
                                    value={_customTrackingName}
                                    onChangeText={(text: string) => _setCustomTrackingName(text)}
                                />
                                <TextInput
                                    dense={true}
                                    mode='outlined'
                                    placeholder={t('settings:customTrackingDescriptionInputLabel')}
                                    style={styles.textInput}
                                    value={_customTrackingDescription}
                                    onChangeText={(text: string) => _setCustomTrackingDescription(text)}
                                />
                                <Text variant='bodyLarge' style={styles.description}>
                                    {t('settings:customTrackingLabelDescription')}
                                </Text>
                                <TextInput
                                    dense={true}
                                    mode='outlined'
                                    style={styles.textInput}
                                    value={_customTrackingLabels['0']}
                                    left={<TextInput.Icon icon={getEmoticon(0)!.icon} color={getValueColor(theme.colors.outline, 0)} />}
                                    onChangeText={(text: string) => handleCustomTrackingLabelChanged('0', text)}
                                />
                                <TextInput
                                    dense={true}
                                    mode='outlined'
                                    style={styles.textInput}
                                    value={_customTrackingLabels['2.5']}
                                    left={<TextInput.Icon icon={getEmoticon(2.5)!.icon} color={getValueColor(theme.colors.outline, 2.5)} />}
                                    onChangeText={(text: string) => handleCustomTrackingLabelChanged('2.5', text)}
                                />
                                <TextInput
                                    dense={true}
                                    mode='outlined'
                                    style={styles.textInput}
                                    value={_customTrackingLabels['5'] ?? ''}
                                    left={<TextInput.Icon icon={getEmoticon(5)!.icon} color={getValueColor(theme.colors.outline, 5)} />}
                                    onChangeText={(text: string) => handleCustomTrackingLabelChanged('5', text)}
                                />
                                <TextInput
                                    dense={true}
                                    mode='outlined'
                                    style={styles.textInput}
                                    value={_customTrackingLabels['7.5'] ?? ''}
                                    left={<TextInput.Icon icon={getEmoticon(7.5)!.icon} color={getValueColor(theme.colors.outline, 7.5)} />}
                                    onChangeText={(text: string) => handleCustomTrackingLabelChanged('7.5', text)}
                                />
                                <TextInput
                                    dense={true}
                                    mode='outlined'
                                    style={styles.textInput}
                                    value={_customTrackingLabels['10'] ?? ''}
                                    left={<TextInput.Icon icon={getEmoticon(10)!.icon} color={getValueColor(theme.colors.outline, 10)} />}
                                    onChangeText={(text: string) => handleCustomTrackingLabelChanged('10', text)}
                                />
                            </View>) : null}
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
    },
    card: {
        marginBottom: 20,
    },
    cardContent: {
        flexDirection: 'column',
        gap: 10,
        alignItems: 'center',
        margin: 20,
    },
    cardText: {
        textAlign: 'center',
    },
    description: {
        marginVertical: 20,
        marginHorizontal: 20,
    },
    textInput: {
        marginBottom: 10,
        marginHorizontal: 20,
    },
});

export default CustomTrackingSettingsScreen;