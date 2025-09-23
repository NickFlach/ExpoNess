import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';
import { GeneratedTrack } from './GeneratedTrack';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SunoTrack, CachedTrack } from '@/types/suno';
import useSunoGeneration from '@/hooks/useSunoGeneration';

interface RecentGenerationsProps {
  onTrackPlay?: (track: SunoTrack) => void;
  currentPlayingTrack?: SunoTrack | null;
  refreshTrigger?: number; // External trigger to refresh the list
}

export function RecentGenerations({
  onTrackPlay,
  currentPlayingTrack,
  refreshTrigger = 0,
}: RecentGenerationsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'compact'>('compact');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');

  const { cachedTracks, refreshCachedTracks, clearCache } = useSunoGeneration();

  // Theme colors
  const backgroundColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const primaryColor = useThemeColor({}, 'primary');
  const placeholderColor = useThemeColor({}, 'placeholder');

  useEffect(() => {
    refreshCachedTracks();
  }, [refreshTrigger, refreshCachedTracks]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshCachedTracks();
    } catch (error) {
      console.warn('Failed to refresh tracks:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Tracks',
      'Are you sure you want to remove all cached tracks? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearCache();
              Alert.alert('Success', 'All tracks have been cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear tracks.');
            }
          },
        },
      ]
    );
  };

  const sortTracks = (tracks: CachedTrack[]) => {
    const sorted = [...tracks];
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.cached_at).getTime() - new Date(a.cached_at).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.cached_at).getTime() - new Date(b.cached_at).getTime());
      case 'title':
        return sorted.sort((a, b) => (a.title || 'Untitled').localeCompare(b.title || 'Untitled'));
      default:
        return sorted;
    }
  };

  const sortedTracks = sortTracks(cachedTracks);

  const isTrackPlaying = (track: SunoTrack) => {
    return currentPlayingTrack?.id === track.id;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <IconSymbol name="music.note.list" size={24} color={primaryColor} />
        <ThemedText type="subtitle" style={styles.headerTitle}>
          Recent Generations
        </ThemedText>
        <View style={[styles.badge, { backgroundColor: primaryColor }]}>
          <ThemedText style={styles.badgeText}>
            {cachedTracks.length}
          </ThemedText>
        </View>
      </View>

      <View style={styles.headerControls}>
        {/* View Mode Toggle */}
        <TouchableOpacity
          onPress={() => setViewMode(viewMode === 'list' ? 'compact' : 'list')}
          style={styles.controlButton}
        >
          <IconSymbol
            name={viewMode === 'list' ? 'minus' : 'plus'}
            size={20}
            color={iconColor}
          />
        </TouchableOpacity>

        {/* Clear All Button */}
        {cachedTracks.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} style={styles.controlButton}>
            <IconSymbol name="trash" size={20} color={iconColor} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderSortControls = () => (
    <View style={styles.sortContainer}>
      <ThemedText style={[styles.sortLabel, { color: placeholderColor }]}>
        Sort by:
      </ThemedText>
      <View style={styles.sortButtons}>
        {[
          { key: 'newest', label: 'Newest' },
          { key: 'oldest', label: 'Oldest' },
          { key: 'title', label: 'Title' },
        ].map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            onPress={() => setSortBy(key as typeof sortBy)}
            style={[
              styles.sortButton,
              sortBy === key && { backgroundColor: primaryColor + '20' },
            ]}
          >
            <ThemedText
              style={[
                styles.sortButtonText,
                { color: sortBy === key ? primaryColor : iconColor },
              ]}
            >
              {label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <IconSymbol name="music.note" size={64} color={placeholderColor} />
      <ThemedText type="subtitle" style={[styles.emptyTitle, { color: placeholderColor }]}>
        No Generated Tracks
      </ThemedText>
      <ThemedText style={[styles.emptyDescription, { color: placeholderColor }]}>
        Your AI-generated music will appear here. Start by creating your first song!
      </ThemedText>
    </View>
  );

  const renderTrackList = () => {
    if (sortedTracks.length === 0) {
      return renderEmptyState();
    }

    return (
      <View style={styles.trackList}>
        {sortedTracks.map((track) => (
          <GeneratedTrack
            key={track.local_id || track.id}
            track={track}
            onPlay={onTrackPlay}
            isPlaying={isTrackPlaying(track)}
            compact={viewMode === 'compact'}
            showActions={viewMode === 'list'}
          />
        ))}
      </View>
    );
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {renderHeader()}
      
      {cachedTracks.length > 0 && renderSortControls()}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={primaryColor}
            colors={[primaryColor]}
          />
        }
      >
        {renderTrackList()}
        
        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Statistics Footer */}
      {cachedTracks.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <IconSymbol name="music.note" size={16} color={iconColor} />
              <ThemedText style={[styles.statText, { color: iconColor }]}>
                {cachedTracks.length} tracks
              </ThemedText>
            </View>
            <View style={styles.stat}>
              <IconSymbol name="checkmark" size={16} color={iconColor} />
              <ThemedText style={[styles.statText, { color: iconColor }]}>
                {cachedTracks.filter(t => t.status === 'complete').length} completed
              </ThemedText>
            </View>
          </View>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    marginLeft: 12,
    flex: 1,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  headerControls: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    padding: 8,
    borderRadius: 8,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  sortLabel: {
    fontSize: 14,
    marginRight: 12,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  trackList: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
});