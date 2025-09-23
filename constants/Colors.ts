/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // Music-themed colors
    card: '#ffffff',
    cardBorder: '#e5e7eb',
    primary: '#8b5cf6',
    secondary: '#06b6d4',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    surface: '#f9fafb',
    surfaceSecondary: '#f3f4f6',
    placeholder: '#9ca3af',
    disabled: '#d1d5db',
  },
  dark: {
    text: '#ECEDEE',
    background: '#0a0a0a',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // Music-themed colors
    card: '#1a1a1a',
    cardBorder: '#2a2a2a',
    primary: '#8b5cf6', // Purple accent
    secondary: '#06b6d4', // Cyan accent
    success: '#10b981', // Green
    warning: '#f59e0b', // Orange
    error: '#ef4444', // Red
    surface: '#171717',
    surfaceSecondary: '#262626',
    placeholder: '#6b7280',
    disabled: '#4b5563',
  },
};
