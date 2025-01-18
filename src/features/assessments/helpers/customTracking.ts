export type CustomTrackingLabels = {
    [key: string]: string;
}

export const emptyCustomTrackingLabels: CustomTrackingLabels = {
    '0': '',
    '2.5': '',
    '5': '',
    '7.5': '',
    '10': '',
};

export type CustomTrackingSettings = {
    customTrackingEnabled: boolean;
    customTrackingName: string;
    customTrackingDescription: string;
    customTrackingLabels: CustomTrackingLabels;
};