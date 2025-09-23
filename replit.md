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

## Recent Changes (September 23, 2025)
- Complete Suno AI integration with secure API key management
- Built comprehensive music generation interface
- Added TypeScript types for all Suno API responses
- Implemented local caching with AsyncStorage
- Created reusable components: GeneratedTrack, LoadingIndicator, RecentGenerations
- Updated color scheme for music-focused dark theme
- Added proper error handling and loading states

## Architecture
- **Frontend**: React Native with Expo Router for navigation
- **API Integration**: Suno AI music generation service
- **State Management**: React hooks with AsyncStorage for persistence
- **UI Components**: Custom themed components with Material Icons
- **TypeScript**: Full type safety throughout the codebase

## Key Files
- `app/(tabs)/index.tsx` - Main music generation interface
- `services/sunoApi.ts` - Suno AI service layer
- `hooks/useSunoGeneration.ts` - React hook for generation state
- `types/suno.ts` - TypeScript interfaces
- `components/GeneratedTrack.tsx` - Track display component

## Environment Variables
- `SUNO_API_KEY` - Required API key from SunoAPI.org

## User Preferences
- Music-focused dark theme with purple/cyan accents
- Clean, card-based interface design
- Prioritizes user experience for music creation workflow