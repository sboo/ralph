import { useAppearance } from '@/core/themes';
import { useResponsive } from '@/shared/hooks/useResponsive';
import { LinearGradient } from 'expo-linear-gradient';
import { View, ViewProps } from 'react-native';

interface GradientBackgroundProps extends ViewProps {
  variant?: 'primary' | 'subtle' | 'vibrant';
  colors?: readonly [string, string, string];
  centered?: boolean;
  children?: React.ReactNode;
}

/**
 * A reusable gradient background component for consistent visual styling
 * across the app. Perfect for making screens more engaging while maintaining
 * professionalism.
 * 
 * @param variant - The intensity of the gradient:
 *   - 'primary': The main onboarding gradient (vibrant)
 *   - 'subtle': A lighter version for list screens (default)
 *   - 'vibrant': Full intensity for special screens
 */
export function GradientBackground({ 
  variant = 'subtle', 
  centered = true,
  colors,
  children, 
  style,
  ...props 
}: GradientBackgroundProps) {
    const { effectiveAppearance } = useAppearance();
    const { isTablet } = useResponsive();
  

  const gradients = {
    primary: {
      light: ['#a8edea', '#fed6e3', '#fad962ff'] as const,
      dark: ['#2d5f5f', '#5f2d4a', '#4a3c1a'] as const,
    },
    subtle: {
      light: ['#e8f9f8', '#fef0f5', '#fef5e0'] as const,
      dark: ['#1a3d3d', '#3d1a2f', '#2f2612'] as const,
    },
    vibrant: {
      light: ['#96e6df', '#fdc6d9', '#f9d456'] as const,
      dark: ['#1f4d4d', '#4d1f3a', '#3d2f15'] as const,
    },
  };

  const defaultColors = effectiveAppearance === 'dark' 
    ? gradients[variant].dark 
    : gradients[variant].light;

    const gradientColors = colors || defaultColors;

  return (
    <LinearGradient
      colors={gradientColors}
      style={[{ flex: 1 }, style]}
      locations={[0, 0.5, 1]}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
      {...props}
    >
      {isTablet && centered ? (
        <View className="flex-1 items-center">
          <View className="w-full max-w-2xl flex-1">{children}</View>
        </View>
      ) : (
        children
      )}
    </LinearGradient>
  );
}
