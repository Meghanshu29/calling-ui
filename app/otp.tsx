import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";
import { GradientButton } from "../components/GradientButton";
import { Toast } from "../components/Toast";
import { loginWithOtp } from "../endpoints/auth";
import { useToast } from "../hooks/useToast";

export default function OTPScreen() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);
  const router = useRouter();
  const { phone } = useLocalSearchParams();
  const { toast, showSuccess, showError, hideToast } = useToast();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const isComplete = otp.every((digit) => digit !== "");

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Handle paste
      const pastedCode = value.slice(0, 6);
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pastedCode[i] || "";
      }
      setOtp(newOtp);
      const nextIndex = Math.min(pastedCode.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      showError("Please enter complete OTP");
      return;
    }
    if (!phone) {
      showError("Phone number is required");
      return;
    }
    const phoneNum = parseInt(phone as string);
    if (!phoneNum || phoneNum <= 0) {
      showError("Valid phone number is required");
      return;
    }
    setLoading(true);
    try {
      const response = await loginWithOtp(phoneNum, otpCode.trim());

      // Print entire response to see token structure
      console.log(
        "Full OTP Login Response:",
        JSON.stringify(response, null, 2)
      );

      // Store auth token
      if (response.access_token?.accessToken) {
        await AsyncStorage.setItem(
          "authToken",
          response.access_token.accessToken
        );
        console.log("Token stored:", response.access_token.accessToken);

        // Store user information
        const userInfo = {
          username: response.username,
          email: response.email,
          admin_id: response.admin_id,
          role: response.role
        };
        await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
        console.log('User info stored:', userInfo);

        // Verify token was stored
        const storedToken = await AsyncStorage.getItem("authToken");
        console.log("Verified stored token:", storedToken);
      }

      showSuccess("Login successful!");
      setTimeout(() => router.replace("/(tabs)"), 1000);
    } catch (error: any) {
      showError(error.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = () => {
    setTimer(30);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
    showSuccess("OTP sent again!");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#0f172a" : "#ffffff" },
      ]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={isDark ? "#0f172a" : "#ffffff"}
        />

        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.backButton,
              { backgroundColor: isDark ? "#1e293b" : "#f9fafb" },
            ]}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? "#f8fafc" : "#1f2937"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text
              style={[styles.title, { color: isDark ? "#f8fafc" : "#111827" }]}
            >
              Verify OTP
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: isDark ? "#94a3b8" : "#6b7280" },
              ]}
            >
              Enter the 6-digit code sent to your phone number
            </Text>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  if (ref) inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  {
                    borderColor: digit
                      ? "#3b82f6"
                      : isDark
                      ? "#475569"
                      : "#e5e7eb",
                    backgroundColor: digit
                      ? isDark
                        ? "#1e3a8a"
                        : "#eff6ff"
                      : isDark
                      ? "#1e293b"
                      : "#ffffff",
                    color: isDark ? "#f8fafc" : "#111827",
                  },
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent }) =>
                  handleKeyPress(nativeEvent.key, index)
                }
                keyboardType="numeric"
                maxLength={6}
                textAlign="center"
                selectTextOnFocus
              />
            ))}
          </View>

          <View style={styles.timerContainer}>
            {timer > 0 ? (
              <Text
                style={[
                  styles.timerText,
                  { color: isDark ? "#94a3b8" : "#6b7280" },
                ]}
              >
                Resend OTP in {formatTime(timer)}
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResendOtp}>
                <Text
                  style={[
                    styles.resendText,
                    { color: isDark ? "#60a5fa" : "#3b82f6" },
                  ]}
                >
                  Resend OTP
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <GradientButton
            onPress={handleVerifyOtp}
            disabled={!isComplete}
            loading={loading}
          >
            Verify & Continue
          </GradientButton>
        </View>
      </KeyboardAvoidingView>
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "400",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 32,
    gap: 12,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 24,
    fontWeight: "600",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  timerText: {
    fontSize: 14,
    fontWeight: "500",
  },
  resendText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
