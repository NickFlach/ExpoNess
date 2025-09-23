import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MusicGenerationForm } from '@/components/MusicGenerationForm';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { GeneratedTrack } from '@/components/GeneratedTrack';
import { RecentGenerations } from '@/components/RecentGenerations';
import { useThemeColor } from '@/hooks/useThemeColor';
import useSunoGeneration from '@/hooks/useSunoGeneration';
import { SunoTrack, GenerationOptions } from '@/types/suno';

export default function HomeScreen() {
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState<SunoTrack | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const {
    status,
    isGenerating,
    progress,
    tracks,
    error,
    generateMusic,
    clearError,
  } = useSunoGeneration();

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const errorColor = useThemeColor({}, 'error');

  const handleGenerate = useCallback(async (prompt: string, options: Partial<GenerationOptions>) => {
    try {
      clearError();
      await generateMusic(prompt, options);
      // Trigger refresh of recent generations when generation completes
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Generation failed:', error);
      Alert.alert(
        'Generation Failed',
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
  }, [generateMusic, clearError]);

  const handleTrackPlay = useCallback((track: SunoTrack) => {
    if (track.status !== 'complete' || !track.audio_url) {
      Alert.alert('Cannot Play', 'This track is not ready for playback yet.');
      return;
    }

    // For now, just toggle the playing state (actual audio playback would be implemented separately)
    setCurrentPlayingTrack(prev => 
      prev?.id === track.id ? null : track
    );

    // In a real app, you would integrate with an audio player here
    console.log('Playing track:', track.title, track.audio_url);
  }, []);

  const renderGenerationStatus = () => {
    if (error) {
      return (
        <ThemedView style={[styles.statusContainer, { backgroundColor: errorColor + '20' }]}>
          <ThemedText style={[styles.errorText, { color: errorColor }]}>
            Error: {error}
          </ThemedText>
        </ThemedView>
      );
    }

    if (isGenerating) {
      return (
        <LoadingIndicator
          progress={progress}
          status={status === 'generating' ? 'Generating music...' : 'Processing...'}
          showWaveform={true}
          size="medium"
        />
      );
    }

    return null;
  };

  const renderGeneratedTracks = () => {
    if (tracks.length === 0 || isGenerating) return null;

    return (
      <View style={styles.generatedSection}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Generated Tracks
        </ThemedText>
        {tracks.map((track) => (
          <GeneratedTrack
            key={track.id}
            track={track}
            onPlay={handleTrackPlay}
            isPlaying={currentPlayingTrack?.id === track.id}
            showActions={true}
            compact={false}
          />
        ))}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="auto" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={[styles.headerTitle, { color: primaryColor }]}>
            AI Music Studio
          </ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: primaryColor + 'aa' }]}>
            Create amazing songs with artificial intelligence
          </ThemedText>
        </View>

        {/* Generation Form */}
        <MusicGenerationForm 
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />

        {/* Generation Status */}
        {renderGenerationStatus()}

        {/* Generated Tracks */}
        {renderGeneratedTracks()}

        {/* Recent Generations */}
        <RecentGenerations
          onTrackPlay={handleTrackPlay}
          currentPlayingTrack={currentPlayingTrack}
          refreshTrigger={refreshTrigger}
        />

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statusContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  generatedSection: {
    margin: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  bottomPadding: {
    height: 100,
  },
});
