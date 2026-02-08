import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BirthdayColors,
  BirthdayFonts,
  BirthdayShadow,
  ReflectionQuestions,
} from '@/constants/birthday-theme';

const STORAGE_KEY = 'divita_reflections';

export default function ReflectionsScreen() {
  const insets = useSafeAreaInsets();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const savedMessageOpacity = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const cardAnimations = useRef(
    ReflectionQuestions.map(() => new Animated.Value(0))
  ).current;

  const animateIn = useCallback(() => {
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    ReflectionQuestions.forEach((_, index) => {
      Animated.timing(cardAnimations[index], {
        toValue: 1,
        duration: 500,
        delay: 200 + index * 120,
        useNativeDriver: true,
      }).start();
    });
  }, [headerOpacity, cardAnimations]);

  const loadSavedResponses = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setResponses(JSON.parse(saved));
      }
    } catch {
      setLoadError('Could not load your saved reflections. You can still write new ones.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSavedResponses();
    animateIn();
  }, [loadSavedResponses, animateIn]);

  const handleResponseChange = (questionId: string, text: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: text,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
      showSavedMessage();
    } catch {
      setLoadError('Could not save your reflections. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const showSavedMessage = () => {
    setShowSaved(true);
    Animated.sequence([
      Animated.timing(savedMessageOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(savedMessageOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSaved(false);
    });
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={[BirthdayColors.blushPink, BirthdayColors.cream, BirthdayColors.warmCream]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={BirthdayColors.deepPink} />
        <Text style={styles.loadingText}>Loading your reflections...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[BirthdayColors.blushPink, BirthdayColors.cream, BirthdayColors.warmCream]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
            <Text style={styles.headerTitle}>A Moment of Reflection {'💭'}</Text>
            <Text style={styles.headerSubtitle}>
              Take a pause, Divita. Let your heart speak.
            </Text>
          </Animated.View>

          {/* Error Message */}
          {loadError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{loadError}</Text>
              <TouchableOpacity onPress={() => setLoadError(null)}>
                <Text style={styles.errorDismiss}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Reflection Cards */}
          {ReflectionQuestions.map((item, index) => (
            <Animated.View
              key={item.id}
              style={[
                styles.card,
                {
                  opacity: cardAnimations[index],
                  transform: [
                    {
                      translateY: cardAnimations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardEmoji}>{item.emoji}</Text>
                <Text style={styles.cardQuestion}>{item.question}</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Write your thoughts here..."
                placeholderTextColor={BirthdayColors.textLight}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={responses[item.id] || ''}
                onChangeText={(text) => handleResponseChange(item.id, text)}
              />
            </Animated.View>
          ))}

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={isSaving}
          >
            <LinearGradient
              colors={[BirthdayColors.deepPink, BirthdayColors.roseGold]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButtonGradient}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={BirthdayColors.white} />
              ) : (
                <Text style={styles.saveButtonText}>Save My Reflections {'💕'}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Saved Message Overlay */}
      {showSaved ? (
        <Animated.View
          style={[
            styles.savedOverlay,
            { opacity: savedMessageOpacity, bottom: insets.bottom + 30 },
          ]}
        >
          <View style={styles.savedMessage}>
            <Text style={styles.savedEmoji}>{'💖'}</Text>
            <Text style={styles.savedText}>Your reflections are saved, Divita!</Text>
            <Text style={styles.savedSubtext}>Beautiful thoughts, beautiful soul.</Text>
          </View>
        </Animated.View>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontFamily: BirthdayFonts.body,
    fontSize: 16,
    color: BirthdayColors.textMedium,
  },
  scrollContent: {
    paddingHorizontal: 20,
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
    marginBottom: 28,
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontFamily: BirthdayFonts.handwritten,
    fontSize: 34,
    color: BirthdayColors.deepPink,
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontFamily: BirthdayFonts.elegantItalic,
    fontSize: 16,
    color: BirthdayColors.textMedium,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: 'rgba(232, 130, 154, 0.15)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: BirthdayFonts.body,
    fontSize: 13,
    color: BirthdayColors.deepPink,
    flex: 1,
    marginRight: 10,
  },
  errorDismiss: {
    fontFamily: BirthdayFonts.bodySemiBold,
    fontSize: 13,
    color: BirthdayColors.deepPink,
    textDecorationLine: 'underline',
  },
  card: {
    backgroundColor: BirthdayColors.white,
    borderRadius: 20,
    padding: 22,
    marginBottom: 18,
    ...BirthdayShadow,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  cardEmoji: {
    fontSize: 28,
    marginRight: 12,
    marginTop: 2,
  },
  cardQuestion: {
    fontFamily: BirthdayFonts.elegant,
    fontSize: 17,
    color: BirthdayColors.textDark,
    flex: 1,
    lineHeight: 24,
  },
  textInput: {
    backgroundColor: BirthdayColors.cream,
    borderRadius: 14,
    padding: 16,
    fontFamily: BirthdayFonts.body,
    fontSize: 15,
    color: BirthdayColors.textDark,
    minHeight: 100,
    borderWidth: 1,
    borderColor: BirthdayColors.softRose,
    lineHeight: 22,
  },
  saveButton: {
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 28,
    overflow: 'hidden',
    ...BirthdayShadow,
  },
  saveButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
  },
  saveButtonText: {
    fontFamily: BirthdayFonts.bodySemiBold,
    fontSize: 18,
    color: BirthdayColors.white,
    letterSpacing: 0.5,
  },
  savedOverlay: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  savedMessage: {
    backgroundColor: BirthdayColors.white,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 28,
    alignItems: 'center',
    ...BirthdayShadow,
    shadowOpacity: 0.25,
  },
  savedEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  savedText: {
    fontFamily: BirthdayFonts.handwritten,
    fontSize: 22,
    color: BirthdayColors.deepPink,
    textAlign: 'center',
    marginBottom: 4,
  },
  savedSubtext: {
    fontFamily: BirthdayFonts.elegantItalic,
    fontSize: 14,
    color: BirthdayColors.textMedium,
    textAlign: 'center',
  },
});
