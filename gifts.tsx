import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BirthdayColors,
  BirthdayFonts,
  BirthdayLetter,
  BirthdayShadow,
} from '@/constants/birthday-theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GiftData {
  id: string;
  title: string;
  emoji: string;
  revealEmojis: string;
  message: string;
}

const GIFTS: GiftData[] = [
  {
    id: 'bouquet',
    title: 'Virtual Bouquet',
    emoji: '\uD83D\uDC90',
    revealEmojis: '\uD83C\uDF39\uD83C\uDF38\uD83C\uDF37\uD83C\uDF3A\uD83C\uDF3B\uD83D\uDC90',
    message: 'A bouquet as beautiful as you! \uD83C\uDF38',
  },
  {
    id: 'cake',
    title: 'Birthday Cake',
    emoji: '\uD83C\uDF82',
    revealEmojis: '\uD83C\uDF82\uD83C\uDF70\uD83E\uDDC1',
    message: 'Make a wish, birthday girl! \u2728',
  },
  {
    id: 'giftcard',
    title: 'Gift Card',
    emoji: '\uD83D\uDC9D',
    revealEmojis: '\uD83D\uDC96',
    message: 'One wish granted \u2014 whatever your heart desires! \uD83D\uDC96',
  },
];

interface GiftBoxProps {
  gift: GiftData;
  delay: number;
}

function GiftBox({ gift, delay }: GiftBoxProps) {
  const [opened, setOpened] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const revealOpacity = useRef(new Animated.Value(0)).current;
  const revealScale = useRef(new Animated.Value(0.3)).current;
  const giftBoxOpacity = useRef(new Animated.Value(1)).current;
  const entranceOpacity = useRef(new Animated.Value(0)).current;
  const entranceTranslateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(entranceOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(entranceTranslateY, {
          toValue: 0,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [delay, entranceOpacity, entranceTranslateY]);

  const handleOpen = () => {
    if (opened) return;
    setOpened(true);

    Animated.sequence([
      // Shake the gift box
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.15,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      // Fade out gift box
      Animated.timing(giftBoxOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      // Reveal content with bounce
      Animated.parallel([
        Animated.timing(revealOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(revealScale, {
          toValue: 1,
          friction: 4,
          tension: 50,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  return (
    <Animated.View
      style={[
        styles.giftCard,
        {
          opacity: entranceOpacity,
          transform: [{ translateY: entranceTranslateY }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={handleOpen}
        activeOpacity={0.8}
        style={styles.giftTouchable}
      >
        {/* Gift box (before opening) */}
        <Animated.View
          style={[
            styles.giftBoxContent,
            {
              opacity: giftBoxOpacity,
              transform: [{ scale: scaleAnim }],
            },
          ]}
          pointerEvents={opened ? 'none' : 'auto'}
        >
          <Text style={styles.giftBoxEmoji}>{'\uD83C\uDF81'}</Text>
          <Text style={styles.giftTitle}>{gift.title}</Text>
          <Text style={styles.tapToOpen}>Tap to Open!</Text>
        </Animated.View>

        {/* Revealed content */}
        {opened && (
          <Animated.View
            style={[
              styles.giftRevealContent,
              {
                opacity: revealOpacity,
                transform: [{ scale: revealScale }],
              },
            ]}
          >
            <Text style={styles.revealEmojis}>{gift.revealEmojis}</Text>
            <Text style={styles.revealMessage}>{gift.message}</Text>
          </Animated.View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

function LetterSection() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(800),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [fadeAnim, translateY]);

  // Split the letter to style the greeting and closing differently
  const letterLines = BirthdayLetter.split('\n');

  return (
    <Animated.View
      style={[
        styles.letterContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      {/* Letter Header */}
      <Text style={styles.letterHeader}>A Letter For You {'\uD83D\uDC8C'}</Text>

      {/* Parchment card */}
      <View style={styles.letterCard}>
        {/* Corner hearts */}
        <Text style={styles.cornerHeartTopLeft}>{'\u2764\uFE0F'}</Text>
        <Text style={styles.cornerHeartTopRight}>{'\uD83D\uDC95'}</Text>
        <Text style={styles.cornerHeartBottomLeft}>{'\uD83D\uDC97'}</Text>
        <Text style={styles.cornerHeartBottomRight}>{'\u2764\uFE0F'}</Text>

        <ScrollView
          style={styles.letterScroll}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {letterLines.map((line, index) => {
            // Style the date line
            if (index === 0) {
              return (
                <Text key={index} style={styles.letterDate}>
                  {line}
                </Text>
              );
            }
            // Style the greeting
            if (line.startsWith('My Dearest') || line.startsWith('Happy Birthday, beautiful')) {
              return (
                <Text key={index} style={styles.letterGreeting}>
                  {line}
                </Text>
              );
            }
            // Style the closing
            if (
              line.startsWith('With all the love') ||
              line.startsWith('From Abhiraj') ||
              line.startsWith('P.S.')
            ) {
              return (
                <Text key={index} style={styles.letterClosing}>
                  {line}
                </Text>
              );
            }
            // Regular paragraph lines
            if (line.trim() === '') {
              return <View key={index} style={styles.letterSpacer} />;
            }
            return (
              <Text key={index} style={styles.letterBody}>
                {line}
              </Text>
            );
          })}
        </ScrollView>
      </View>
    </Animated.View>
  );
}

export default function GiftsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [headerOpacity]);

  return (
    <LinearGradient
      colors={[BirthdayColors.gradientStart, BirthdayColors.gradientMiddle, BirthdayColors.gradientEnd]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="dark-content" />

      {/* Back Button */}
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 10 }]}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Text style={styles.backButtonText}>{'\u2190'}</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 60,
            paddingBottom: insets.bottom + 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.Text style={[styles.screenTitle, { opacity: headerOpacity }]}>
          Gifts For You, Divita {'\uD83C\uDF81'}
        </Animated.Text>

        {/* Gift Boxes Row */}
        <View style={styles.giftsRow}>
          {GIFTS.map((gift, index) => (
            <GiftBox key={gift.id} gift={gift} delay={index * 200} />
          ))}
        </View>

        {/* Letter Section */}
        <LetterSection />
      </ScrollView>
    </LinearGradient>
  );
}

const CARD_WIDTH = (SCREEN_WIDTH - 60 - 20) / 3; // 60 = horizontal padding, 20 = gaps

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    backgroundColor: BirthdayColors.white,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...BirthdayShadow,
  },
  backButtonText: {
    fontSize: 22,
    color: BirthdayColors.textDark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  screenTitle: {
    fontFamily: BirthdayFonts.handwritten,
    fontSize: 32,
    color: BirthdayColors.textDark,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 42,
  },
  giftsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 32,
  },
  giftCard: {
    width: CARD_WIDTH,
    minHeight: CARD_WIDTH * 1.3,
    backgroundColor: BirthdayColors.white,
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...BirthdayShadow,
  },
  giftTouchable: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftBoxContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftBoxEmoji: {
    fontSize: 60,
    marginBottom: 8,
  },
  giftTitle: {
    fontFamily: BirthdayFonts.bodySemiBold,
    fontSize: 11,
    color: BirthdayColors.textDark,
    textAlign: 'center',
    marginBottom: 4,
  },
  tapToOpen: {
    fontFamily: BirthdayFonts.body,
    fontSize: 10,
    color: BirthdayColors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  giftRevealContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  revealEmojis: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 36,
  },
  revealMessage: {
    fontFamily: BirthdayFonts.body,
    fontSize: 10,
    color: BirthdayColors.textMedium,
    textAlign: 'center',
    lineHeight: 15,
  },
  // Letter Section
  letterContainer: {
    marginTop: 8,
  },
  letterHeader: {
    fontFamily: BirthdayFonts.handwritten,
    fontSize: 28,
    color: BirthdayColors.textDark,
    textAlign: 'center',
    marginBottom: 16,
  },
  letterCard: {
    backgroundColor: BirthdayColors.warmCream,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: BirthdayColors.softGold,
    ...BirthdayShadow,
    position: 'relative',
    overflow: 'hidden',
  },
  letterScroll: {
    maxHeight: 500,
  },
  cornerHeartTopLeft: {
    position: 'absolute',
    top: 8,
    left: 10,
    fontSize: 12,
    zIndex: 1,
  },
  cornerHeartTopRight: {
    position: 'absolute',
    top: 8,
    right: 10,
    fontSize: 12,
    zIndex: 1,
  },
  cornerHeartBottomLeft: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    fontSize: 12,
    zIndex: 1,
  },
  cornerHeartBottomRight: {
    position: 'absolute',
    bottom: 8,
    right: 10,
    fontSize: 12,
    zIndex: 1,
  },
  letterDate: {
    fontFamily: BirthdayFonts.script,
    fontSize: 22,
    color: BirthdayColors.roseGold,
    textAlign: 'right',
    marginBottom: 4,
  },
  letterGreeting: {
    fontFamily: BirthdayFonts.handwritten,
    fontSize: 20,
    color: BirthdayColors.deepPink,
    lineHeight: 28,
    marginBottom: 2,
  },
  letterBody: {
    fontFamily: BirthdayFonts.body,
    fontSize: 14,
    color: BirthdayColors.textDark,
    lineHeight: 24,
  },
  letterClosing: {
    fontFamily: BirthdayFonts.script,
    fontSize: 22,
    color: BirthdayColors.roseGold,
    lineHeight: 30,
  },
  letterSpacer: {
    height: 12,
  },
});
