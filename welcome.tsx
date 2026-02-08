import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BirthdayColors, BirthdayFonts } from '@/constants/birthday-theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const HEART_EMOJIS = ['\u2764\uFE0F', '\uD83D\uDC96', '\uD83D\uDC95', '\uD83D\uDC97', '\uD83D\uDC93', '\uD83E\uDE77'];
const SPARKLE_POSITIONS = [
  { top: '12%', left: '8%' },
  { top: '18%', right: '12%' },
  { top: '35%', left: '5%' },
  { top: '42%', right: '8%' },
  { top: '55%', left: '10%' },
  { top: '62%', right: '6%' },
  { top: '75%', left: '15%' },
  { top: '80%', right: '14%' },
];

interface FloatingHeartProps {
  delay: number;
  startX: number;
  emoji: string;
}

function FloatingHeart({ delay, startX, emoji }: FloatingHeartProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT + 40)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animate = () => {
      translateY.setValue(SCREEN_HEIGHT + 40);
      translateX.setValue(0);
      opacity.setValue(0);
      scale.setValue(0.4 + Math.random() * 0.4);

      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -80,
            duration: 5000 + Math.random() * 3000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.7,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.7,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 1200,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(translateX, {
              toValue: 25,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: -25,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: 10,
              duration: 1500,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start(() => {
        animate();
      });
    };

    animate();
  }, [delay, opacity, scale, translateX, translateY]);

  return (
    <Animated.Text
      style={[
        styles.floatingHeart,
        {
          left: startX,
          transform: [{ translateY }, { translateX }, { scale }],
          opacity,
        },
      ]}
    >
      {emoji}
    </Animated.Text>
  );
}

interface SparkleProps {
  position: { top?: string; left?: string; right?: string; bottom?: string };
  delay: number;
}

function Sparkle({ position, delay }: SparkleProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.9,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.2,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(scale, {
              toValue: 1.2,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 0.5,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start(() => {
        animate();
      });
    };

    animate();
  }, [delay, opacity, scale]);

  const posStyle: Record<string, string | number> = {};
  if (position.top) posStyle.top = position.top;
  if (position.left) posStyle.left = position.left;
  if (position.right) posStyle.right = position.right;
  if (position.bottom) posStyle.bottom = position.bottom;

  return (
    <Animated.Text
      style={[
        styles.sparkle,
        posStyle,
        { opacity, transform: [{ scale }] },
      ]}
    >
      {'✨'}
    </Animated.Text>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [musicOn, setMusicOn] = useState(false);

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(buttonScale, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [buttonOpacity, buttonScale, subtitleOpacity, titleOpacity, titleTranslateY]);

  const heartData = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    delay: i * 800,
    startX: (SCREEN_WIDTH / 8) * i + Math.random() * 30,
    emoji: HEART_EMOJIS[i % HEART_EMOJIS.length],
  }));

  return (
    <LinearGradient
      colors={[BirthdayColors.blushPink, BirthdayColors.softLavender, BirthdayColors.lavender]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="dark-content" />

      {heartData.map((heart) => (
        <FloatingHeart
          key={heart.id}
          delay={heart.delay}
          startX={heart.startX}
          emoji={heart.emoji}
        />
      ))}

      {SPARKLE_POSITIONS.map((pos, idx) => (
        <Sparkle key={idx} position={pos} delay={idx * 400} />
      ))}

      <View style={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={[styles.musicButton, { top: insets.top + 10 }]}
          onPress={() => setMusicOn(!musicOn)}
          activeOpacity={0.7}
        >
          <Text style={styles.musicIcon}>{musicOn ? '\uD83D\uDD0A' : '\uD83D\uDD07'}</Text>
        </TouchableOpacity>

        <View style={styles.centerContent}>
          <Text style={styles.cakeEmoji}>{'\uD83C\uDF82'}</Text>

          <Animated.Text
            style={[
              styles.title,
              {
                opacity: titleOpacity,
                transform: [{ translateY: titleTranslateY }],
              },
            ]}
          >
            {'Happy Birthday, Divita \uD83C\uDF82\uD83D\uDC96'}
          </Animated.Text>

          <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
            {'7 February \u2014 a day made brighter because you were born \u2728'}
          </Animated.Text>

          <Animated.View style={[styles.decorRow, { opacity: subtitleOpacity }]}>
            <Text style={styles.decorEmoji}>{'\uD83C\uDF38'}</Text>
            <Text style={styles.decorEmoji}>{'\uD83D\uDC9D'}</Text>
            <Text style={styles.decorEmoji}>{'\uD83C\uDF38'}</Text>
          </Animated.View>
        </View>

        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: buttonOpacity,
              transform: [{ scale: buttonScale }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.enterButton}
            onPress={() => router.push('/birthday/home')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[BirthdayColors.deepPink, BirthdayColors.roseGold]}
              style={styles.enterButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.enterButtonText}>
                {'Enter Your Birthday World \uD83D\uDC9D'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  musicButton: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    backgroundColor: BirthdayColors.white,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: BirthdayColors.roseGold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  musicIcon: {
    fontSize: 22,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cakeEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontFamily: BirthdayFonts.handwritten,
    fontSize: 38,
    color: BirthdayColors.textDark,
    textAlign: 'center',
    lineHeight: 50,
    marginBottom: 20,
  },
  subtitle: {
    fontFamily: BirthdayFonts.body,
    fontSize: 16,
    color: BirthdayColors.textMedium,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  decorRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  decorEmoji: {
    fontSize: 24,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  enterButton: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: BirthdayColors.deepPink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  enterButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 28,
    alignItems: 'center',
  },
  enterButtonText: {
    fontFamily: BirthdayFonts.bodySemiBold,
    fontSize: 18,
    color: BirthdayColors.white,
    letterSpacing: 0.3,
  },
  floatingHeart: {
    position: 'absolute',
    fontSize: 24,
    zIndex: 1,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 18,
    zIndex: 1,
  },
});
