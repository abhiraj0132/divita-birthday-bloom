import { Stack } from 'expo-router';

export default function BirthdayLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: '#FFF0F5' },
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="home" />
      <Stack.Screen name="games" />
      <Stack.Screen name="quiz" />
      <Stack.Screen name="thisorthat" />
      <Stack.Screen name="memory" />
      <Stack.Screen name="reflections" />
      <Stack.Screen name="quotes" />
      <Stack.Screen name="scrapbook" />
      <Stack.Screen name="gifts" />
      <Stack.Screen name="final" />
    </Stack>
  );
}
