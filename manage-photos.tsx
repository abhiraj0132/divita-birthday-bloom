import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  BirthdayColors,
  BirthdayFonts,
  ScrapbookSections,
} from '@/constants/birthday-theme';
import {
  saveSectionPhotos,
  getSectionPhotos,
  UploadedPhoto,
} from '@/services/photoStorage';

interface PhotoSlot {
  photo: UploadedPhoto | null;
  index: number;
}

export default function ManagePhotosScreen() {
  const insets = useSafeAreaInsets();
  const [sectionPhotos, setSectionPhotos] = useState<{
    [key: string]: PhotoSlot[];
  }>({});
  const [loading, setLoading] = useState(true);

  // Load photos on mount
  useEffect(() => {
    loadAllPhotos();
  }, []);

  const loadAllPhotos = async () => {
    try {
      setLoading(true);
      const photoData: { [key: string]: PhotoSlot[] } = {};

      for (const section of ScrapbookSections) {
        const photos = await getSectionPhotos(section.id);
        photoData[section.id] = [
          { photo: photos[0] || null, index: 0 },
          { photo: photos[1] || null, index: 1 },
        ];
      }

      setSectionPhotos(photoData);
    } catch (error) {
      console.error('Error loading photos:', error);
      Alert.alert('Error', 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to upload photos.'
      );
      return false;
    }
    return true;
  };

  const pickImage = async (sectionId: string, slotIndex: number) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as any,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newPhoto: UploadedPhoto = {
          uri: result.assets[0].uri,
          caption: '',
          rotation: Math.random() > 0.5 ? 2 : -2,
          washiTapeColor:
            ScrapbookSections.find((s) => s.id === sectionId)?.color ||
            BirthdayColors.blushPink,
        };

        // Update local state
        const updatedSlots = [...sectionPhotos[sectionId]];
        updatedSlots[slotIndex] = { photo: newPhoto, index: slotIndex };
        setSectionPhotos((prev) => ({
          ...prev,
          [sectionId]: updatedSlots,
        }));

        // Save to storage
        const photosToSave = updatedSlots
          .filter((slot) => slot.photo !== null)
          .map((slot) => slot.photo!);
        await saveSectionPhotos(sectionId, photosToSave);

        Alert.alert('Success! 🎉', 'Photo added to your scrapbook');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removePhoto = async (sectionId: string, slotIndex: number) => {
    Alert.alert(
      'Remove Photo?',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              // Update local state
              const updatedSlots = [...sectionPhotos[sectionId]];
              updatedSlots[slotIndex] = { photo: null, index: slotIndex };
              setSectionPhotos((prev) => ({
                ...prev,
                [sectionId]: updatedSlots,
              }));

              // Save to storage
              const photosToSave = updatedSlots
                .filter((slot) => slot.photo !== null)
                .map((slot) => slot.photo!);
              await saveSectionPhotos(sectionId, photosToSave);
            } catch (error) {
              console.error('Error removing photo:', error);
              Alert.alert('Error', 'Failed to remove photo');
            }
          },
        },
      ]
    );
  };

  const PhotoSlotCard = ({
    sectionId,
    slot,
    sectionColor,
  }: {
    sectionId: string;
    slot: PhotoSlot;
    sectionColor: string;
  }) => {
    return (
      <Pressable
        style={styles.photoSlotCard}
        onPress={() => pickImage(sectionId, slot.index)}
      >
        {/* Washi tape */}
        <View
          style={[
            styles.slotWashiTape,
            { backgroundColor: sectionColor + 'AA' },
          ]}
        />

        {slot.photo ? (
          <>
            <Image source={{ uri: slot.photo.uri }} style={styles.slotImage} />
            <Pressable
              style={styles.removeButton}
              onPress={() => removePhoto(sectionId, slot.index)}
              hitSlop={8}
            >
              <Ionicons name="close-circle" size={24} color={BirthdayColors.deepPink} />
            </Pressable>
          </>
        ) : (
          <View style={styles.emptySlot}>
            <Ionicons
              name="add-circle-outline"
              size={48}
              color={sectionColor}
            />
            <Text style={[styles.emptySlotText, { color: sectionColor }]}>
              Tap to add photo
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  const SectionCard = ({
    section,
  }: {
    section: (typeof ScrapbookSections)[number];
  }) => {
    const slots = sectionPhotos[section.id] || [];

    return (
      <View style={styles.sectionCard}>
        {/* Section header */}
        <View style={styles.sectionCardHeader}>
          <Text style={styles.sectionCardEmoji}>{section.emoji}</Text>
          <Text style={[styles.sectionCardTitle, { color: section.color }]}>
            {section.title}
          </Text>
        </View>

        {/* Photo slots */}
        <View style={styles.photoSlotsContainer}>
          {slots.map((slot) => (
            <PhotoSlotCard
              key={`${section.id}-${slot.index}`}
              sectionId={section.id}
              slot={slot}
              sectionColor={section.color}
            />
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[
          BirthdayColors.cream,
          BirthdayColors.softRose,
          BirthdayColors.softLavender,
        ]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={BirthdayColors.roseGold} />
        <Text style={styles.loadingText}>Loading photos...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[
        BirthdayColors.cream,
        BirthdayColors.softRose,
        BirthdayColors.softLavender,
      ]}
      locations={[0, 0.5, 1]}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={12}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={BirthdayColors.textDark}
            />
          </Pressable>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleEmoji}>📸</Text>
          <Text style={styles.title}>Manage Photos</Text>
          <Text style={styles.titleEmoji}>✨</Text>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Personalize your scrapbook with your favorite photos
        </Text>

        {/* Instruction card */}
        <View style={styles.instructionCard}>
          <Text style={styles.instructionEmoji}>💡</Text>
          <Text style={styles.instructionText}>
            Tap on any polaroid frame to select a photo from your gallery. You
            can add up to 2 photos per category.
          </Text>
        </View>

        {/* Decorative divider */}
        <View style={styles.decorativeDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerEmojis}>🌸 ✨ 💕 ✨ 🌸</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Section cards */}
        {ScrapbookSections.map((section) => (
          <SectionCard key={section.id} section={section} />
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerEmojis}>✨ 💖 ✨</Text>
          <Text style={styles.footerText}>
            Your photos are saved automatically
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: BirthdayFonts.handwrittenRegular,
    fontSize: 18,
    color: BirthdayColors.roseGold,
    marginTop: 16,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BirthdayColors.white + 'CC',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: BirthdayColors.roseGold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },

  // Title
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontFamily: BirthdayFonts.handwritten,
    fontSize: 32,
    color: BirthdayColors.roseGold,
    textAlign: 'center',
  },
  titleEmoji: {
    fontSize: 24,
    marginHorizontal: 8,
  },
  subtitle: {
    fontFamily: BirthdayFonts.handwrittenRegular,
    fontSize: 16,
    color: BirthdayColors.textMedium,
    textAlign: 'center',
    marginBottom: 20,
  },

  // Instruction card
  instructionCard: {
    backgroundColor: BirthdayColors.white + 'E6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: BirthdayColors.roseGold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  instructionEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontFamily: BirthdayFonts.bodyMedium,
    fontSize: 14,
    color: BirthdayColors.textDark,
    lineHeight: 20,
  },

  // Decorative divider
  decorativeDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: BirthdayColors.blushPink + '60',
  },
  dividerEmojis: {
    fontSize: 12,
    marginHorizontal: 12,
  },

  // Section card
  sectionCard: {
    backgroundColor: BirthdayColors.white + 'E6',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: BirthdayColors.roseGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionCardEmoji: {
    fontSize: 24,
  },
  sectionCardTitle: {
    fontFamily: BirthdayFonts.handwritten,
    fontSize: 24,
  },

  // Photo slots
  photoSlotsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  photoSlotCard: {
    flex: 1,
    aspectRatio: 0.85,
    backgroundColor: BirthdayColors.white,
    borderRadius: 8,
    padding: 8,
    paddingBottom: 20,
    shadowColor: BirthdayColors.roseGold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  slotWashiTape: {
    position: 'absolute',
    top: -8,
    left: '25%',
    width: '50%',
    height: 16,
    borderRadius: 4,
    zIndex: 10,
  },
  slotImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: BirthdayColors.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  emptySlot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: BirthdayColors.blushPink,
    borderRadius: 4,
  },
  emptySlotText: {
    fontFamily: BirthdayFonts.handwrittenRegular,
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  footerEmojis: {
    fontSize: 16,
    letterSpacing: 4,
    marginBottom: 8,
  },
  footerText: {
    fontFamily: BirthdayFonts.handwrittenRegular,
    fontSize: 15,
    color: BirthdayColors.textMedium,
  },
});
