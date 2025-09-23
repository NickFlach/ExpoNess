import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SunoTrack } from '@/types/suno';

interface GeneratedTrackProps {
  track: SunoTrack;
  onPlay?: (track: SunoTrack) => void;
  isPlaying?: boolean;
  showActions?: boolean;
  compact?: boolean;
}

export function GeneratedTrack({
  track,
  onPlay,
  isPlaying = false,
  showActions = true,
  compact = false,
}: GeneratedTrackProps) {
  const [liked, setLiked] = useState(track.is_liked);
  const [playCount, setPlayCount] = useState(track.play_count);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'cardBorder');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const successColor = useThemeColor({}, 'success');
  const errorColor = useThemeColor({}, 'error');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');

  const handlePlay = () => {
    if (onPlay) {
      onPlay(track);
      setPlayCount(prev => prev + 1);
    }
  };

  const handleLike = () => {
    setLiked(!liked);
  };

  const handleShare = async () => {
    try {
      const message = `Check out this AI-generated song: "${track.title}" ${track.audio_url || ''}`;
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: track.title,
            text: `AI-generated song: ${track.title}`,
            url: track.audio_url || '',
          });
        } else {
          await navigator.clipboard.writeText(message);
          Alert.alert('Copied to clipboard!');
        }
      } else {
        await Share.share({
          message,
          title: track.title,
        });
      }
    } catch (error) {
      console.warn('Error sharing track:', error);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getStatusColor = () => {
    switch (track.status) {
      case 'complete':
        return successColor;
      case 'error':
        return errorColor;
      case 'streaming':
      case 'queued':
        return secondaryColor;
      default:
        return iconColor;
    }
  };

  const getStatusText = () => {
    switch (track.status) {
      case 'complete':
        return 'Ready';
      case 'error':
        return 'Failed';
      case 'streaming':
        return 'Generating...';
      case 'queued':
        return 'Queued';
      case 'submitted':
        return 'Submitted';
      default:
        return 'Unknown';
    }
  };

  if (compact) {
    return (
      <ThemedView style={[styles.compactContainer, { backgroundColor, borderColor }]}>
        <View style={styles.compactAlbumArt}>
          {track.image_url ? (
            <Image source={{ uri: track.image_url }} style={styles.compactImage} />
          ) : (
            <View style={[styles.placeholderImage, styles.compactImage, { backgroundColor: primaryColor }]}>
              <IconSymbol name="music.note" size={20} color="white" />
            </View>
          )}
        </View>

        <View style={styles.compactInfo}>
          <ThemedText type="defaultSemiBold" numberOfLines={1}>
            {track.title || 'Untitled'}
          </ThemedText>
          <ThemedText style={[styles.compactMeta, { color: iconColor }]} numberOfLines={1}>
            {formatDuration(track.duration)} • {formatDate(track.created_at)}
          </ThemedText>
        </View>

        {track.status === 'complete' && (
          <TouchableOpacity onPress={handlePlay} style={styles.compactPlayButton}>
            <IconSymbol
              name={isPlaying ? 'pause.fill' : 'play.fill'}
              size={24}
              color={primaryColor}
            />
          </TouchableOpacity>
        )}

        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor, borderColor }]}>
      {/* Album Art */}
      <View style={styles.albumArt}>
        {track.image_url ? (
          <Image source={{ uri: track.image_url }} style={styles.albumImage} />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: primaryColor }]}>
            <IconSymbol name="music.note" size={40} color="white" />
          </View>
        )}
        {track.status === 'complete' && (
          <TouchableOpacity onPress={handlePlay} style={styles.playOverlay}>
            <View style={[styles.playButton, { backgroundColor: primaryColor }]}>
              <IconSymbol
                name={isPlaying ? 'pause.fill' : 'play.fill'}
                size={28}
                color="white"
              />
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Track Info */}
      <View style={styles.trackInfo}>
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <ThemedText type="defaultSemiBold" style={styles.title} numberOfLines={2}>
              {track.title || 'Untitled'}
            </ThemedText>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
              <ThemedText style={[styles.status, { color: getStatusColor() }]}>
                {getStatusText()}
              </ThemedText>
            </View>
          </View>
        </View>

        {track.metadata?.tags && (
          <ThemedText style={[styles.genre, { color: iconColor }]} numberOfLines={1}>
            {track.metadata.tags}
          </ThemedText>
        )}

        {track.prompt && (
          <ThemedText style={[styles.description, { color: iconColor }]} numberOfLines={3}>
            {track.prompt}
          </ThemedText>
        )}

        {/* Metadata */}
        <View style={styles.metadata}>
          <View style={styles.metaRow}>
            <IconSymbol name="waveform" size={16} color={iconColor} />
            <ThemedText style={[styles.metaText, { color: iconColor }]}>
              {formatDuration(track.duration)}
            </ThemedText>
          </View>
          <View style={styles.metaRow}>
            <IconSymbol name="play.fill" size={16} color={iconColor} />
            <ThemedText style={[styles.metaText, { color: iconColor }]}>
              {playCount}
            </ThemedText>
          </View>
          <ThemedText style={[styles.metaText, { color: iconColor }]}>
            {formatDate(track.created_at)}
          </ThemedText>
        </View>

        {/* Actions */}
        {showActions && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
              <IconSymbol
                name={liked ? 'heart.fill' : 'heart'}
                size={20}
                color={liked ? errorColor : iconColor}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
              <IconSymbol name="square.and.arrow.up" size={20} color={iconColor} />
            </TouchableOpacity>
            {track.audio_url && (
              <TouchableOpacity style={styles.actionButton}>
                <IconSymbol name="arrow.down.to.line" size={20} color={iconColor} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    position: 'relative',
  },
  albumArt: {
    marginRight: 16,
    position: 'relative',
  },
  compactAlbumArt: {
    marginRight: 12,
  },
  albumImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  compactImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  compactPlayButton: {
    padding: 8,
  },
  trackInfo: {
    flex: 1,
  },
  compactInfo: {
    flex: 1,
    marginRight: 8,
  },
  header: {
    marginBottom: 8,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
  },
  genre: {
    fontSize: 14,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    marginLeft: 4,
  },
  compactMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginRight: 8,
  },
  statusIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});