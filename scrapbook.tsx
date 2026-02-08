import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import {
  BirthdayColors,
  BirthdayFonts,
  ScrapbookSections,
} from '@/constants/birthday-theme';
import { scrapbookPhotos, PhotoItem } from '@/constants/photos';
import { getSectionPhotos, UploadedPhoto } from '@/services/photoStorage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DECORATIVE_DIVIDERS = [
  ['🌸', '✨', '💕', '✨', '🌸'],
  ['💫', '🌷', '💖', '🌷', '💫'],
  ['✨', '💕', '🌸', '💕', '✨'],
  ['🎀', '✨', '💗', '✨', '🎀'],
  ['🌺', '💫', '💕', '💫', '🌺'],
];

function PolaroidCard({
  photo,
  size,
  uploadedPhoto,
}: {
  photo: PhotoItem;
  size: 'full' | 'half';
  uploadedPhoto?: UploadedPhoto;
}) {
  const cardWidth = size === 'half' ? (SCREEN_WIDTH - 72) / 2 : SCREEN_WIDTH - 80;
  const imageHeight = size === 'half' ? cardWidth - 16 : cardWidth * 0.75;

  // Use uploaded photo if available, otherwise use default
  const imageSource = uploadedPhoto ? { uri: uploadedPhoto.uri } : photo.source;
  const rotation = uploadedPhoto?.rotation ?? photo.rotation ?? 0;
  const washiColor =
    uploadedPhoto?.washiTapeColor ?? photo.washiTapeColor ?? BirthdayColors.blushPink;
  const caption = uploadedPhoto?.caption || photo.caption;

  return (
    <View
      style={[
        styles.polaroid,
        {
          width: cardWidth,
          transform: [{ rotate: `${rotation}deg` }],
        },
      ]}
    >
      {/* Washi tape decoration */}
      <View
        style={[
          styles.washiTape,
          {
            backgroundColor: washiColor,
          },
        ]}
      />

      {/* Photo */}
      <View style={styles.photoContainer}>
        <Image
          source={imageSource}
          style={[styles.photo, { height: imageHeight }]}
          resizeMode="cover"
        />
      </View>

      {/* Caption */}
      <Text style={styles.caption}>{caption}</Text>
    </View>
  );
}

function SectionDivider({ index }: { index: number }) {
  const emojis = DECORATIVE_DIVIDERS[index % DECORATIVE_DIVIDERS.length];
  return (
    <View style={styles.sectionDivider}>
      <View style={styles.dottedLine} />
      <Text style={styles.dividerEmojis}>{emojis.join('  ')}</Text>
      <View style={styles.dottedLine} />
    </View>
  );
}

function ScrapbookSection({
  section,
  photos,
  uploadedPhotos,
  index,
}: {
  section: (typeof ScrapbookSections)[number];
  photos: PhotoItem[];
  uploadedPhotos: UploadedPhoto[];
  index: number;
}) {
  // If no photos from either source, don't render
  if (photos.length === 0 && uploadedPhotos.length === 0) return null;

  // Prefer uploaded photos, fall back to default photos
  const displayPhotos = uploadedPhotos.length > 0 ? uploadedPhotos : photos;
  const hasTwoPhotos = displayPhotos.length >= 2;

  return (
    <View style={styles.sectionWrapper}>
      {/* Section background tint */}
      <View
        style={[
          styles.sectionTint,
          { backgroundColor: section.color + '15' },
        ]}
      />

      {/* Section header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionEmoji}>{section.emoji}</Text>
        <Text style={[styles.sectionTitle, { color: section.color }]}>
          {section.title}
        </Text>
        <Text style={styles.sectionEmoji}>{section.emoji}</Text>
      </View>

      {/* Decorative underline */}
      <View style={styles.sectionUnderline}>
        <View
          style={[styles.underlineDot, { backgroundColor: section.color }]}
        />
        <View
          style={[
            styles.underlineLine,
            { backgroundColor: section.color + '60' },
          ]}
        />
        <View
          style={[styles.underlineDot, { backgroundColor: section.color }]}
        />
      </View>

      {/* Sparkle decorations */}
      <Text style={[styles.sparkleLeft, { top: 40 }]}>✨</Text>
      <Text style={[styles.sparkleRight, { top: 60 }]}>✨</Text>

      {/* Photos */}
      {hasTwoPhotos ? (
        <View style={styles.dualPhotoContainer}>
          <View style={styles.dualPhotoLeft}>
            <PolaroidCard
              photo={photos[0] || ({} as PhotoItem)}
              size="half"
              uploadedPhoto={uploadedPhotos[0]}
            />
          </View>
          <View style={styles.dualPhotoRight}>
            <PolaroidCard
              photo={photos[1] || ({} as PhotoItem)}
              size="half"
              uploadedPhoto={uploadedPhotos[1]}
            />
          </View>
        </View>
      ) : (
        <View style={styles.singlePhotoContainer}>
          <PolaroidCard
            photo={photos[0] || ({} as PhotoItem)}
            size="full"
            uploadedPhoto={uploadedPhotos[0]}
          />
        </View>
      )}

      {/* Divider between sections */}
      {index < ScrapbookSections.length - 1 && (
        <SectionDivider index={index} />
      )}
    </View>
  );
}

export default function ScrapbookScreen() {
  const insets = useSafeAreaInsets();
  const [userPhotos, setUserPhotos] = useState<{ [key: string]: UploadedPhoto[] }>({});

  // Load user photos when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      loadUserPhotos();
    }, [])
  );

  const loadUserPhotos = async () => {
    try {
      const photosData: { [key: string]: UploadedPhoto[] } = {};
      for (const section of ScrapbookSections) {
        photosData[section.id] = await getSectionPhotos(section.id);
      }
      setUserPhotos(photosData);
    } catch (error) {
      console.error('Error loading user photos:', error);
    }
  };

  const getDefaultSectionPhotos = (sectionId: string): PhotoItem[] => {
    return scrapbookPhotos.filter((photo) => photo.section === sectionId);
  };

  const getUserSectionPhotos = (sectionId: string): UploadedPhoto[] => {
    return userPhotos[sectionId] || [];
  };

  // Filter out sections with no photos (either default or user-uploaded)
  const activeSections = ScrapbookSections.filter((section) => {
    const defaultPhotos = getDefaultSectionPhotos(section.id);
    const uploadedPhotos = getUserSectionPhotos(section.id);
    return defaultPhotos.length > 0 || uploadedPhotos.length > 0;
  });

  return (
    <LinearGradient
      colors={[BirthdayColors.cream, BirthdayColors.softRose, BirthdayColors.softLavender]}
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

          <View style={{ flex: 1 }} />

          <Pressable
            onPress={() => router.push('/birthday/manage-photos')}
            style={styles.manageButton}
            hitSlop={12}
          >
            <Ionicons
              name="images-outline"
              size={20}
              color={BirthdayColors.white}
            />
            <Text style={styles.manageButtonText}>Manage</Text>
          </Pressable>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleSparkle}>✨</Text>
          <Text style={styles.title}>{"Divita's Scrapbook"}</Text>
          <Text style={styles.titleCamera}>📸</Text>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>A collection of beautiful moments</Text>

        {/* Decorative opening border */}
        <View style={styles.openingDecoration}>
          <Text style={styles.openingEmojis}>🌸 💕 ✨ 💕 🌸</Text>
          <View style={styles.openingLine} />
        </View>

        {/* Sections */}
        {activeSections.map((section, index) => (
          <ScrapbookSection
            key={section.id}
            section={section}
            photos={getDefaultSectionPhotos(section.id)}
            uploadedPhotos={getUserSectionPhotos(section.id)}
            index={index}
          />
        ))}

        {/* Footer decoration */}
        <View style={styles.footerDecoration}>
          <View style={styles.footerLine} />
          <Text style={styles.footerEmojis}>💖 ✨ 🌸 ✨ 💖</Text>
          <Text style={styles.footerText}>Made with love for Divita</Text>
          <Text style={styles.footerHearts}>💕💕💕</Text>
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

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
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
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BirthdayColors.roseGold,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 22,
    gap: 6,
    shadowColor: BirthdayColors.roseGold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  manageButtonText: {
    fontFamily: BirthdayFonts.bodyMedium,
    fontSize: 14,
    color: BirthdayColors.white,
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
  titleSparkle: {
    fontSize: 22,
    marginRight: 6,
  },
  titleCamera: {
    fontSize: 22,
    marginLeft: 6,
  },
  subtitle: {
    fontFamily: BirthdayFonts.handwrittenRegular,
    fontSize: 16,
    color: BirthdayColors.textMedium,
    textAlign: 'center',
    marginBottom: 16,
  },

  // Opening decoration
  openingDecoration: {
    alignItems: 'center',
    marginBottom: 24,
  },
  openingEmojis: {
    fontSize: 14,
    letterSpacing: 4,
    marginBottom: 8,
  },
  openingLine: {
    width: '60%',
    height: 1,
    backgroundColor: BirthdayColors.blushPink,
  },

  // Section wrapper
  sectionWrapper: {
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    paddingVertical: 20,
    paddingHorizontal: 4,
  },
  sectionTint: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    gap: 8,
  },
  sectionEmoji: {
    fontSize: 20,
  },
  sectionTitle: {
    fontFamily: BirthdayFonts.handwritten,
    fontSize: 26,
    textAlign: 'center',
  },

  // Section underline
  sectionUnderline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 6,
  },
  underlineDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  underlineLine: {
    width: 80,
    height: 2,
    borderRadius: 1,
  },

  // Sparkle decorations
  sparkleLeft: {
    position: 'absolute',
    left: 4,
    fontSize: 12,
    opacity: 0.6,
  },
  sparkleRight: {
    position: 'absolute',
    right: 4,
    fontSize: 12,
    opacity: 0.6,
  },

  // Photo containers
  dualPhotoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 4,
  },
  dualPhotoLeft: {
    marginTop: 8,
  },
  dualPhotoRight: {
    marginTop: -4,
  },
  singlePhotoContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  // Polaroid card
  polaroid: {
    backgroundColor: BirthdayColors.white,
    borderRadius: 6,
    padding: 8,
    paddingBottom: 28,
    shadowColor: BirthdayColors.roseGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
    position: 'relative',
    marginVertical: 6,
  },
  washiTape: {
    position: 'absolute',
    top: -10,
    left: '25%',
    width: '50%',
    height: 20,
    borderRadius: 4,
    opacity: 0.75,
    zIndex: 10,
  },
  photoContainer: {
    borderRadius: 3,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    borderRadius: 3,
  },
  caption: {
    fontFamily: BirthdayFonts.handwrittenRegular,
    fontSize: 14,
    color: BirthdayColors.textMedium,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 4,
  },

  // Section divider
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 4,
    paddingHorizontal: 12,
    gap: 8,
  },
  dottedLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: BirthdayColors.blushPink + '80',
  },
  dividerEmojis: {
    fontSize: 12,
    letterSpacing: 2,
  },

  // Footer
  footerDecoration: {
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 20,
  },
  footerLine: {
    width: '50%',
    height: 1,
    backgroundColor: BirthdayColors.blushPink,
    marginBottom: 16,
  },
  footerEmojis: {
    fontSize: 16,
    letterSpacing: 4,
    marginBottom: 12,
  },
  footerText: {
    fontFamily: BirthdayFonts.handwrittenRegular,
    fontSize: 18,
    color: BirthdayColors.roseGold,
    marginBottom: 8,
  },
  footerHearts: {
    fontSize: 14,
    letterSpacing: 4,
  },
});
