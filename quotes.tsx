import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTextGeneration } from '@fastshot/ai';
import {
  BirthdayColors,
  BirthdayFonts,
  BirthdayShadow,
} from '@/constants/birthday-theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = 30;
const CARD_WIDTH = SCREEN_WIDTH - CARD_PADDING * 2;

const QUOTES = [
  'You are not just beautiful on the outside, Divita. Your heart radiates warmth that touches everyone around you. \u{1F496}',
  'Some people make the world a better place just by existing. You are one of them. \u{2728}',
  'Be so confident in who you are that no one\'s opinion can shake you. You are enough. \u{1F338}',
  'The world needs your light, your laughter, and your love. Never dim your shine. \u{1F4AB}',
  'You deserve every beautiful thing that life has to offer. Remember that always. \u{1F98B}',
  'Here\'s to the girl who is strong, kind, and absolutely unstoppable. Happy Birthday! \u{1F382}',
  'Your smile has the power to heal hearts and brighten even the darkest days. \u{1F60A}',
  'May this year bring you adventures, love, and endless moments of pure happiness. \u{1F31F}',
  'You are a masterpiece \u2014 still being painted, still unfolding, still becoming. \u{1F3A8}',
  'To know you is to love you. To love you is to never stop being amazed. \u{1F495}',
];

const PASTEL_BACKGROUNDS: [string, string][] = [
  [BirthdayColors.blushPink, BirthdayColors.softRose],
  [BirthdayColors.softLavender, BirthdayColors.lavender],
  [BirthdayColors.peach, BirthdayColors.warmCream],
  [BirthdayColors.babyBlue, BirthdayColors.cream],
  [BirthdayColors.mintGreen, BirthdayColors.cream],
  [BirthdayColors.softGold, BirthdayColors.warmCream],
  [BirthdayColors.softRose, BirthdayColors.blushPink],
  [BirthdayColors.cream, BirthdayColors.softLavender],
  [BirthdayColors.warmCream, BirthdayColors.peach],
  [BirthdayColors.softLavender, BirthdayColors.softRose],
];

const AI_PROMPT =
  'Generate a short, heartfelt birthday affirmation for a girl named Divita. Make it warm, poetic, and uplifting. Keep it under 50 words. Add emojis.';

export default function QuotesScreen() {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const [aiQuote, setAiQuote] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.9)).current;

  const { generateText, isLoading: isAiLoading } = useTextGeneration({
    onSuccess: (text) => {
      setAiQuote(text);
      setAiError(null);
    },
    onError: () => {
      setAiError('Could not generate a quote right now. Please try again later.');
    },
  });

  // Total pages: quotes + optional AI card (always show slot for it)
  const totalPages = QUOTES.length + 1;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerOpacity, cardScale]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const handleGenerateAiQuote = () => {
    setAiError(null);
    generateText(AI_PROMPT);
  };

  const renderQuoteCard = (quote: string, index: number) => {
    const colors = PASTEL_BACKGROUNDS[index % PASTEL_BACKGROUNDS.length];

    return (
      <View key={index} style={styles.cardContainer}>
        <Animated.View style={[styles.cardWrapper, { transform: [{ scale: cardScale }] }]}>
          <LinearGradient
            colors={[colors[0], colors[1]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            {/* Decorative quote mark */}
            <Text style={styles.decorativeQuote}>{'\u201C'}</Text>

            {/* Sparkle decorations */}
            <Text style={styles.sparkleTopRight}>{'\u2728'}</Text>

            {/* Quote text */}
            <View style={styles.quoteTextContainer}>
              <Text style={styles.quoteText}>{quote}</Text>
            </View>

            {/* Bottom sparkle */}
            <Text style={styles.sparkleBottomLeft}>{'\u2728'}</Text>

            {/* Card number */}
            <Text style={styles.cardNumber}>
              {index + 1} / {QUOTES.length}
            </Text>
          </LinearGradient>
        </Animated.View>
      </View>
    );
  };

  const renderAiCard = () => {
    return (
      <View key="ai-card" style={styles.cardContainer}>
        <Animated.View style={[styles.cardWrapper, { transform: [{ scale: cardScale }] }]}>
          <LinearGradient
            colors={['#F0D9B5', '#D4A574']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            {/* Gold sparkles */}
            <Text style={styles.sparkleTopRight}>{'\u2728'}</Text>
            <Text style={styles.sparkleBottomLeft}>{'\u{1F4AB}'}</Text>

            {aiQuote ? (
              <>
                <Text style={styles.decorativeQuote}>{'\u201C'}</Text>
                <View style={styles.quoteTextContainer}>
                  <Text style={[styles.quoteText, styles.aiQuoteText]}>{aiQuote}</Text>
                </View>
                <Text style={styles.aiLabel}>AI-generated just for you</Text>
                <TouchableOpacity
                  style={styles.regenerateButton}
                  onPress={handleGenerateAiQuote}
                  activeOpacity={0.7}
                  disabled={isAiLoading}
                >
                  <Text style={styles.regenerateButtonText}>
                    {isAiLoading ? 'Generating...' : 'Generate Another \u2728'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.aiPromptContainer}>
                <Text style={styles.aiPromptEmoji}>{'\u2728'}</Text>
                <Text style={styles.aiPromptTitle}>A Special Quote for You</Text>
                <Text style={styles.aiPromptSubtitle}>
                  Let AI craft a personalized birthday affirmation just for you, Divita!
                </Text>

                {aiError ? (
                  <Text style={styles.aiErrorText}>{aiError}</Text>
                ) : null}

                <TouchableOpacity
                  style={styles.generateButton}
                  onPress={handleGenerateAiQuote}
                  activeOpacity={0.8}
                  disabled={isAiLoading}
                >
                  <LinearGradient
                    colors={[BirthdayColors.gold, BirthdayColors.roseGold]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.generateButtonGradient}
                  >
                    {isAiLoading ? (
                      <View style={styles.loadingRow}>
                        <ActivityIndicator size="small" color={BirthdayColors.white} />
                        <Text style={styles.generateButtonText}> Creating magic...</Text>
                      </View>
                    ) : (
                      <Text style={styles.generateButtonText}>Get AI Quote {'\u2728'}</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </LinearGradient>
        </Animated.View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={[BirthdayColors.gradientStart, BirthdayColors.gradientMiddle, BirthdayColors.gradientEnd]}
      style={styles.container}
    >
      <View style={[styles.topSection, { paddingTop: insets.top + 10 }]}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>{'<'} Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <Animated.View style={[styles.headerContainer, { opacity: headerOpacity }]}>
          <Text style={styles.headerTitle}>Words of Love & Light {'\u{1F4AB}'}</Text>
          <Text style={styles.headerSubtitle}>Swipe to read each one with love</Text>
        </Animated.View>
      </View>

      {/* Quote Cards - Horizontal Swipeable */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {QUOTES.map((quote, index) => renderQuoteCard(quote, index))}
        {renderAiCard()}
      </ScrollView>

      {/* Page Dots */}
      <View style={[styles.dotsContainer, { paddingBottom: insets.bottom + 20 }]}>
        {Array.from({ length: totalPages }).map((_, index) => {
          const isActive = index === activeIndex;
          const isAiDot = index === QUOTES.length;
          return (
            <View
              key={index}
              style={[
                styles.dot,
                isActive && styles.dotActive,
                isAiDot && styles.dotAi,
                isAiDot && isActive && styles.dotAiActive,
              ]}
            />
          );
        })}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  backButtonText: {
    fontFamily: BirthdayFonts.bodyMedium,
    fontSize: 16,
    color: BirthdayColors.deepPink,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontFamily: BirthdayFonts.handwritten,
    fontSize: 32,
    color: BirthdayColors.deepPink,
    textAlign: 'center',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontFamily: BirthdayFonts.elegantItalic,
    fontSize: 15,
    color: BirthdayColors.textMedium,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
  },
  cardContainer: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: CARD_PADDING,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    borderRadius: 24,
    ...BirthdayShadow,
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  card: {
    borderRadius: 24,
    padding: 28,
    minHeight: 380,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  decorativeQuote: {
    fontFamily: BirthdayFonts.script,
    fontSize: 80,
    color: 'rgba(255, 255, 255, 0.5)',
    position: 'absolute',
    top: 10,
    left: 20,
    lineHeight: 90,
  },
  sparkleTopRight: {
    position: 'absolute',
    top: 18,
    right: 20,
    fontSize: 22,
  },
  sparkleBottomLeft: {
    position: 'absolute',
    bottom: 18,
    left: 20,
    fontSize: 22,
  },
  quoteTextContainer: {
    paddingHorizontal: 8,
    paddingTop: 30,
    paddingBottom: 20,
  },
  quoteText: {
    fontFamily: BirthdayFonts.elegantItalic,
    fontSize: 20,
    color: BirthdayColors.textDark,
    lineHeight: 32,
    textAlign: 'center',
  },
  aiQuoteText: {
    color: '#3B2E1E',
  },
  cardNumber: {
    fontFamily: BirthdayFonts.body,
    fontSize: 12,
    color: 'rgba(74, 59, 59, 0.4)',
    textAlign: 'center',
    position: 'absolute',
    bottom: 16,
    right: 20,
  },
  aiLabel: {
    fontFamily: BirthdayFonts.body,
    fontSize: 12,
    color: 'rgba(59, 46, 30, 0.5)',
    textAlign: 'center',
    marginTop: 4,
  },
  regenerateButton: {
    alignSelf: 'center',
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 20,
  },
  regenerateButtonText: {
    fontFamily: BirthdayFonts.bodySemiBold,
    fontSize: 14,
    color: '#3B2E1E',
  },
  aiPromptContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  aiPromptEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  aiPromptTitle: {
    fontFamily: BirthdayFonts.handwritten,
    fontSize: 26,
    color: '#3B2E1E',
    textAlign: 'center',
    marginBottom: 10,
  },
  aiPromptSubtitle: {
    fontFamily: BirthdayFonts.body,
    fontSize: 15,
    color: 'rgba(59, 46, 30, 0.7)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  aiErrorText: {
    fontFamily: BirthdayFonts.body,
    fontSize: 13,
    color: '#8B3A3A',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  generateButton: {
    borderRadius: 24,
    overflow: 'hidden',
    ...BirthdayShadow,
  },
  generateButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateButtonText: {
    fontFamily: BirthdayFonts.bodySemiBold,
    fontSize: 17,
    color: BirthdayColors.white,
    letterSpacing: 0.3,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BirthdayColors.softRose,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: BirthdayColors.deepPink,
    borderRadius: 4,
  },
  dotAi: {
    backgroundColor: BirthdayColors.softGold,
  },
  dotAiActive: {
    backgroundColor: BirthdayColors.gold,
    width: 24,
  },
});
