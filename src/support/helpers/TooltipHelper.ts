
const emoticons = [
    {
        value: 0,
        icon: 'emoticon-sad-outline',
    },
    {
        value: 2.5,
        icon: 'emoticon-confused-outline',
    },
    {
        value: 5,
        icon: 'emoticon-neutral-outline',
    },
    {
        value: 7.5,
        icon: 'emoticon-happy-outline',
    },
    {
        value: 10,
        icon: 'emoticon-excited-outline',
    },
];

export interface OptionText {
    value: number;
    title: string;
    description: string;
}

export const getEmoticon = (value: number) => {
    return emoticons.find(v => v.value === value);
}

export const getTooltipContent = (selectedRating: number | undefined, optionTexts: OptionText[]) => {
    if (selectedRating === undefined) {
        return {
            label: '',
            description: '',
            icon: 'emoticon-neutral-outline',
        };
    }
    const emoticon = getEmoticon(selectedRating);
    const texts = optionTexts.find(v => v.value === selectedRating);
    return { ...texts, icon: emoticon?.icon };
};