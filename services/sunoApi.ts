/**
 * Suno AI API Service
 * Comprehensive service layer for Suno AI music generation
 * Base URL: https://api.sunoapi.org
 */

import Constants from 'expo-constants';
import {
  SunoTrack,
  GenerationOptions,
  GenerationRequest,
  GenerationResponse,
  ExtendTrackRequest,
  ExtendTrackResponse,
  LyricsRequest,
  LyricsResponse,
  SunoApiError,
  SunoApiResponse,
} from '../types/suno';

class SunoApiService {
  private baseUrl = 'https://api.sunoapi.org';
  private apiKey: string | null = null;
  private rateLimitDelay = 1000; // 1 second between requests
  private lastRequestTime = 0;

  constructor() {
    // Get API key from environment variables
    this.apiKey = Constants.expoConfig?.extra?.sunoApiKey || 
                  process.env.EXPO_PUBLIC_SUNO_API_KEY ||
                  process.env.SUNO_API_KEY ||
                  null;
  }

  /**
   * Set API key manually (useful for runtime configuration)
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Get current API key
   */
  getApiKey(): string | null {
    return this.apiKey;
  }

  /**
   * Handle rate limiting by ensuring minimum delay between requests
   */
  private async handleRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const delay = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Make authenticated HTTP request to Suno API
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<SunoApiResponse<T>> {
    if (!this.apiKey) {
      return {
        error: {
          error: 'NO_API_KEY',
          message: 'Suno API key is not configured. Please set EXPO_PUBLIC_SUNO_API_KEY environment variable or call setApiKey().',
        },
      };
    }

    await this.handleRateLimit();

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const responseData = await response.json();

      if (!response.ok) {
        return {
          error: {
            error: 'API_ERROR',
            message: responseData.message || responseData.error || `HTTP ${response.status}`,
            status: response.status,
          },
        };
      }

      return { data: responseData };
    } catch (error) {
      return {
        error: {
          error: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Unknown network error',
        },
      };
    }
  }

  /**
   * Generate music from text prompt
   * @param prompt Text description of the music to generate
   * @param options Generation options (model, style, etc.)
   */
  async generateMusic(
    prompt: string,
    options: Partial<GenerationOptions> = {}
  ): Promise<SunoApiResponse<GenerationResponse>> {
    const requestBody: GenerationRequest = {
      prompt,
      tags: options.tags,
      title: options.title,
      make_instrumental: options.make_instrumental || false,
      wait_audio: options.wait_audio || false,
      model: options.model || 'chirp-v3-5',
    };

    return this.makeRequest<GenerationResponse>('/api/generate', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  /**
   * Get track information by ID
   * @param trackId The ID of the track to retrieve
   */
  async getTrack(trackId: string): Promise<SunoApiResponse<SunoTrack[]>> {
    return this.makeRequest<SunoTrack[]>(`/api/get?ids=${trackId}`);
  }

  /**
   * Get multiple tracks by IDs
   * @param trackIds Array of track IDs to retrieve
   */
  async getTracks(trackIds: string[]): Promise<SunoApiResponse<SunoTrack[]>> {
    const idsParam = trackIds.join(',');
    return this.makeRequest<SunoTrack[]>(`/api/get?ids=${idsParam}`);
  }

  /**
   * Extend an existing track with additional content
   * @param trackId The ID of the track to extend
   * @param prompt Continuation prompt for the extension
   * @param options Extension options
   */
  async extendTrack(
    trackId: string,
    prompt: string,
    options: {
      continueAt?: number;
      tags?: string;
      title?: string;
      makeInstrumental?: boolean;
    } = {}
  ): Promise<SunoApiResponse<ExtendTrackResponse>> {
    const requestBody: ExtendTrackRequest = {
      audio_id: trackId,
      prompt,
      continue_at: options.continueAt,
      tags: options.tags,
      title: options.title,
      make_instrumental: options.makeInstrumental || false,
    };

    return this.makeRequest<ExtendTrackResponse>('/api/extend_audio', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  /**
   * Generate lyrics only (without music)
   * @param prompt Text prompt for lyrics generation
   */
  async generateLyrics(prompt: string): Promise<SunoApiResponse<LyricsResponse>> {
    const requestBody: LyricsRequest = {
      prompt,
    };

    return this.makeRequest<LyricsResponse>('/api/generate_lyrics', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  /**
   * Poll for track completion status
   * @param trackIds Array of track IDs to poll
   * @param maxAttempts Maximum number of polling attempts
   * @param intervalMs Polling interval in milliseconds
   */
  async pollTrackCompletion(
    trackIds: string[],
    maxAttempts: number = 60,
    intervalMs: number = 5000
  ): Promise<SunoApiResponse<SunoTrack[]>> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const response = await this.getTracks(trackIds);
      
      if (response.error) {
        return response;
      }

      const tracks = response.data || [];
      const allCompleted = tracks.every(track => 
        track.status === 'complete' || track.status === 'error'
      );

      if (allCompleted) {
        return response;
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    return {
      error: {
        error: 'POLLING_TIMEOUT',
        message: 'Tracks did not complete within the expected time frame',
      },
    };
  }

  /**
   * Get user's generation quota/credits information
   */
  async getQuota(): Promise<SunoApiResponse<any>> {
    return this.makeRequest<any>('/api/get_credits');
  }

  /**
   * Check API health/status
   */
  async checkApiStatus(): Promise<SunoApiResponse<any>> {
    return this.makeRequest<any>('/api/get_credits');
  }

  /**
   * Cancel a generation request
   * @param generationId The ID of the generation to cancel
   */
  async cancelGeneration(generationId: string): Promise<SunoApiResponse<any>> {
    return this.makeRequest<any>(`/api/cancel/${generationId}`, {
      method: 'POST',
    });
  }

  /**
   * Get generation history
   * @param limit Number of generations to retrieve
   * @param offset Offset for pagination
   */
  async getGenerationHistory(
    limit: number = 20,
    offset: number = 0
  ): Promise<SunoApiResponse<SunoTrack[]>> {
    return this.makeRequest<SunoTrack[]>(`/api/feed?page=${offset}&limit=${limit}`);
  }
}

// Export singleton instance
export const sunoApi = new SunoApiService();
export default sunoApi;