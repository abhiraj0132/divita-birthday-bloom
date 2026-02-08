import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BirthdayColors, BirthdayFonts, BirthdayShadow } from '@/constants/birthday-theme';
import CountdownTimer from '@/components/CountdownTimer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 14;
const CARD_PADDING = 20;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_PADDING * 2 - CARD_GAP) / 2;

interface SectionCard {
  title: string;
  icon: string;
  description: string;
  route: string;
  color: string;
}

const SECTIONS: SectionCard[] = [
  {
    title: 'Games',
    icon: '\uD83C\uDFAE',
    description: 'Fun birthday games to play!',
    route: '/birthday/games',
    color: BirthdayColors.blushPink,
  },
  {
    title: 'Reflections',
    icon: '\uD83D\uDCAD',
    description: 'Reflect on your beautiful year',
    route: '/birthday/reflections',
    color: BirthdayColors.softLavender,
  },
  {
    title: 'Quotes',
    icon: '\uD83D\uDCAB',
    description: 'Words that sparkle like you',
    route: '/birthday/quotes',
    color: BirthdayColors.peach,
  },
  {
    title: 'Scrapbook',
    icon: '\uD83D\uDCF8',
    description: 'Memories captured in love',
    route: '/birthday/scrapbook',
    color: BirthdayColors.babyBlue,
  },
  {
    title: 'Gifts',
    icon: '\uD83C\uDF81',
    description: 'Special surprises for you',
    route: '/birthday/gifts',
    color: BirthdayColors.mintGreen,
  },
  {
    title: 'Gifts & Letter',
    icon: '\uD83D\uDC8C',
    description: 'Gifts & a heartfelt letter',
    route: '/birthday/gifts',
    color: BirthdayColors.softRose,
  },
  {
    title: 'Final Message',
    icon: '\uD83D\uDC96',
    description: 'One last birthday wish',
    route: '/birthday/final',
    color: BirthdayColors.softGold,
  },
];

interface AnimatedCardProps {
  item: SectionCard;
  index: number;
  onPress: () => void;
}

function AnimatedCard({ item, index, onPress }: AnimatedCardProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      <TouchableOpacity
        style={[styles.card, { backgroundColor: item.color }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.cardIconContainer}>
          <Text style={styles.cardIcon}>{item.icon}</Text>
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleCardPress = (route: string) => {
    router.push(route as never);
  };

  return (
    <LinearGradient
      colors={[BirthdayColors.gradientStart, BirthdayColors.gradientMiddle, BirthdayColors.gradientEnd]}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>{'\u2728'}</Text>
          <Text style={styles.headerTitle}>{"Divita's Birthday World \u2728"}</Text>
          <Text style={styles.headerSubtitle}>{'Choose your adventure'}</Text>
        </View>

        <CountdownTimer />

        <View style={styles.grid}>
          {SECTIONS.map((section, index) => (
            <AnimatedCard
              key={section.title + index}
              item={section}
              index={index}
              onPress={() => handleCardPress(section.route)}
            />
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: CARD_PADDING,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  headerEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  headerTitle: {
    fontFamily: BirthdayFonts.handwritten,
    fontSize: 34,
    color: BirthdayColors.textDark,
    textAlign: 'center',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontFamily: BirthdayFonts.body,
    fontSize: 15,
    color: BirthdayColors.textMedium,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: CARD_GAP,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    minHeight: 160,
    justifyContent: 'center',
    alignItems: 'center',
    ...BirthdayShadow,
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 28,
  },
  cardTitle: {
    fontFamily: BirthdayFonts.bodySemiBold,
    fontSize: 16,
    color: BirthdayColors.textDark,
    textAlign: 'center',
    marginBottom: 4,
  },
  cardDescription: {
    fontFamily: BirthdayFonts.body,
    fontSize: 12,
    color: BirthdayColors.textMedium,
    textAlign: 'center',
    lineHeight: 17,
  },
});
