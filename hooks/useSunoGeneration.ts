/**
 * React hook for managing Suno AI music generation
 * Handles state management, progress tracking, and caching
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SunoTrack,
  GenerationOptions,
  SunoGenerationStatus,
  TrackGenerationState,
  CachedTrack,
  GenerationResponse,
} from '../types/suno';
import { sunoApi } from '../services/sunoApi';

const CACHE_KEY_PREFIX = 'suno_track_';
const CACHE_EXPIRY_HOURS = 24;

interface UseSunoGenerationOptions {
  maxCachedTracks?: number;
  pollInterval?: number;
  maxPollAttempts?: number;
  autoStartPolling?: boolean;
}

interface UseSunoGenerationReturn {
  // State
  status: SunoGenerationStatus;
  isGenerating: boolean;
  progress: number;
  tracks: SunoTrack[];
  error: string | null;
  generationId: string | null;
  cachedTracks: CachedTrack[];
  
  // Actions
  generateMusic: (prompt: string, options?: Partial<GenerationOptions>) => Promise<void>;
  extendTrack: (trackId: string, prompt: string, options?: any) => Promise<void>;
  generateLyrics: (prompt: string) => Promise<string | null>;
  getTrack: (trackId: string) => Promise<SunoTrack | null>;
  cancelGeneration: () => Promise<void>;
  clearError: () => void;
  clearTracks: () => void;
  
  // Cache management
  getCachedTrack: (trackId: string) => Promise<CachedTrack | null>;
  clearCache: () => Promise<void>;
  refreshCachedTracks: () => Promise<void>;
}

export const useSunoGeneration = (
  options: UseSunoGenerationOptions = {}
): UseSunoGenerationReturn => {
  const {
    maxCachedTracks = 50,
    pollInterval = 5000,
    maxPollAttempts = 60,
    autoStartPolling = true,
  } = options;

  // State
  const [status, setStatus] = useState<SunoGenerationStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [tracks, setTracks] = useState<SunoTrack[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [cachedTracks, setCachedTracks] = useState<CachedTrack[]>([]);

  // Refs
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollAttemptsRef = useRef(0);

  // Computed values
  const isGenerating = status === 'generating' || status === 'polling';

  // Cache management functions
  const getCacheKey = (trackId: string): string => `${CACHE_KEY_PREFIX}${trackId}`;

  const isCacheExpired = (cachedAt: string): boolean => {
    const cacheTime = new Date(cachedAt);
    const expiryTime = new Date(cacheTime.getTime() + CACHE_EXPIRY_HOURS * 60 * 60 * 1000);
    return new Date() > expiryTime;
  };

  const getCachedTrack = useCallback(async (trackId: string): Promise<CachedTrack | null> => {
    try {
      const cached = await AsyncStorage.getItem(getCacheKey(trackId));
      if (!cached) return null;

      const cachedTrack: CachedTrack = JSON.parse(cached);
      
      // Check if cache is expired
      if (isCacheExpired(cachedTrack.cached_at)) {
        await AsyncStorage.removeItem(getCacheKey(trackId));
        return null;
      }

      return cachedTrack;
    } catch (error) {
      console.warn('Failed to get cached track:', error);
      return null;
    }
  }, []);

  const cacheTrack = useCallback(async (track: SunoTrack): Promise<void> => {
    try {
      const cachedTrack: CachedTrack = {
        ...track,
        cached_at: new Date().toISOString(),
        local_id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      await AsyncStorage.setItem(getCacheKey(track.id), JSON.stringify(cachedTrack));
      
      // Update cached tracks list
      setCachedTracks(prev => {
        const updated = [cachedTrack, ...prev.filter(t => t.id !== track.id)];
        return updated.slice(0, maxCachedTracks);
      });
    } catch (error) {
      console.warn('Failed to cache track:', error);
    }
  }, [maxCachedTracks]);

  const clearCache = useCallback(async (): Promise<void> => {
    try {
      // Get all AsyncStorage keys
      const keys = await AsyncStorage.getAllKeys();
      const trackKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
      
      // Remove all cached tracks
      await AsyncStorage.multiRemove(trackKeys);
      setCachedTracks([]);
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }, []);

  const refreshCachedTracks = useCallback(async (): Promise<void> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const trackKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
      
      const cachedItems = await AsyncStorage.multiGet(trackKeys);
      const validTracks: CachedTrack[] = [];

      for (const [key, value] of cachedItems) {
        if (value) {
          try {
            const cachedTrack: CachedTrack = JSON.parse(value);
            
            // Check if not expired
            if (!isCacheExpired(cachedTrack.cached_at)) {
              validTracks.push(cachedTrack);
            } else {
              // Remove expired cache
              await AsyncStorage.removeItem(key);
            }
          } catch (parseError) {
            // Remove invalid cache entry
            await AsyncStorage.removeItem(key);
          }
        }
      }

      // Sort by cached_at date (newest first)
      validTracks.sort((a, b) => 
        new Date(b.cached_at).getTime() - new Date(a.cached_at).getTime()
      );

      setCachedTracks(validTracks.slice(0, maxCachedTracks));
    } catch (error) {
      console.warn('Failed to refresh cached tracks:', error);
    }
  }, [maxCachedTracks]);

  // Polling function
  const pollForCompletion = useCallback(async (trackIds: string[]): Promise<void> => {
    if (pollAttemptsRef.current >= maxPollAttempts) {
      setError('Generation timed out. Please try again.');
      setStatus('error');
      return;
    }

    try {
      const response = await sunoApi.getTracks(trackIds);
      
      if (response.error) {
        setError(response.error.message);
        setStatus('error');
        return;
      }

      const updatedTracks = response.data || [];
      setTracks(updatedTracks);

      // Calculate progress based on track statuses
      const completedCount = updatedTracks.filter(t => 
        t.status === 'complete' || t.status === 'error'
      ).length;
      const newProgress = Math.min((completedCount / updatedTracks.length) * 100, 100);
      setProgress(newProgress);

      // Check if all tracks are completed
      const allCompleted = updatedTracks.every(t => 
        t.status === 'complete' || t.status === 'error'
      );

      if (allCompleted) {
        setStatus('completed');
        setProgress(100);
        
        // Cache completed tracks
        const completedTracks = updatedTracks.filter(t => t.status === 'complete');
        for (const track of completedTracks) {
          await cacheTrack(track);
        }
        
        return;
      }

      // Continue polling
      pollAttemptsRef.current++;
      pollTimeoutRef.current = setTimeout(() => {
        pollForCompletion(trackIds);
      }, pollInterval);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Polling failed');
      setStatus('error');
    }
  }, [maxPollAttempts, pollInterval, cacheTrack]);

  // Main generation function
  const generateMusic = useCallback(async (
    prompt: string, 
    options: Partial<GenerationOptions> = {}
  ): Promise<void> => {
    try {
      setStatus('generating');
      setError(null);
      setProgress(0);
      setTracks([]);
      pollAttemptsRef.current = 0;

      const response = await sunoApi.generateMusic(prompt, options);

      if (response.error) {
        setError(response.error.message);
        setStatus('error');
        return;
      }

      const generation = response.data;
      if (!generation) {
        setError('No generation data received');
        setStatus('error');
        return;
      }

      setGenerationId(generation.id);
      setTracks(generation.clips);
      setStatus('polling');
      setProgress(10); // Initial progress

      // Start polling if enabled
      if (autoStartPolling) {
        const trackIds = generation.clips.map(clip => clip.id);
        pollForCompletion(trackIds);
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Generation failed');
      setStatus('error');
    }
  }, [autoStartPolling, pollForCompletion]);

  // Extend track function
  const extendTrack = useCallback(async (
    trackId: string, 
    prompt: string, 
    options: any = {}
  ): Promise<void> => {
    try {
      setStatus('generating');
      setError(null);
      setProgress(0);

      const response = await sunoApi.extendTrack(trackId, prompt, options);

      if (response.error) {
        setError(response.error.message);
        setStatus('error');
        return;
      }

      const extension = response.data;
      if (!extension) {
        setError('No extension data received');
        setStatus('error');
        return;
      }

      setGenerationId(extension.id);
      setTracks(extension.clips);
      setStatus('polling');
      setProgress(10);

      if (autoStartPolling) {
        const trackIds = extension.clips.map(clip => clip.id);
        pollForCompletion(trackIds);
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Extension failed');
      setStatus('error');
    }
  }, [autoStartPolling, pollForCompletion]);

  // Generate lyrics function
  const generateLyrics = useCallback(async (prompt: string): Promise<string | null> => {
    try {
      const response = await sunoApi.generateLyrics(prompt);

      if (response.error) {
        setError(response.error.message);
        return null;
      }

      return response.data?.text || null;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Lyrics generation failed');
      return null;
    }
  }, []);

  // Get single track
  const getTrack = useCallback(async (trackId: string): Promise<SunoTrack | null> => {
    try {
      // Try cache first
      const cached = await getCachedTrack(trackId);
      if (cached) return cached;

      // Fetch from API
      const response = await sunoApi.getTrack(trackId);
      
      if (response.error) {
        setError(response.error.message);
        return null;
      }

      const tracks = response.data || [];
      const track = tracks.find(t => t.id === trackId);
      
      if (track && track.status === 'complete') {
        await cacheTrack(track);
      }
      
      return track || null;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to get track');
      return null;
    }
  }, [getCachedTrack, cacheTrack]);

  // Cancel generation
  const cancelGeneration = useCallback(async (): Promise<void> => {
    try {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }

      if (generationId) {
        await sunoApi.cancelGeneration(generationId);
      }

      setStatus('idle');
      setProgress(0);
      setGenerationId(null);
    } catch (error) {
      console.warn('Failed to cancel generation:', error);
    }
  }, [generationId]);

  // Utility functions
  const clearError = useCallback(() => setError(null), []);
  const clearTracks = useCallback(() => setTracks([]), []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, []);

  // Load cached tracks on mount
  useEffect(() => {
    refreshCachedTracks();
  }, [refreshCachedTracks]);

  return {
    // State
    status,
    isGenerating,
    progress,
    tracks,
    error,
    generationId,
    cachedTracks,
    
    // Actions
    generateMusic,
    extendTrack,
    generateLyrics,
    getTrack,
    cancelGeneration,
    clearError,
    clearTracks,
    
    // Cache management
    getCachedTrack,
    clearCache,
    refreshCachedTracks,
  };
};

export default useSunoGeneration;