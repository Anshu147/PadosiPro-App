import { useEffect } from "react";
import { Platform } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { NavigationBar } from "expo-navigation-bar";

import { AuthProvider, useAuth } from "@/context/AuthContext";

function AppNavigator() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const currentRoute = segments[0];

    const publicRoutes = ["register", "login", "verify-email"];

    const isPublicRoute =
      !currentRoute || publicRoutes.includes(currentRoute);

    if (!user) {
      if (!isPublicRoute) {
        router.replace("/register");
      }

      return;
    }

    if (!user.profileCompleted && currentRoute !== "profile") {
      router.replace("/profile");
      return;
    }

    if (
      user.profileCompleted &&
      (currentRoute === "register" ||
        currentRoute === "login" ||
        currentRoute === "verify-email")
    ) {
      router.replace("/home");
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      {Platform.OS === "android" && <NavigationBar hidden={false} style="light" />}
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}