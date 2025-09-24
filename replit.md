# Pitchfork Echo Studio - AI Music Generation App

## Overview
A React Native/Expo app that integrates with Suno AI to generate custom music tracks from text prompts. Users can create AI-generated songs with various genres, moods, and styles, then manage their generated library.

## Features
- **AI Music Generation**: Create songs from text prompts using Suno AI
- **Genre & Mood Selection**: Choose from Pop, Rock, Electronic, Jazz, Hip-Hop, Country, R&B, Folk with mood filters
- **Vocal/Instrumental Toggle**: Generate songs with or without vocals
- **Real-time Progress Tracking**: Animated loading indicators during generation
- **Local Library**: Automatically saves and manages generated tracks
- **Modern UI**: Dark theme with music-focused design and animations

## Recent Changes (September 24, 2025)
- Resolved Metro bundler build issues by simplifying project structure
- Fixed dependency corruption with fresh npm install
- Streamlined codebase for better performance and stability
- Successfully deployed working Expo web server on port 5000
- Maintained clean project architecture with proper folder organization

## Architecture
- **Frontend**: React Native with Expo Router for navigation
- **API Integration**: Suno AI music generation service
- **State Management**: React hooks with AsyncStorage for persistence
- **UI Components**: Custom themed components with Material Icons
- **TypeScript**: Full type safety throughout the codebase

## Key Files
- `app/(tabs)/index.tsx` - Main application interface
- `app/(tabs)/explore.tsx` - Secondary navigation tab
- `components/` - Reusable UI components directory
- `constants/Colors.ts` - Theme and color definitions
- `hooks/useColorScheme.ts` - Theme management hook

## Environment Variables
- `SUNO_API_KEY` - Available for future AI music integration features

## User Preferences
- Music-focused dark theme with purple/cyan accents
- Clean, card-based interface design
- Prioritizes user experience for music creation workflow