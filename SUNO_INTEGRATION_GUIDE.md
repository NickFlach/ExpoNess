# Suno AI Music Generation Integration

This guide explains how to use the Suno AI music generation integration in your Expo React Native app.

## Setup

1. **Environment Configuration**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Add your Suno API key to .env
   EXPO_PUBLIC_SUNO_API_KEY=your_actual_api_key_here
   ```

2. **Get API Key**
   - Visit https://www.sunoapi.org/ to get your API key
   - Sign up for an account and obtain your Bearer token

## Usage

### Basic Music Generation

```typescript
import React, { useState } from 'react';
import { useSunoGeneration } from '../hooks/useSunoGeneration';

const MusicGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const { generateMusic, tracks, isGenerating, progress, error } = useSunoGeneration();

  const handleGenerate = async () => {
    await generateMusic(prompt, {
      model: 'chirp-v3-5',
      make_instrumental: false,
      wait_audio: false,
    });
  };

  return (
    <View>
      <TextInput 
        value={prompt} 
        onChangeText={setPrompt}
        placeholder="Enter music prompt"
      />
      <Button 
        title={isGenerating ? `Generating... ${progress}%` : 'Generate Music'} 
        onPress={handleGenerate}
        disabled={isGenerating}
      />
      
      {tracks.map(track => (
        <View key={track.id}>
          <Text>{track.title}</Text>
          <Text>Status: {track.status}</Text>
        </View>
      ))}
    </View>
  );
};
```

### Available Methods

#### `generateMusic(prompt, options)`
Generate music from a text prompt.
- `prompt`: Description of the music (e.g., "upbeat pop song about summer")
- `options`: Configuration object with model, style preferences, etc.

#### `getTrack(trackId)`
Retrieve information about a specific track.

#### `extendTrack(trackId, prompt, options)`
Extend an existing track with additional content.

#### `generateLyrics(prompt)`
Generate lyrics only without music.

### Hook State

The `useSunoGeneration` hook provides:

- `status`: Current generation status ('idle', 'generating', 'polling', 'completed', 'error')
- `isGenerating`: Boolean indicating if generation is in progress
- `progress`: Generation progress percentage (0-100)
- `tracks`: Array of generated tracks
- `error`: Error message if something went wrong
- `cachedTracks`: Previously generated tracks stored locally

### Caching

Generated tracks are automatically cached using AsyncStorage for offline access and improved performance.

### Error Handling

The integration includes comprehensive error handling for:
- Network failures
- API rate limiting
- Invalid API keys
- Generation timeouts
- Invalid requests

## Example Component

See `components/SunoExample.tsx` for a complete example showing all features of the integration.

## API Configuration

The service automatically handles:
- Bearer token authentication
- Rate limiting (1 second between requests)
- Automatic polling for track completion
- Response caching
- Error recovery

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `EXPO_PUBLIC_SUNO_API_KEY` | Your Suno API key | Yes |
| `SUNO_API_KEY` | Alternative key name (fallback) | No |

## Track Status Flow

1. `submitted` - Request accepted
2. `queued` - In generation queue
3. `streaming` - Being generated
4. `complete` - Ready with audio/video URLs
5. `error` - Generation failed

## Best Practices

1. Always handle the `error` state in your UI
2. Show progress feedback during generation
3. Cache completed tracks for better UX
4. Provide cancel functionality for long generations
5. Use appropriate loading states

## Troubleshooting

1. **"No API key configured"**: Set `EXPO_PUBLIC_SUNO_API_KEY` in your .env file
2. **Generation timeout**: Increase `maxPollAttempts` in hook options
3. **Rate limiting**: The service automatically handles this with delays
4. **Cache issues**: Use `clearCache()` to reset stored tracks