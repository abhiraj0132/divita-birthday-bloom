import React, { useEffect, useRef } from 'react';
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
import { BirthdayColors, BirthdayFonts, BirthdayShadow } from '@/constants/birthday-theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const HEART_EMOJIS = ['\u2764\uFE0F', '\uD83D\uDC96', '\uD83D\uDC95', '\uD83D\uDC97', '\uD83E\uDE77'];

interface FloatingHeartConfig {
  id: number;
  emoji: string;
  size: number;
  startX: number;
  duration: number;
  delay: number;
}

function generateHearts(count: number): FloatingHeartConfig[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    emoji: HEART_EMOJIS[i % HEART_EMOJIS.length],
    size: 14 + Math.random() * 14, // 14-28px
    startX: Math.random() * (SCREEN_WIDTH - 40),
    duration: 3000 + Math.random() * 5000, // 3-8 seconds
    delay: Math.random() * 4000,
  }));
}

const FLOATING_HEARTS = generateHearts(15);

interface FloatingHeartProps {
  config: FloatingHeartConfig;
}

function FloatingHeart({ config }: FloatingHeartProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT + 40)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      translateY.setValue(SCREEN_HEIGHT + 40);
      translateX.setValue(0);
      opacity.setValue(0);

      const drift = (Math.random() - 0.5) * 60;

      Animated.sequence([
        Animated.delay(config.delay),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -60,
            duration: config.duration,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.8,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.8,
              duration: config.duration - 1600,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(translateX, {
              toValue: drift,
              duration: config.duration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: -drift * 0.5,
              duration: config.duration / 2,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start(() => {
        animate();
      });
    };

    animate();
  }, [config.delay, config.duration, opacity, translateX, translateY]);

  return (
    <Animated.Text
      style={[
        styles.floatingHeart,
        {
          left: config.startX,
          fontSize: config.size,
          opacity,
          transform: [{ translateY }, { translateX }],
        },
      ]}
    >
      {config.emoji}
    </Animated.Text>
  );
}

function WarmGlow() {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        pulse();
      });
    };
    pulse();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.warmGlow,
        { opacity: pulseAnim },
      ]}
    />
  );
}

function PulsingHeart() {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => {
        pulse();
      });
    };
    pulse();
  }, [scaleAnim]);

  return (
    <Animated.Text
      style={[
        styles.pulsingHeart,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      {'\uD83D\uDC96'}
    </Animated.Text>
  );
}

export default function FinalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(40)).current;
  const headingOpacity = useRef(new Animated.Value(0)).current;
  const headingScale = useRef(new Animated.Value(0.8)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Fade in main heart emoji
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Heading appears
      Animated.parallel([
        Animated.timing(headingOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.spring(headingScale, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Message fades in
      Animated.timing(messageOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Footer
      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [contentOpacity, contentTranslateY, headingOpacity, headingScale, messageOpacity, footerOpacity]);

  return (
    <LinearGradient
      colors={[BirthdayColors.deepPink, BirthdayColors.lavender, BirthdayColors.peach]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <StatusBar barStyle="light-content" />

      {/* Floating Hearts */}
      {FLOATING_HEARTS.map((heart) => (
        <FloatingHeart key={heart.id} config={heart} />
      ))}

      {/* Warm Glow behind content */}
      <WarmGlow />

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 40,
            paddingBottom: insets.bottom + 20,
          },
        ]}
      >
        {/* Main Content */}
        <View style={styles.centerContent}>
          <Animated.View
            style={{
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslateY }],
              alignItems: 'center',
            }}
          >
            <Text style={styles.largeHeart}>{'\uD83D\uDC96'}</Text>
          </Animated.View>

          <Animated.Text
            style={[
              styles.heading,
              {
                opacity: headingOpacity,
                transform: [{ scale: headingScale }],
              },
            ]}
          >
            You Are So Loved, Divita
          </Animated.Text>

          <Animated.View style={{ opacity: messageOpacity }}>
            <Text style={styles.message}>
              This little birthday world was made with so much love, just for you.
            </Text>
            <Text style={styles.message}>
              You deserve every smile, every adventure, every dream come true.
            </Text>
            <Text style={styles.message}>
              Never forget how special you are {'\u2014'} today and every day.
            </Text>
            <Text style={styles.messageHighlight}>
              Happy Birthday, beautiful soul! {'\uD83C\uDF82\u2728\uD83D\uDC95'}
            </Text>

            {/* Personal Signature */}
            <View style={styles.signatureContainer}>
              <Text style={styles.signature}>From Abhiraj</Text>
            </View>
          </Animated.View>

          {/* Pulsing heart */}
          <View style={styles.pulsingHeartContainer}>
            <PulsingHeart />
          </View>
        </View>

        {/* Footer */}
        <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
          <Text style={styles.madeWith}>
            Made with {'\uD83D\uDC96'} for Divita
          </Text>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.push('/birthday/welcome')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.15)']}
              style={styles.homeButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.homeButtonText}>
                Back to Home {'\uD83C\uDFE0'}
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
    zIndex: 2,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeHeart: {
    fontSize: 70,
    marginBottom: 20,
  },
  heading: {
    fontFamily: BirthdayFonts.handwritten,
    fontSize: 38,
    color: BirthdayColors.white,
    textAlign: 'center',
    lineHeight: 50,
    marginBottom: 28,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  message: {
    fontFamily: BirthdayFonts.body,
    fontSize: 16,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  messageHighlight: {
    fontFamily: BirthdayFonts.bodySemiBold,
    fontSize: 18,
    color: BirthdayColors.white,
    textAlign: 'center',
    lineHeight: 28,
    marginTop: 8,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  signatureContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  signature: {
    fontFamily: BirthdayFonts.script,
    fontSize: 28,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  pulsingHeartContainer: {
    marginTop: 32,
  },
  pulsingHeart: {
    fontSize: 40,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  madeWith: {
    fontFamily: BirthdayFonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 16,
  },
  homeButton: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    ...BirthdayShadow,
    shadowColor: 'rgba(0,0,0,0.2)',
  },
  homeButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 28,
    alignItems: 'center',
  },
  homeButtonText: {
    fontFamily: BirthdayFonts.bodySemiBold,
    fontSize: 16,
    color: BirthdayColors.white,
    letterSpacing: 0.3,
  },
  // Floating hearts
  floatingHeart: {
    position: 'absolute',
    zIndex: 1,
  },
  // Warm glow
  warmGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(248, 200, 220, 0.3)',
    top: SCREEN_HEIGHT / 2 - 200,
    left: SCREEN_WIDTH / 2 - 150,
    zIndex: 0,
  },
});
