import { Stack } from "expo-router";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} initialRouteName="WelcomePage">
        <Stack.Screen name="(tabs)/index" />
        <Stack.Screen name="WelcomePage" />
        <Stack.Screen name="HomePage" />
        <Stack.Screen name="TaskDetails" />
        <Stack.Screen name="AddTask" />
      </Stack>
    </GestureHandlerRootView>
  );
}
