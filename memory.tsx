import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  MemoryMatchIcons,
} from '@/constants/birthday-theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 20;
const CARD_GAP = 10;
const GRID_COLUMNS = 4;
const CARD_SIZE = (SCREEN_WIDTH - GRID_PADDING * 2 - CARD_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

interface Card {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

function createShuffledCards(): Card[] {
  const icons = [...MemoryMatchIcons, ...MemoryMatchIcons];
  // Fisher-Yates shuffle
  for (let i = icons.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [icons[i], icons[j]] = [icons[j], icons[i]];
  }
  return icons.map((icon, index) => ({
    id: index,
    icon,
    isFlipped: false,
    isMatched: false,
  }));
}

interface MemoryCardProps {
  card: Card;
  onPress: () => void;
  disabled: boolean;
}

function MemoryCard({ card, onPress, disabled }: MemoryCardProps) {
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(flipAnim, {
      toValue: card.isFlipped || card.isMatched ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [card.isFlipped, card.isMatched, flipAnim]);

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '90deg', '0deg'],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.49, 0.5, 1],
    outputRange: [0, 0, 1, 1],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.49, 0.5, 1],
    outputRange: [1, 1, 0, 0],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || card.isFlipped || card.isMatched}
    >
      <View style={styles.cardContainer}>
        {/* Back of card (face down) */}
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            {
              opacity: backOpacity,
              transform: [{ rotateY: frontInterpolate }],
            },
          ]}
        >
          <Text style={styles.cardBackEmoji}>{'\uD83C\uDF38'}</Text>
        </Animated.View>

        {/* Front of card (face up) */}
        <Animated.View
          style={[
            styles.card,
            styles.cardFront,
            card.isMatched && styles.cardMatched,
            {
              opacity: frontOpacity,
              transform: [{ rotateY: frontInterpolate }],
            },
          ]}
        >
          <Text style={styles.cardFrontEmoji}>{card.icon}</Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

export default function MemoryMatchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [cards, setCards] = useState<Card[]>(() => createShuffledCards());
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const celebrationScale = useRef(new Animated.Value(0)).current;
  const totalPairs = MemoryMatchIcons.length;

  const handleCardPress = useCallback(
    (index: number) => {
      if (isChecking) return;
      if (flippedIndices.length >= 2) return;
      if (cards[index].isFlipped || cards[index].isMatched) return;

      const newCards = [...cards];
      newCards[index] = { ...newCards[index], isFlipped: true };
      setCards(newCards);

      const newFlipped = [...flippedIndices, index];
      setFlippedIndices(newFlipped);

      if (newFlipped.length === 2) {
        setMoves((prev) => prev + 1);
        setIsChecking(true);

        const [first, second] = newFlipped;
        if (newCards[first].icon === newCards[second].icon) {
          // Match found
          setTimeout(() => {
            setCards((prev) => {
              const updated = [...prev];
              updated[first] = { ...updated[first], isMatched: true, isFlipped: false };
              updated[second] = { ...updated[second], isMatched: true, isFlipped: false };
              return updated;
            });
            const newMatches = matches + 1;
            setMatches(newMatches);
            setFlippedIndices([]);
            setIsChecking(false);

            if (newMatches === totalPairs) {
              setIsComplete(true);
              celebrationScale.setValue(0);
              Animated.spring(celebrationScale, {
                toValue: 1,
                friction: 4,
                tension: 40,
                useNativeDriver: true,
              }).start();
            }
          }, 500);
        } else {
          // No match
          setTimeout(() => {
            setCards((prev) => {
              const updated = [...prev];
              updated[first] = { ...updated[first], isFlipped: false };
              updated[second] = { ...updated[second], isFlipped: false };
              return updated;
            });
            setFlippedIndices([]);
            setIsChecking(false);
          }, 1000);
        }
      }
    },
    [cards, flippedIndices, isChecking, matches, totalPairs, celebrationScale]
  );

  const handleRestart = () => {
    setCards(createShuffledCards());
    setFlippedIndices([]);
    setMoves(0);
    setMatches(0);
    setIsChecking(false);
    setIsComplete(false);
  };

  if (isComplete) {
    return (
      <LinearGradient
        colors={[BirthdayColors.blushPink, BirthdayColors.softLavender, BirthdayColors.lavender]}
        style={styles.container}
      >
        <StatusBar barStyle="dark-content" />
        <View
          style={[
            styles.celebrationContent,
            { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 30 },
          ]}
        >
          <Animated.View style={[styles.celebrationCard, { transform: [{ scale: celebrationScale }] }]}>
            <Text style={styles.celebrationEmoji}>{'\uD83C\uDF89\uD83C\uDF8A'}</Text>
            <Text style={styles.celebrationTitle}>{'Amazing, Divita!'}</Text>
            <Text style={styles.celebrationSubtitle}>
              {'You matched all the pairs!'}
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{moves}</Text>
                <Text style={styles.statLabel}>{'Moves'}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{totalPairs}</Text>
                <Text style={styles.statLabel}>{'Pairs'}</Text>
              </View>
            </View>

            <Text style={styles.celebrationMessage}>
              {moves <= 12
                ? 'Incredible memory! You are a genius! \uD83E\uDDE0\u2728'
                : moves <= 18
                  ? 'Great job! Your memory is sharp! \uD83C\uDF1F'
                  : 'You did it! Practice makes perfect! \uD83D\uDC96'}
            </Text>
          </Animated.View>

          <View style={styles.celebrationButtons}>
            <TouchableOpacity style={styles.restartButton} onPress={handleRestart} activeOpacity={0.8}>
              <Text style={styles.restartButtonText}>{'Play Again \uD83D\uDD01'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backToGamesButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[BirthdayColors.deepPink, BirthdayColors.roseGold]}
                style={styles.backToGamesGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.backToGamesText}>{'Back to Games \uD83C\uDFAE'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
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

        <View style={styles.header}>
          <Text style={styles.headerTitle}>{'Memory Match \uD83C\uDFB4'}</Text>
          <Text style={styles.headerSubtitle}>{'Find all the matching pairs!'}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatLabel}>{'Moves'}</Text>
            <Text style={styles.miniStatValue}>{moves}</Text>
          </View>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatLabel}>{'Matches'}</Text>
            <Text style={styles.miniStatValue}>{`${matches}/${totalPairs}`}</Text>
          </View>
        </View>

        <View style={styles.grid}>
          {cards.map((card, index) => (
            <MemoryCard
              key={card.id}
              card={card}
              onPress={() => handleCardPress(index)}
              disabled={isChecking}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={handleRestart} activeOpacity={0.7}>
          <Text style={styles.resetText}>{'Reset Game \uD83D\uDD04'}</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: GRID_PADDING,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  backText: {
    fontFamily: BirthdayFonts.bodyMedium,
    fontSize: 16,
    color: BirthdayColors.roseGold,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: BirthdayFonts.handwritten,
    fontSize: 30,
    color: BirthdayColors.textDark,
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: BirthdayFonts.body,
    fontSize: 14,
    color: BirthdayColors.textMedium,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 20,
  },
  miniStat: {
    alignItems: 'center',
  },
  miniStatLabel: {
    fontFamily: BirthdayFonts.body,
    fontSize: 12,
    color: BirthdayColors.textLight,
    marginBottom: 2,
  },
  miniStatValue: {
    fontFamily: BirthdayFonts.bodySemiBold,
    fontSize: 20,
    color: BirthdayColors.deepPink,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: CARD_GAP,
  },
  cardContainer: {
    width: CARD_SIZE,
    height: CARD_SIZE,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    backgroundColor: BirthdayColors.blushPink,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    ...BirthdayShadow,
  },
  cardBackEmoji: {
    fontSize: 28,
  },
  cardFront: {
    backgroundColor: BirthdayColors.white,
    ...BirthdayShadow,
  },
  cardMatched: {
    backgroundColor: BirthdayColors.mintGreen,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  cardFrontEmoji: {
    fontSize: 32,
  },
  resetButton: {
    alignSelf: 'center',
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  resetText: {
    fontFamily: BirthdayFonts.bodyMedium,
    fontSize: 15,
    color: BirthdayColors.roseGold,
  },
  // Celebration
  celebrationContent: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationCard: {
    backgroundColor: BirthdayColors.white,
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    ...BirthdayShadow,
    marginBottom: 28,
  },
  celebrationEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  celebrationTitle: {
    fontFamily: BirthdayFonts.handwritten,
    fontSize: 34,
    color: BirthdayColors.deepPink,
    textAlign: 'center',
    marginBottom: 8,
  },
  celebrationSubtitle: {
    fontFamily: BirthdayFonts.body,
    fontSize: 16,
    color: BirthdayColors.textMedium,
    textAlign: 'center',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statNumber: {
    fontFamily: BirthdayFonts.bodyBold,
    fontSize: 32,
    color: BirthdayColors.deepPink,
  },
  statLabel: {
    fontFamily: BirthdayFonts.body,
    fontSize: 14,
    color: BirthdayColors.textMedium,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: BirthdayColors.softRose,
  },
  celebrationMessage: {
    fontFamily: BirthdayFonts.bodySemiBold,
    fontSize: 16,
    color: BirthdayColors.textDark,
    textAlign: 'center',
    lineHeight: 24,
  },
  celebrationButtons: {
    width: '100%',
    gap: 14,
    alignItems: 'center',
  },
  restartButton: {
    backgroundColor: BirthdayColors.white,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
    ...BirthdayShadow,
    width: SCREEN_WIDTH - 80,
    alignItems: 'center',
  },
  restartButtonText: {
    fontFamily: BirthdayFonts.bodySemiBold,
    fontSize: 16,
    color: BirthdayColors.deepPink,
  },
  backToGamesButton: {
    borderRadius: 24,
    overflow: 'hidden',
    ...BirthdayShadow,
    width: SCREEN_WIDTH - 80,
  },
  backToGamesGradient: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: 'center',
  },
  backToGamesText: {
    fontFamily: BirthdayFonts.bodySemiBold,
    fontSize: 16,
    color: BirthdayColors.white,
  },
});
