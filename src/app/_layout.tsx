import React from "react";
import { Stack } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { DMSans_400Regular } from "@expo-google-fonts/dm-sans/400Regular";
import { DMSans_500Medium } from "@expo-google-fonts/dm-sans/500Medium";
import { DMSans_700Bold } from "@expo-google-fonts/dm-sans/700Bold";
import { Outfit_600SemiBold } from "@expo-google-fonts/outfit/600SemiBold";
import { LibraryProvider, useLibrary } from "../services/store";
import { useTheme } from "../components/theme";
import { Txt } from "../components/ui";
function Shell() {
  const { ready, error } = useLibrary();
  const t = useTheme();
  if (!ready)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: t.background,
        }}
      >
        {error ? <Txt>{error}</Txt> : <ActivityIndicator color={t.primary} />}
      </View>
    );
  return (
    <>
      <StatusBar style={t.dark ? "light" : "dark"} />
      {error ? (
        <View style={{ backgroundColor: t.soft, padding: 12 }}>
          <Txt>{error}</Txt>
        </View>
      ) : null}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: t.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="video/[id]" />
        <Stack.Screen name="playlist/[id]" />
      </Stack>
    </>
  );
}
export default function RootLayout() {
  const [loaded, error] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    Outfit_600SemiBold,
  });
  if (!loaded && !error) return null;
  return (
    <LibraryProvider>
      <Shell />
    </LibraryProvider>
  );
}
