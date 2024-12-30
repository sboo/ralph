import React, { useMemo, useState } from 'react';
import { Dimensions, Platform, SafeAreaView, StyleSheet, View } from 'react-native';
import { Avatar, Button, IconButton, Text, useTheme } from 'react-native-paper';
import { WelcomeScreenNavigationProps } from '@/features/navigation/types.tsx';
import { useTranslation } from 'react-i18next';
import SwiperFlatList from 'react-native-swiper-flatlist';
import { CustomPagination } from '@/support/components/CustomSwiperPagination';

const width = Dimensions.get('window').width;

const WelcomeScreen: React.FC<WelcomeScreenNavigationProps> = ({
  navigation,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const swiper = React.createRef<SwiperFlatList>();
  const { t } = useTranslation();
  const theme = useTheme();


  const onContiune = () => {
    navigation.navigate('Onboarding');
  }

  const data = [
    {
      title: t('welcome:title1'),
      description: t('welcome:text1'),
      image: require('@app/assets/images/girl-with-dog.png'),
      showButton: false,
    },
    {
      title: t('welcome:title2'),
      description: t('welcome:text2'),
      image: require('@app/assets/images/cat.png'),
      showButton: false,
    },
    {
      title: t('welcome:title3'),
      description: t('welcome:text3'),
      image: require('@app/assets/images/vet-examining-dog.png'),
      showButton: true,
    },
  ]

  const title = useMemo(() => data[currentIndex].title, [currentIndex]);

  const isLastIndex = useMemo(() => currentIndex === data.length - 1, [currentIndex]);
  const isFirstIndex = useMemo(() => currentIndex === 0, [currentIndex]);
  const topMargin = useMemo(() => (Platform.OS === 'android' ? 30 : 5), []);

  return (
    <SafeAreaView
      style={{
        backgroundColor: theme.colors.primary,
        ...styles.container,
      }}>
      <Text variant="headlineLarge" style={{ ...styles.title, color: theme.colors.onPrimary, marginTop: topMargin }}>{title}</Text>
      <SwiperFlatList
        ref={swiper}
        style={styles.swiper}
        onChangeIndex={({ index }) => setCurrentIndex(index)}
        data={data}
        showPagination
        PaginationComponent={CustomPagination}
        renderItem={({ item }) => (
          <View style={styles.child}>
            {item.image ? (
              <View style={styles.imageContainer}>
                <Avatar.Image size={width * 0.6} source={item.image} theme={{ colors: { primary: theme.colors.secondaryContainer } }} />
              </View>
            ) : null}
            <Text variant='titleLarge' style={{ ...styles.text, color: theme.colors.onPrimary }}>{item.description}</Text>
            <View style={styles.continueButton}>
              {item.showButton ? (
                <Button mode="contained-tonal" onPress={onContiune}>{t('buttons:getStarted')}</Button>
            ) : null}
            </View>
          </View>
        )}
      />
      <View style={styles.buttons}>
        <IconButton icon={'chevron-left'} iconColor={theme.colors.secondaryContainer} onPress={() => swiper.current?.scrollToIndex({ index: currentIndex - 1, animated: true })} disabled={isFirstIndex} />
        <IconButton icon={'chevron-right'} iconColor={theme.colors.secondaryContainer} onPress={() => swiper.current?.scrollToIndex({ index: currentIndex + 1, animated: true })}  disabled={isLastIndex} />
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 0,

    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  title: {
    height: 100,
    fontWeight: 'bold',
    paddingHorizontal: 20,

  },
  swiper: {
    position: 'relative',
  },
  continueButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    height:40
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    alignSelf: 'center',
  },
  child: { width, justifyContent: 'space-evenly', paddingHorizontal: 20 },
  text: { textAlign: 'center' },
});

export default WelcomeScreen;
