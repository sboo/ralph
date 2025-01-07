import { Portal, Dialog, Text, List, Button } from "react-native-paper";
import { WeeklyDialogProps } from "../types";
import { StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

const WeeklyAssessmentDialog: React.FC<WeeklyDialogProps> = ({
    visible,
    onDismiss,
    dates,
    onDateSelect,
}) => {

    const { t } = useTranslation();

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss}>
                <Dialog.Content>
                    {dates.map((date) => (

                        <List.Section>
                            <List.Item 
                            key={date.toISOString()} onPress={() => {
                                onDateSelect(date);
                                onDismiss();
                            }} 
                            title={date.toLocaleDateString(undefined, {
                                weekday: 'long',
                                // year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })} 
                            left={() => <List.Icon icon="calendar" />}
                            right={() => <List.Icon icon="chevron-right" />}
                             />
                        </List.Section>

                    ))}
                </Dialog.Content>
                <Dialog.Actions>
                <Button onPress={onDismiss}>{t('buttons:cancel')}</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};


export default WeeklyAssessmentDialog;

const styles = StyleSheet.create({
    dialogDate: {
        paddingVertical: 12,
        fontSize: 16,
    },
});