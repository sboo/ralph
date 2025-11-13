import { useWindowDimensions } from 'react-native';

const TABLET_BREAKPOINT = 768;
const DESKTOP_BREAKPOINT = 1024;

export function useResponsive() {
  const { width } = useWindowDimensions();

  return {
    isTablet: width >= TABLET_BREAKPOINT,
    isDesktop: width >= DESKTOP_BREAKPOINT,
    isMobile: width < TABLET_BREAKPOINT,
    width,
  };
}
