import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { GenerationOptions } from '@/types/suno';

interface MusicGenerationFormProps {
  onGenerate: (prompt: string, options: Partial<GenerationOptions>) => void;
  isGenerating?: boolean;
}

const GENRES = [
  'Pop',
  'Rock',
  'Electronic',
  'Jazz',
  'Hip-Hop',
  'Country',
  'R&B',
  'Folk',
  'Classical',
  'Reggae',
  'Blues',
  'Ambient',
  'Indie',
  'Funk',
  'Metal',
  'Acoustic',
];

const MOODS = [
  'Upbeat',
  'Chill',
  'Energetic',
  'Melancholic',
  'Romantic',
  'Dark',
  'Peaceful',
  'Aggressive',
  'Nostalgic',
  'Dreamy',
];

export function MusicGenerationForm({ onGenerate, isGenerating = false }: MusicGenerationFormProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [isInstrumental, setIsInstrumental] = useState(false);
  const [title, setTitle] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'cardBorder');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'placeholder');
  const iconColor = useThemeColor({}, 'icon');
  const surfaceColor = useThemeColor({}, 'surface');

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleMoodToggle = (mood: string) => {
    setSelectedMoods(prev => 
      prev.includes(mood)
        ? prev.filter(m => m !== mood)
        : [...prev, mood]
    );
  };

  const handleGenerate = () => {
    if (!prompt.trim()) {
      Alert.alert('Missing Prompt', 'Please enter a description for your song.');
      return;
    }

    const tags = [...selectedGenres, ...selectedMoods].join(', ').toLowerCase();
    const options: Partial<GenerationOptions> = {
      make_instrumental: isInstrumental,
      tags: tags || undefined,
      title: title.trim() || undefined,
    };

    onGenerate(prompt.trim(), options);
  };

  const clearForm = () => {
    setPrompt('');
    setSelectedGenres([]);
    setSelectedMoods([]);
    setIsInstrumental(false);
    setTitle('');
    setShowAdvanced(false);
  };

  const renderChips = (items: string[], selectedItems: string[], onToggle: (item: string) => void) => (
    <View style={styles.chipsContainer}>
      {items.map((item) => {
        const isSelected = selectedItems.includes(item);
        return (
          <TouchableOpacity
            key={item}
            onPress={() => onToggle(item)}
            style={[
              styles.chip,
              { borderColor: isSelected ? primaryColor : borderColor },
              isSelected && { backgroundColor: primaryColor + '20' },
            ]}
          >
            <ThemedText
              style={[
                styles.chipText,
                { color: isSelected ? primaryColor : textColor },
              ]}
            >
              {item}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: cardColor }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <IconSymbol name="music.note" size={32} color={primaryColor} />
          <ThemedText type="title" style={styles.headerTitle}>
            Generate Music
          </ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: placeholderColor }]}>
            Describe your perfect song and let AI create it
          </ThemedText>
        </View>

        {/* Main Prompt */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Song Description
          </ThemedText>
          <View style={[styles.inputContainer, { borderColor, backgroundColor: surfaceColor }]}>
            <TextInput
              style={[styles.promptInput, { color: textColor }]}
              placeholder="Describe the song you want to create..."
              placeholderTextColor={placeholderColor}
              value={prompt}
              onChangeText={setPrompt}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          <ThemedText style={[styles.hint, { color: placeholderColor }]}>
            Be specific: include style, mood, instruments, vocals, etc.
          </ThemedText>
        </View>

        {/* Genre Selection */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Genres
          </ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {renderChips(GENRES, selectedGenres, handleGenreToggle)}
          </ScrollView>
        </View>

        {/* Mood Selection */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Mood
          </ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {renderChips(MOODS, selectedMoods, handleMoodToggle)}
          </ScrollView>
        </View>

        {/* Instrumental Toggle */}
        <View style={styles.section}>
          <View style={styles.toggleContainer}>
            <View style={styles.toggleLeft}>
              <IconSymbol 
                name={isInstrumental ? "waveform" : "music.note"} 
                size={24} 
                color={primaryColor} 
              />
              <View style={styles.toggleText}>
                <ThemedText type="defaultSemiBold">
                  {isInstrumental ? 'Instrumental' : 'With Vocals'}
                </ThemedText>
                <ThemedText style={[styles.toggleDescription, { color: placeholderColor }]}>
                  {isInstrumental 
                    ? 'Music only, no singing'
                    : 'Include AI-generated vocals'
                  }
                </ThemedText>
              </View>
            </View>
            <Switch
              value={isInstrumental}
              onValueChange={setIsInstrumental}
              thumbColor={isInstrumental ? primaryColor : '#f4f3f4'}
              trackColor={{ false: borderColor, true: primaryColor + '40' }}
            />
          </View>
        </View>

        {/* Advanced Options Toggle */}
        <TouchableOpacity
          onPress={() => setShowAdvanced(!showAdvanced)}
          style={styles.advancedToggle}
        >
          <ThemedText style={[styles.advancedText, { color: primaryColor }]}>
            Advanced Options
          </ThemedText>
          <IconSymbol
            name="chevron.right"
            size={16}
            color={primaryColor}
            style={[
              styles.chevron,
              showAdvanced && { transform: [{ rotate: '90deg' }] },
            ]}
          />
        </TouchableOpacity>

        {/* Advanced Options */}
        {showAdvanced && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Song Title (Optional)
            </ThemedText>
            <View style={[styles.inputContainer, { borderColor, backgroundColor: surfaceColor }]}>
              <TextInput
                style={[styles.titleInput, { color: textColor }]}
                placeholder="Enter a custom title..."
                placeholderTextColor={placeholderColor}
                value={title}
                onChangeText={setTitle}
              />
            </View>
            <ThemedText style={[styles.hint, { color: placeholderColor }]}>
              Leave empty to auto-generate a title
            </ThemedText>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            onPress={clearForm}
            style={[styles.secondaryButton, { borderColor }]}
            disabled={isGenerating}
          >
            <IconSymbol name="arrow.clockwise" size={20} color={iconColor} />
            <ThemedText style={[styles.secondaryButtonText, { color: iconColor }]}>
              Clear
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleGenerate}
            style={[
              styles.generateButton,
              { backgroundColor: primaryColor },
              isGenerating && { opacity: 0.7 },
            ]}
            disabled={isGenerating || !prompt.trim()}
          >
            <IconSymbol
              name={isGenerating ? "arrow.clockwise" : "play.fill"}
              size={20}
              color="white"
            />
            <ThemedText style={styles.generateButtonText}>
              {isGenerating ? 'Generating...' : 'Generate Song'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    margin: 16,
    padding: 20,
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
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    marginTop: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  promptInput: {
    fontSize: 16,
    minHeight: 100,
  },
  titleInput: {
    fontSize: 16,
    height: 44,
  },
  hint: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    margin: 4,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleText: {
    marginLeft: 12,
    flex: 1,
  },
  toggleDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  advancedText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chevron: {
    marginLeft: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  generateButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});