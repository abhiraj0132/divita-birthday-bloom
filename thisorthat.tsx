import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BirthdayColors,
  BirthdayFonts,
  BirthdayShadow,
  ThisOrThatChoices,
} from '@/constants/birthday-theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PASTEL_PAIRS: [string, string][] = [
  [BirthdayColors.blushPink, BirthdayColors.softLavender],
  [BirthdayColors.peach, BirthdayColors.babyBlue],
  [BirthdayColors.mintGreen, BirthdayColors.softRose],
  [BirthdayColors.softGold, BirthdayColors.blushPink],
  [BirthdayColors.babyBlue, BirthdayColors.peach],
  [BirthdayColors.softLavender, BirthdayColors.mintGreen],
  [BirthdayColors.softRose, BirthdayColors.softGold],
  [BirthdayColors.blushPink, BirthdayColors.babyBlue],
];

export default function ThisOrThatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedSide, setSelectedSide] = useState<'A' | 'B' | null>(null);

  const cardOpacity = useRef(new Animated.Value(1)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const leftScale = useRef(new Animated.Value(1)).current;
  const rightScale = useRef(new Animated.Value(1)).current;
  const celebrationOpacity = useRef(new Animated.Value(0)).current;

  const total = ThisOrThatChoices.length;
  const progress = (currentIndex + 1) / total;
  const currentChoice = ThisOrThatChoices[currentIndex];
  const colors = PASTEL_PAIRS[currentIndex % PASTEL_PAIRS.length];

  const handleChoice = useCallback(
    (side: 'A' | 'B') => {
      if (selectedSide) return;

      setSelectedSide(side);
      const chosenText = side === 'A' ? currentChoice.optionA : currentChoice.optionB;
      const scaleAnim = side === 'A' ? leftScale : rightScale;

      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          friction: 4,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(cardOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(cardScale, {
            toValue: 0.9,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        const newChoices = [...choices, chosenText];
        setChoices(newChoices);

        if (currentIndex < total - 1) {
          setCurrentIndex((prev) => prev + 1);
          setSelectedSide(null);

          cardOpacity.setValue(0);
          cardScale.setValue(1.1);
          leftScale.setValue(1);
          rightScale.setValue(1);

          Animated.parallel([
            Animated.timing(cardOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.spring(cardScale, {
              toValue: 1,
              friction: 6,
              tension: 40,
              useNativeDriver: true,
            }),
          ]).start();
        } else {
          setIsFinished(true);
          Animated.timing(celebrationOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }).start();
        }
      });
    },
    [
      selectedSide,
      currentChoice,
      leftScale,
      rightScale,
      cardOpacity,
      cardScale,
      choices,
      currentIndex,
      total,
      celebrationOpacity,
    ]
  );

  if (isFinished) {
    return (
      <LinearGradient
        colors={[BirthdayColors.blushPink, BirthdayColors.softLavender, BirthdayColors.lavender]}
        style={styles.container}
      >
        <StatusBar barStyle="dark-content" />
        <Animated.ScrollView
          style={{ opacity: celebrationOpacity }}
          contentContainerStyle={[
            styles.resultsContent,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 30 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.resultsEmoji}>{'\u2728'}</Text>
          <Text style={styles.resultsTitle}>{'Your Picks!'}</Text>
          <Text style={styles.resultsSubtitle}>
            {'Every choice tells a story about who you are, Divita \uD83D\uDC96'}
          </Text>

          <View style={styles.choicesList}>
            {choices.map((choice, idx) => (
              <View key={idx} style={styles.choiceItem}>
                <View
                  style={[
                    styles.choiceBadge,
                    { backgroundColor: PASTEL_PAIRS[idx % PASTEL_PAIRS.length][0] },
                  ]}
                >
                  <Text style={styles.choiceNumber}>{idx + 1}</Text>
                </View>
                <Text style={styles.choiceText}>{choice}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[BirthdayColors.deepPink, BirthdayColors.roseGold]}
              style={styles.doneButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.doneButtonText}>{'Back to Games \uD83C\uDFAE'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[BirthdayColors.gradientStart, BirthdayColors.gradientMiddle, BirthdayColors.gradientEnd]}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />
      <View style={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.backText}>{'\u2190 Back'}</Text>
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{`${currentIndex + 1} / ${total}`}</Text>
        </View>

        <Text style={styles.heading}>{'This or That? \uD83E\uDD14'}</Text>
        <Text style={styles.instruction}>{'Tap your pick!'}</Text>

        <Animated.View
          style={[
            styles.cardsRow,
            {
              opacity: cardOpacity,
              transform: [{ scale: cardScale }],
            },
          ]}
        >
          <Animated.View style={[styles.choiceCardWrapper, { transform: [{ scale: leftScale }] }]}>
            <TouchableOpacity
              style={[
                styles.choiceCard,
                { backgroundColor: colors[0] },
                selectedSide === 'A' && styles.choiceCardSelected,
              ]}
              onPress={() => handleChoice('A')}
              activeOpacity={0.85}
              disabled={selectedSide !== null}
            >
              <Text style={styles.choiceCardText}>{currentChoice.optionA}</Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>{'VS'}</Text>
          </View>

          <Animated.View style={[styles.choiceCardWrapper, { transform: [{ scale: rightScale }] }]}>
            <TouchableOpacity
              style={[
                styles.choiceCard,
                { backgroundColor: colors[1] },
                selectedSide === 'B' && styles.choiceCardSelected,
              ]}
              onPress={() => handleChoice('B')}
              activeOpacity={0.85}
              disabled={selectedSide !== null}
            >
              <Text style={styles.choiceCardText}>{currentChoice.optionB}</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const CARD_SIDE = (SCREEN_WIDTH - 60) / 2 - 10;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  backText: {
    fontFamily: BirthdayFonts.bodyMedium,
    fontSize: 16,
    color: BirthdayColors.roseGold,
  },
  progressContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  progressBackground: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: BirthdayColors.deepPink,
    borderRadius: 4,
  },
  progressText: {
    fontFamily: BirthdayFonts.bodyMedium,
    fontSize: 13,
    color: BirthdayColors.textMedium,
  },
  heading: {
    fontFamily: BirthdayFonts.handwritten,
    fontSize: 32,
    color: BirthdayColors.textDark,
    textAlign: 'center',
    marginBottom: 6,
  },
  instruction: {
    fontFamily: BirthdayFonts.body,
    fontSize: 15,
    color: BirthdayColors.textMedium,
    textAlign: 'center',
    marginBottom: 32,
  },
  cardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    maxHeight: 340,
  },
  choiceCardWrapper: {
    flex: 1,
  },
  choiceCard: {
    height: CARD_SIDE * 1.3,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    ...BirthdayShadow,
  },
  choiceCardSelected: {
    borderWidth: 3,
    borderColor: BirthdayColors.deepPink,
  },
  choiceCardText: {
    fontFamily: BirthdayFonts.bodySemiBold,
    fontSize: 18,
    color: BirthdayColors.textDark,
    textAlign: 'center',
    lineHeight: 26,
  },
  vsContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BirthdayColors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    ...BirthdayShadow,
  },
  vsText: {
    fontFamily: BirthdayFonts.bodyBold,
    fontSize: 14,
    color: BirthdayColors.deepPink,
  },
  // Results
  resultsContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  resultsEmoji: {
    fontSize: 56,
    textAlign: 'center',
    marginBottom: 8,
  },
  resultsTitle: {
    fontFamily: BirthdayFonts.handwritten,
    fontSize: 34,
    color: BirthdayColors.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  resultsSubtitle: {
    fontFamily: BirthdayFonts.body,
    fontSize: 15,
    color: BirthdayColors.textMedium,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  choicesList: {
    width: '100%',
    gap: 10,
    marginBottom: 28,
  },
  choiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BirthdayColors.white,
    borderRadius: 16,
    padding: 14,
    ...BirthdayShadow,
  },
  choiceBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  choiceNumber: {
    fontFamily: BirthdayFonts.bodySemiBold,
    fontSize: 14,
    color: BirthdayColors.textDark,
  },
  choiceText: {
    fontFamily: BirthdayFonts.bodyMedium,
    fontSize: 15,
    color: BirthdayColors.textDark,
    flex: 1,
  },
  doneButton: {
    borderRadius: 24,
    overflow: 'hidden',
    ...BirthdayShadow,
    width: SCREEN_WIDTH - 80,
  },
  doneButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: 'center',
  },
  doneButtonText: {
    fontFamily: BirthdayFonts.bodySemiBold,
    fontSize: 17,
    color: BirthdayColors.white,
  },
});
