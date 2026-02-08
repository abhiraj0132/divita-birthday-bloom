import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BirthdayColors, BirthdayFonts, BirthdayShadow } from '@/constants/birthday-theme';

interface GameCard {
  title: string;
  icon: string;
  description: string;
  route: string;
  gradientColors: [string, string];
}

const GAMES: GameCard[] = [
  {
    title: 'Personality Quiz',
    icon: '\uD83E\uDDE0',
    description: 'How well do you know yourself? Take this fun quiz!',
    route: '/birthday/quiz',
    gradientColors: [BirthdayColors.blushPink, BirthdayColors.softRose],
  },
  {
    title: 'This or That',
    icon: '\uD83E\uDD14',
    description: 'Make quick choices and discover your preferences!',
    route: '/birthday/thisorthat',
    gradientColors: [BirthdayColors.softLavender, BirthdayColors.lavender],
  },
  {
    title: 'Memory Match',
    icon: '\uD83C\uDFB4',
    description: 'Match the birthday icons and test your memory!',
    route: '/birthday/memory',
    gradientColors: [BirthdayColors.peach, BirthdayColors.softGold],
  },
];

interface AnimatedGameCardProps {
  game: GameCard;
  index: number;
  onPress: () => void;
}

function AnimatedGameCard({ game, index, onPress }: AnimatedGameCardProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        delay: index * 200,
        useNativeDriver: true,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        friction: 7,
        tension: 40,
        delay: index * 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacity, translateX]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateX }] }}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <LinearGradient
          colors={game.gradientColors}
          style={styles.gameCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.gameIconContainer}>
            <Text style={styles.gameIcon}>{game.icon}</Text>
          </View>
          <View style={styles.gameTextContainer}>
            <Text style={styles.gameTitle}>{game.title}</Text>
            <Text style={styles.gameDescription}>{game.description}</Text>
          </View>
          <Text style={styles.arrowIcon}>{'\u203A'}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function GamesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
          <Text style={styles.headerIcon}>{'\uD83C\uDFAE'}</Text>
          <Text style={styles.headerTitle}>{'Birthday Games'}</Text>
          <Text style={styles.headerSubtitle}>{'Pick a game and have fun!'}</Text>
        </View>

        <View style={styles.gamesList}>
          {GAMES.map((game, index) => (
            <AnimatedGameCard
              key={game.title}
              game={game}
              index={index}
              onPress={() => router.push(game.route as never)}
            />
          ))}
        </View>
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  headerTitle: {
    fontFamily: BirthdayFonts.handwritten,
    fontSize: 32,
    color: BirthdayColors.textDark,
    textAlign: 'center',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontFamily: BirthdayFonts.body,
    fontSize: 15,
    color: BirthdayColors.textMedium,
  },
  gamesList: {
    gap: 18,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 20,
    ...BirthdayShadow,
  },
  gameIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  gameIcon: {
    fontSize: 30,
  },
  gameTextContainer: {
    flex: 1,
  },
  gameTitle: {
    fontFamily: BirthdayFonts.bodySemiBold,
    fontSize: 18,
    color: BirthdayColors.textDark,
    marginBottom: 4,
  },
  gameDescription: {
    fontFamily: BirthdayFonts.body,
    fontSize: 13,
    color: BirthdayColors.textMedium,
    lineHeight: 19,
  },
  arrowIcon: {
    fontSize: 28,
    color: BirthdayColors.textLight,
    marginLeft: 8,
  },
});
