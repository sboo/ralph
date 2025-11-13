import { WelcomeScreenNavigationProps } from '@/features/navigation/types';
import { CustomPagination } from '@/shared/components/CustomSwiperPagination';
import { GradientBackground } from '@/shared/components/gradient-background';
import { getDeviceInfo } from '@shared/helpers/DeviceHelper';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Avatar, IconButton, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import SwiperFlatList from 'react-native-swiper-flatlist';

const width = Dimensions.get('window').width;

const WelcomeScreen: React.FC<WelcomeScreenNavigationProps> = ({
  navigation,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const swiper = React.createRef<SwiperFlatList>();
  const {t} = useTranslation();
  const theme = useTheme();
  const {isTablet} = getDeviceInfo();

  // Create animated value for pulsating effect
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const onContiune = () => {
    if (!isLastIndex) {
      swiper.current?.scrollToIndex({index: currentIndex + 1, animated: true});
      return;
    }
    // If it's the last index, navigate to the onboarding screen
    navigation.navigate('Onboarding');
  };

  const data = [
    {
      title: t('welcome:title1'),
      description: t('welcome:text1'),
      image: require('@core/assets/images/girl-with-dog.png'),
      showButton: false,
    },
    {
      title: t('welcome:title2'),
      description: t('welcome:text2'),
      image: require('@core/assets/images/cat.png'),
      showButton: false,
    },
    {
      title: t('welcome:title3'),
      description: t('welcome:text3'),
      image: require('@core/assets/images/vet-examining-dog.png'),
      showButton: true,
    },
  ];

  const title = useMemo(() => data[currentIndex].title, [currentIndex]);

  const isLastIndex = useMemo(
    () => currentIndex === data.length - 1,
    [currentIndex],
  );
  const isFirstIndex = useMemo(() => currentIndex === 0, [currentIndex]);
  const topMargin = useMemo(() => (Platform.OS === 'android' ? 30 : 5), []);

  // Start pulsating animation when on last slide
  useEffect(() => {
    let animationLoop: Animated.CompositeAnimation;

    if (isLastIndex) {
      animationLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      );

      animationLoop.start();
    } else {
      // Reset animation when not on last slide
      pulseAnim.setValue(1);
    }

    return () => {
      if (animationLoop) {
        animationLoop.stop();
      }
    };
  }, [isLastIndex, pulseAnim]);

  return (
    <GradientBackground variant="vibrant">
      <SafeAreaView style={styles.container}>
        <Text
          variant="headlineLarge"
          style={{
            ...styles.title,
            marginTop: topMargin,
          }}>
          {title}
        </Text>
        <SwiperFlatList
          ref={swiper}
          style={styles.swiper}
          onChangeIndex={({index}) => setCurrentIndex(index)}
          data={data}
          // showPagination
          PaginationComponent={CustomPagination}
          renderItem={({item}) => (
            <ScrollView
              contentContainerStyle={
                isTablet ? styles.childTablet : styles.child
              }>
              {item.image ? (
                <View
                  style={
                    isTablet
                      ? styles.imageContainerTablet
                      : styles.imageContainer
                  }>
                  <Avatar.Image
                    size={isTablet ? width * 0.35 : width * 0.6}
                    source={item.image}
                    theme={{colors: {primary: theme.colors.secondaryContainer}}}
                  />
                </View>
              ) : null}
              <View
                style={
                  isTablet ? styles.textContainerTablet : styles.textContainer
                }>
                <Text
                  variant="titleLarge"
                  style={{
                    ...styles.text,
                    textAlign: isTablet ? 'left' : 'center',
                  }}>
                  {item.description}
                </Text>
              </View>
            </ScrollView>
          )}
        />
        <View style={styles.buttons}>
          <IconButton
            icon={'chevron-left'}
            iconColor={theme.colors.secondary}
            onPress={() =>
              swiper.current?.scrollToIndex({
                index: currentIndex - 1,
                animated: true,
              })
            }
            disabled={isFirstIndex}
          />
          {isLastIndex ? (
            <Animated.View style={{transform: [{scale: pulseAnim}]}}>
              <IconButton
                icon={'chevron-right'}
                iconColor={theme.colors.secondary}
                onPress={onContiune}
                mode={'contained'}
              />
            </Animated.View>
          ) : (
            <IconButton
              icon={'chevron-right'}
              iconColor={theme.colors.secondary}
              onPress={onContiune}
            />
          )}
        </View>
      </SafeAreaView>
    </GradientBackground>
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
    minHeight: 100,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  swiper: {
    position: 'relative',
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
  imageContainerTablet: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  image: {
    alignSelf: 'center',
  },
  child: {
    width,
    justifyContent: 'space-evenly',
    paddingHorizontal: 20,
    gap: 20,
  },
  childTablet: {
    width,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 100,
    gap: 30,
    justifyContent: 'center',
    flex: 1,
  },
  textContainer: {
    flex: 1,
  },
  textContainerTablet: {
    flex: 1,
    justifyContent: 'center',
  },
  text: {textAlign: 'center'},
});

export default WelcomeScreen;
