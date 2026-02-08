import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
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
  QuizQuestions,
} from '@/constants/birthday-theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const OPTION_COLORS = [
  BirthdayColors.blushPink,
  BirthdayColors.softLavender,
  BirthdayColors.peach,
  BirthdayColors.babyBlue,
];

export default function QuizScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const feedbackOpacity = useRef(new Animated.Value(0)).current;
  const feedbackScale = useRef(new Animated.Value(0.5)).current;
  const questionOpacity = useRef(new Animated.Value(1)).current;
  const celebrationScale = useRef(new Animated.Value(0)).current;

  const totalQuestions = QuizQuestions.length;
  const progress = (currentQuestion + 1) / totalQuestions;

  const handleOptionPress = useCallback(
    (optionIndex: number) => {
      if (showFeedback) return;

      setSelectedOption(optionIndex);
      setShowFeedback(true);

      feedbackOpacity.setValue(0);
      feedbackScale.setValue(0.5);

      Animated.parallel([
        Animated.timing(feedbackOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(feedbackScale, {
          toValue: 1,
          friction: 5,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        const newAnswers = [...answers, optionIndex];
        setAnswers(newAnswers);

        if (currentQuestion < totalQuestions - 1) {
          Animated.timing(questionOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setCurrentQuestion((prev) => prev + 1);
            setSelectedOption(null);
            setShowFeedback(false);

            questionOpacity.setValue(0);
            Animated.timing(questionOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }).start();
          });
        } else {
          setIsFinished(true);
          celebrationScale.setValue(0);
          Animated.spring(celebrationScale, {
            toValue: 1,
            friction: 4,
            tension: 40,
            useNativeDriver: true,
          }).start();
        }
      }, 1800);

      return () => clearTimeout(timer);
    },
    [
      showFeedback,
      answers,
      currentQuestion,
      totalQuestions,
      feedbackOpacity,
      feedbackScale,
      questionOpacity,
      celebrationScale,
    ]
  );

  const question = QuizQuestions[currentQuestion];

  if (isFinished) {
    return (
      <LinearGradient
        colors={[BirthdayColors.blushPink, BirthdayColors.softLavender, BirthdayColors.lavender]}
        style={styles.container}
      >
        <StatusBar barStyle="dark-content" />
        <ScrollView
          contentContainerStyle={[
            styles.resultsContent,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 30 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.resultsCard, { transform: [{ scale: celebrationScale }] }]}>
            <Text style={styles.resultsEmoji}>{'\uD83C\uDF89'}</Text>
            <Text style={styles.resultsTitle}>{'Quiz Complete!'}</Text>
            <Text style={styles.resultsSubtitle}>
              {"Here's what your choices say about you, Divita:"}
            </Text>

            {answers.map((answerIdx, qIdx) => {
              const q = QuizQuestions[qIdx];
              if (!q) return null;
              return (
                <View key={qIdx} style={styles.resultItem}>
                  <Text style={styles.resultQuestion}>{q.question}</Text>
                  <Text style={styles.resultAnswer}>{q.options[answerIdx]}</Text>
                  <Text style={styles.resultFeedback}>{q.feedback[answerIdx]}</Text>
                </View>
              );
            })}

            <Text style={styles.resultsSummary}>
              {'You are wonderfully unique, and every answer shows just how special you are! \uD83D\uDC96\u2728'}
            </Text>
          </Animated.View>

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
        </ScrollView>
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
            <Animated.View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {`${currentQuestion + 1} / ${totalQuestions}`}
          </Text>
        </View>

        <Animated.View style={[styles.questionContainer, { opacity: questionOpacity }]}>
          <Text style={styles.questionEmoji}>{'\uD83E\uDDE0'}</Text>
          <Text style={styles.questionTitle}>{'How Well Do You Know Yourself?'}</Text>
          <Text style={styles.questionText}>{question.question}</Text>

          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => {
              const isSelected = selectedOption === index;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    { backgroundColor: OPTION_COLORS[index % OPTION_COLORS.length] },
                    isSelected && styles.optionSelected,
                  ]}
                  onPress={() => handleOptionPress(index)}
                  activeOpacity={0.8}
                  disabled={showFeedback}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {showFeedback && selectedOption !== null && (
            <Animated.View
              style={[
                styles.feedbackContainer,
                {
                  opacity: feedbackOpacity,
                  transform: [{ scale: feedbackScale }],
                },
              ]}
            >
              <Text style={styles.feedbackText}>
                {question.feedback[selectedOption]}
              </Text>
            </Animated.View>
          )}
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
    marginBottom: 24,
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
  questionContainer: {
    flex: 1,
    alignItems: 'center',
  },
  questionEmoji: {
    fontSize: 44,
    marginBottom: 12,
  },
  questionTitle: {
    fontFamily: BirthdayFonts.handwritten,
    fontSize: 26,
    color: BirthdayColors.textDark,
    textAlign: 'center',
    marginBottom: 20,
  },
  questionText: {
    fontFamily: BirthdayFonts.bodySemiBold,
    fontSize: 18,
    color: BirthdayColors.textDark,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 26,
    paddingHorizontal: 10,
  },
  optionsContainer: {
    width: '100%',
    gap: 12,
  },
  optionButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    ...BirthdayShadow,
  },
  optionSelected: {
    borderWidth: 3,
    borderColor: BirthdayColors.deepPink,
  },
  optionText: {
    fontFamily: BirthdayFonts.bodyMedium,
    fontSize: 15,
    color: BirthdayColors.textDark,
    textAlign: 'center',
  },
  optionTextSelected: {
    fontFamily: BirthdayFonts.bodySemiBold,
    color: BirthdayColors.textDark,
  },
  feedbackContainer: {
    marginTop: 24,
    backgroundColor: BirthdayColors.white,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    ...BirthdayShadow,
  },
  feedbackText: {
    fontFamily: BirthdayFonts.bodySemiBold,
    fontSize: 17,
    color: BirthdayColors.deepPink,
    textAlign: 'center',
  },
  // Results styles
  resultsContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  resultsCard: {
    backgroundColor: BirthdayColors.white,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    ...BirthdayShadow,
    marginBottom: 20,
  },
  resultsEmoji: {
    fontSize: 56,
    textAlign: 'center',
    marginBottom: 12,
  },
  resultsTitle: {
    fontFamily: BirthdayFonts.handwritten,
    fontSize: 32,
    color: BirthdayColors.deepPink,
    textAlign: 'center',
    marginBottom: 8,
  },
  resultsSubtitle: {
    fontFamily: BirthdayFonts.body,
    fontSize: 15,
    color: BirthdayColors.textMedium,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  resultItem: {
    backgroundColor: BirthdayColors.cream,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  resultQuestion: {
    fontFamily: BirthdayFonts.bodySemiBold,
    fontSize: 14,
    color: BirthdayColors.textDark,
    marginBottom: 6,
  },
  resultAnswer: {
    fontFamily: BirthdayFonts.bodyMedium,
    fontSize: 13,
    color: BirthdayColors.roseGold,
    marginBottom: 4,
  },
  resultFeedback: {
    fontFamily: BirthdayFonts.body,
    fontSize: 14,
    color: BirthdayColors.deepPink,
  },
  resultsSummary: {
    fontFamily: BirthdayFonts.bodySemiBold,
    fontSize: 16,
    color: BirthdayColors.textDark,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
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
