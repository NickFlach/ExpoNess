/**
 * TypeScript types for Suno AI music generation API
 * Base URL: https://api.sunoapi.org
 */

export interface SunoTrack {
  id: string;
  title: string;
  prompt: string;
  audio_url?: string;
  video_url?: string;
  image_url?: string;
  image_large_url?: string;
  major_model_version: string;
  model_name: string;
  metadata: {
    tags: string;
    prompt: string;
    gpt_description_prompt?: string;
    audio_prompt_id?: string;
    history?: string;
    concat_history?: string;
    type: string;
    duration?: number;
    refund_credits?: boolean;
    stream: boolean;
  };
  is_liked: boolean;
  user_id: string;
  is_trashed: boolean;
  reaction?: any;
  created_at: string;
  status: 'submitted' | 'queued' | 'streaming' | 'complete' | 'error';
  title_is_generated: boolean;
  play_count: number;
  upvote_count: number;
  is_public: boolean;
  duration?: number;
}

export interface GenerationOptions {
  model?: 'chirp-v3-5' | 'chirp-v3-0';
  prompt: string;
  make_instrumental?: boolean;
  wait_audio?: boolean;
  tags?: string;
  title?: string;
}

export interface GenerationRequest {
  prompt: string;
  tags?: string;
  title?: string;
  make_instrumental?: boolean;
  wait_audio?: boolean;
  model?: string;
}

export interface GenerationResponse {
  id: string;
  clips: SunoTrack[];
  metadata: {
    tags: string;
    prompt: string;
    gpt_description_prompt?: string;
    audio_prompt_id?: string;
    history?: string;
    concat_history?: string;
    type: string;
    duration?: number;
    refund_credits?: boolean;
    stream: boolean;
  };
  major_model_version: string;
  status: 'submitted' | 'queued' | 'streaming' | 'complete' | 'error';
  created_at: string;
  batch_size: number;
}

export interface ExtendTrackRequest {
  audio_id: string;
  prompt: string;
  continue_at?: number;
  tags?: string;
  title?: string;
  make_instrumental?: boolean;
}

export interface ExtendTrackResponse {
  id: string;
  clips: SunoTrack[];
  metadata: {
    tags: string;
    prompt: string;
    audio_prompt_id: string;
    history: string;
    concat_history: string;
    type: string;
    duration?: number;
    refund_credits?: boolean;
    stream: boolean;
  };
  major_model_version: string;
  status: string;
  created_at: string;
  batch_size: number;
}

export interface LyricsRequest {
  prompt: string;
}

export interface LyricsResponse {
  id: string;
  text: string;
  title: string;
  status: string;
  created_at: string;
}

export interface SunoApiError {
  error: string;
  message: string;
  status?: number;
}

export interface SunoApiResponse<T> {
  data?: T;
  error?: SunoApiError;
}

export interface TrackGenerationState {
  isGenerating: boolean;
  progress: number;
  tracks: SunoTrack[];
  error: string | null;
  generationId: string | null;
}

export interface CachedTrack extends SunoTrack {
  cached_at: string;
  local_id: string;
}

export type SunoGenerationStatus = 
  | 'idle' 
  | 'generating' 
  | 'polling' 
  | 'completed' 
  | 'error';