import { useColorScheme } from "@/hooks/use-color-scheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Updates from "expo-updates";
import { useEffect } from "react";
import "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthProvider } from "../contexts/AuthContext";
import "../styles/global";
export const unstable_settings = {
  anchor: "login",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });
  
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await AsyncStorage.multiRemove(['authToken', 'userInfo', 'savedUserId', 'savedPassword', 'rememberMe']);
          console.log('Update available - user logged out automatically');
          
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (error) {
        console.error("Error checking for updates:", error);
      }
    };

    checkForUpdates();
  }, []);
  
  if (!fontsLoaded) {
    return null;
  }
  
  return (
    <AuthProvider>
      <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <SafeAreaView style={{ flex: 1 }}>
          <LinearGradient
            colors={isDark ? ['#0f172a', '#1e293b'] : ['#f0f9ff', '#e0f2fe', '#bae6fd']}
            style={{ flex: 1 }}
          >
            <Stack>
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="modal"
                options={{ presentation: "modal", title: "Modal" }}
              />
            </Stack>
            <StatusBar style="auto" />
          </LinearGradient>
        </SafeAreaView>
      </ThemeProvider>
    </AuthProvider>
  );
}
