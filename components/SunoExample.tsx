/**
 * Example component demonstrating Suno AI integration usage
 * This component shows how to use the useSunoGeneration hook
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { useSunoGeneration } from '../hooks/useSunoGeneration';
import { SunoTrack } from '../types/suno';

const SunoExample: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [lyricsPrompt, setLyricsPrompt] = useState('');
  const [generatedLyrics, setGeneratedLyrics] = useState<string | null>(null);

  const {
    status,
    isGenerating,
    progress,
    tracks,
    error,
    cachedTracks,
    generateMusic,
    generateLyrics,
    extendTrack,
    getTrack,
    cancelGeneration,
    clearError,
    clearTracks,
    clearCache,
  } = useSunoGeneration();

  const handleGenerateMusic = async () => {
    if (!prompt.trim()) {
      Alert.alert('Error', 'Please enter a music prompt');
      return;
    }

    try {
      await generateMusic(prompt, {
        model: 'chirp-v3-5',
        make_instrumental: false,
        wait_audio: false,
      });
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  const handleGenerateLyrics = async () => {
    if (!lyricsPrompt.trim()) {
      Alert.alert('Error', 'Please enter a lyrics prompt');
      return;
    }

    try {
      const lyrics = await generateLyrics(lyricsPrompt);
      setGeneratedLyrics(lyrics);
    } catch (error) {
      console.error('Lyrics generation failed:', error);
    }
  };

  const handleExtendTrack = async (track: SunoTrack) => {
    if (!track.id) return;

    const extensionPrompt = 'Continue this song with more energy';
    try {
      await extendTrack(track.id, extensionPrompt);
    } catch (error) {
      console.error('Extension failed:', error);
    }
  };

  const handlePlayTrack = (track: SunoTrack) => {
    if (track.audio_url) {
      Alert.alert('Play Track', `Would play: ${track.title}\nURL: ${track.audio_url}`);
    } else {
      Alert.alert('No Audio', 'Track audio is not ready yet');
    }
  };

  const renderTrack = (track: SunoTrack, index: number) => (
    <View key={track.id || index} style={styles.trackItem}>
      <Text style={styles.trackTitle}>{track.title || 'Untitled'}</Text>
      <Text style={styles.trackPrompt}>{track.prompt}</Text>
      <Text style={styles.trackStatus}>Status: {track.status}</Text>
      {track.duration && (
        <Text style={styles.trackDuration}>Duration: {track.duration}s</Text>
      )}
      
      <View style={styles.trackActions}>
        <TouchableOpacity 
          style={[styles.button, styles.playButton]} 
          onPress={() => handlePlayTrack(track)}
          disabled={!track.audio_url}
        >
          <Text style={styles.buttonText}>
            {track.audio_url ? 'Play' : 'Processing...'}
          </Text>
        </TouchableOpacity>
        
        {track.status === 'complete' && (
          <TouchableOpacity 
            style={[styles.button, styles.extendButton]} 
            onPress={() => handleExtendTrack(track)}
          >
            <Text style={styles.buttonText}>Extend</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Suno AI Music Generation</Text>
      
      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.clearErrorButton} onPress={clearError}>
            <Text style={styles.buttonText}>Clear Error</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Music Generation Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Generate Music</Text>
        <TextInput
          style={styles.input}
          value={prompt}
          onChangeText={setPrompt}
          placeholder="Enter music prompt (e.g., 'upbeat pop song about summer')"
          multiline
        />
        <TouchableOpacity 
          style={[styles.button, styles.generateButton]} 
          onPress={handleGenerateMusic}
          disabled={isGenerating}
        >
          <Text style={styles.buttonText}>
            {isGenerating ? `Generating... ${progress.toFixed(0)}%` : 'Generate Music'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lyrics Generation Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Generate Lyrics</Text>
        <TextInput
          style={styles.input}
          value={lyricsPrompt}
          onChangeText={setLyricsPrompt}
          placeholder="Enter lyrics prompt (e.g., 'song about friendship')"
          multiline
        />
        <TouchableOpacity 
          style={[styles.button, styles.lyricsButton]} 
          onPress={handleGenerateLyrics}
        >
          <Text style={styles.buttonText}>Generate Lyrics</Text>
        </TouchableOpacity>
        
        {generatedLyrics && (
          <View style={styles.lyricsContainer}>
            <Text style={styles.lyricsTitle}>Generated Lyrics:</Text>
            <Text style={styles.lyricsText}>{generatedLyrics}</Text>
          </View>
        )}
      </View>

      {/* Status and Progress */}
      {isGenerating && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Generation Status</Text>
          <Text>Status: {status}</Text>
          <Text>Progress: {progress.toFixed(0)}%</Text>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]} 
            onPress={cancelGeneration}
          >
            <Text style={styles.buttonText}>Cancel Generation</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Generated Tracks */}
      {tracks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Generated Tracks</Text>
          {tracks.map(renderTrack)}
          <TouchableOpacity style={styles.clearButton} onPress={clearTracks}>
            <Text style={styles.buttonText}>Clear Tracks</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Cached Tracks */}
      {cachedTracks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cached Tracks ({cachedTracks.length})</Text>
          {cachedTracks.slice(0, 3).map(renderTrack)}
          <TouchableOpacity style={styles.clearButton} onPress={clearCache}>
            <Text style={styles.buttonText}>Clear Cache</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* API Key Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>API Configuration</Text>
        <Text style={styles.infoText}>
          To use this integration, set your Suno API key in the environment variables.
          {'\n'}Copy .env.example to .env and add your API key.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  generateButton: {
    backgroundColor: '#34C759',
  },
  lyricsButton: {
    backgroundColor: '#FF9500',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  clearButton: {
    backgroundColor: '#8E8E93',
    marginTop: 8,
  },
  clearErrorButton: {
    backgroundColor: '#FF3B30',
    marginTop: 8,
    padding: 8,
    borderRadius: 4,
  },
  playButton: {
    backgroundColor: '#007AFF',
    flex: 1,
    marginRight: 4,
  },
  extendButton: {
    backgroundColor: '#5856D6',
    flex: 1,
    marginLeft: 4,
  },
  trackItem: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  trackPrompt: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  trackStatus: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  trackDuration: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  trackActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderColor: '#FF3B30',
    borderWidth: 1,
  },
  errorText: {
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  lyricsContainer: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 6,
    marginTop: 12,
  },
  lyricsTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  lyricsText: {
    fontStyle: 'italic',
  },
  infoText: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default SunoExample;