import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Platform } from "react-native";
const readonly = "https://www.googleapis.com/auth/drive.readonly";
export async function connectGoogle(write = false) {
  if (Platform.OS === "ios" && !process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID)
    throw new Error(
      "BailaCue’s iOS Google sign-in registration must be configured in the build. You can still import from the Files app.",
    );
  GoogleSignin.configure({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    scopes: [write ? "https://www.googleapis.com/auth/drive" : readonly],
  });
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const result = await GoogleSignin.signIn();
  if (result.type !== "success") throw new Error("Connection cancelled.");
  return {
    accountId: result.data.user.id,
    email: result.data.user.email,
    name: result.data.user.name ?? result.data.user.email,
    writable: write,
  };
}
export async function googleToken(accountId: string) {
  GoogleSignin.configure({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    scopes: [readonly],
  });
  const result = await GoogleSignin.signInSilently();
  if (result.type !== "success" || result.data.user.id !== accountId)
    throw new Error(
      "Reconnect this Google account in Storage. Your notes and ratings are kept.",
    );
  return (await GoogleSignin.getTokens()).accessToken;
}
export async function disconnectGoogle(id: string) {
  const current = GoogleSignin.getCurrentUser();
  if (current && `google-${current.user.id}` === id)
    await GoogleSignin.signOut();
}
