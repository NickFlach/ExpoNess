import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';

interface LoadingIndicatorProps {
  progress: number; // 0-100
  status?: string;
  showWaveform?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function LoadingIndicator({
  progress,
  status = 'Generating...',
  showWaveform = true,
  size = 'medium',
}: LoadingIndicatorProps) {
  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const waveAnims = useRef(Array.from({ length: 8 }, () => new Animated.Value(0.3))).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Theme colors
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const backgroundColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');

  // Size configurations
  const sizeConfig = {
    small: {
      container: 80,
      icon: 24,
      progress: 60,
      waveHeight: 20,
    },
    medium: {
      container: 120,
      icon: 32,
      progress: 100,
      waveHeight: 30,
    },
    large: {
      container: 160,
      icon: 48,
      progress: 140,
      waveHeight: 40,
    },
  };

  const config = sizeConfig[size];

  useEffect(() => {
    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Rotation animation
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Waveform animation
    const waveAnimations = waveAnims.map((anim, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 400 + index * 100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 400 + index * 100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      )
    );

    // Start animations
    pulseAnimation.start();
    rotateAnimation.start();
    waveAnimations.forEach((anim, index) => {
      setTimeout(() => anim.start(), index * 100);
    });

    return () => {
      pulseAnimation.stop();
      rotateAnimation.stop();
      waveAnimations.forEach(anim => anim.stop());
    };
  }, []);

  useEffect(() => {
    // Animate progress
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressInterpolate = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 2 * Math.PI],
    extrapolate: 'clamp',
  });

  if (size === 'small') {
    return (
      <View style={[styles.smallContainer, { width: config.container, height: config.container }]}>
        <Animated.View
          style={[
            styles.smallCircle,
            {
              transform: [{ scale: pulseAnim }, { rotate: rotateInterpolate }],
              backgroundColor: primaryColor + '20',
              borderColor: primaryColor,
            },
          ]}
        >
          <IconSymbol name="music.note" size={config.icon} color={primaryColor} />
        </Animated.View>
        <ThemedText style={[styles.smallProgress, { color: primaryColor }]}>
          {Math.round(progress)}%
        </ThemedText>
      </View>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Main Progress Circle */}
      <View style={[styles.progressContainer, { width: config.progress, height: config.progress }]}>
        {/* Background Circle */}
        <View
          style={[
            styles.progressCircle,
            {
              width: config.progress,
              height: config.progress,
              borderColor: primaryColor + '20',
            },
          ]}
        />
        
        {/* Progress Arc */}
        <Animated.View
          style={[
            styles.progressArc,
            {
              width: config.progress,
              height: config.progress,
              borderColor: primaryColor,
              transform: [
                {
                  rotate: progressInterpolate.interpolate({
                    inputRange: [0, 2 * Math.PI],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />

        {/* Center Icon */}
        <Animated.View
          style={[
            styles.centerIcon,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <IconSymbol name="music.note" size={config.icon} color={primaryColor} />
        </Animated.View>

        {/* Progress Text */}
        <View style={styles.progressText}>
          <ThemedText type="title" style={[styles.progressNumber, { color: primaryColor }]}>
            {Math.round(progress)}%
          </ThemedText>
        </View>
      </View>

      {/* Status Text */}
      <ThemedText style={[styles.statusText, { color: textColor }]}>
        {status}
      </ThemedText>

      {/* Waveform Animation */}
      {showWaveform && (
        <View style={[styles.waveform, { height: config.waveHeight }]}>
          {waveAnims.map((anim, index) => (
            <Animated.View
              key={index}
              style={[
                styles.waveBar,
                {
                  backgroundColor: index % 2 === 0 ? primaryColor : secondaryColor,
                  transform: [{ scaleY: anim }],
                },
              ]}
            />
          ))}
        </View>
      )}

      {/* Generation Steps */}
      <View style={styles.steps}>
        <View style={styles.step}>
          <View style={[styles.stepDot, { backgroundColor: progress > 0 ? primaryColor : iconColor }]} />
          <ThemedText style={[styles.stepText, { color: progress > 0 ? textColor : iconColor }]}>
            Processing
          </ThemedText>
        </View>
        <View style={styles.step}>
          <View style={[styles.stepDot, { backgroundColor: progress > 50 ? primaryColor : iconColor }]} />
          <ThemedText style={[styles.stepText, { color: progress > 50 ? textColor : iconColor }]}>
            Generating
          </ThemedText>
        </View>
        <View style={styles.step}>
          <View style={[styles.stepDot, { backgroundColor: progress >= 100 ? primaryColor : iconColor }]} />
          <ThemedText style={[styles.stepText, { color: progress >= 100 ? textColor : iconColor }]}>
            Complete
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 32,
    margin: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  smallContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  smallCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallProgress: {
    position: 'absolute',
    bottom: -20,
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  progressCircle: {
    position: 'absolute',
    borderWidth: 4,
    borderRadius: 999,
    borderStyle: 'solid',
  },
  progressArc: {
    position: 'absolute',
    borderWidth: 4,
    borderRadius: 999,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    borderTopWidth: 4,
  },
  centerIcon: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 3,
  },
  waveBar: {
    width: 4,
    height: '100%',
    borderRadius: 2,
  },
  steps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 240,
    paddingHorizontal: 20,
  },
  step: {
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});