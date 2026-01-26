import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import { GradientButton } from '../components/GradientButton';
import { Toast } from '../components/Toast';
import { requestOtp, signup } from '../endpoints/auth';
import { useToast } from '../hooks/useToast';

const lightTheme = {
  background: '#f8fafc',
  gradientColors: ['#e0f2fe', '#f0f9ff'] as const,
  cardBackground: '#ffffff',
  shadowColor: '#000000',
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  tabBackground: '#f1f5f9',
  activeTabBackground: '#ffffff',
  activeTabText: '#3b82f6',
  inactiveTabText: '#64748b',
  inputBackground: '#ffffff',
  inputBorder: '#e2e8f0',
  iconColor: '#64748b',
  placeholderColor: '#94a3b8',
  linkColor: '#3b82f6',
};

const darkTheme = {
  background: '#0f172a',
  gradientColors: ['#1e293b', '#334155'] as const,
  cardBackground: '#1e293b',
  shadowColor: '#000000',
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  tabBackground: '#334155',
  activeTabBackground: '#475569',
  activeTabText: '#60a5fa',
  inactiveTabText: '#94a3b8',
  inputBackground: '#334155',
  inputBorder: '#475569',
  iconColor: '#94a3b8',
  placeholderColor: '#64748b',
  linkColor: '#60a5fa',
};



export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { toast, showSuccess, showError, hideToast } = useToast();

  const handleSendOtp = async () => {
    if (!phoneNumber?.trim()) {
      showError('Please enter phone number');
      return;
    }
    const phone = parseInt(phoneNumber);
    if (!phone || phone <= 0) {
      showError('Valid phone number is required');
      return;
    }
    setLoading(true);
    try {
      await requestOtp(phone);
      setOtpSent(true);
      showSuccess('OTP sent to your phone');
    } catch (error: any) {
      showError(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!fullName?.trim()) {
      showError('Full name is required');
      return;
    }
    if (!username?.trim()) {
      showError('Username is required');
      return;
    }
    if (!email?.trim()) {
      showError('Email is required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError('Invalid email format');
      return;
    }
    if (!phoneNumber?.trim()) {
      showError('Phone number is required');
      return;
    }
    const phone = parseInt(phoneNumber);
    if (!phone || phone <= 0) {
      showError('Valid phone number is required');
      return;
    }
    if (!password?.trim()) {
      showError('Password is required');
      return;
    }
    if (password.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }
    if (!confirmPassword?.trim()) {
      showError('Please confirm your password');
      return;
    }
    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }
    if (!otp?.trim()) {
      showError('OTP is required');
      return;
    }
    if (!agreeTerms) {
      showError('Please agree to the terms and conditions');
      return;
    }
    setLoading(true);
    try {
      const response = await signup({
        username: username.trim(),
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        phone,
        otp: otp.trim()
      });
      
      // Store auth token
      if (response.token) {
        await AsyncStorage.setItem('authToken', response.token);
      }
      
      showSuccess('Account created successfully!');
      setTimeout(() => router.replace('/(tabs)'), 1000);
    } catch (error: any) {
      showError(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <LinearGradient
        colors={theme.gradientColors}
        style={styles.backgroundGradient}
      />

      <ScrollView 
        style={[styles.card, { backgroundColor: theme.cardBackground, shadowColor: theme.shadowColor }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Join us today
          </Text>
        </View>

        <View style={styles.form}>
          <View>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Full Name</Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
              <Ionicons name="person-outline" size={20} color={theme.iconColor} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder="Enter your full name"
                placeholderTextColor={theme.placeholderColor}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Username</Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
              <Ionicons name="at-outline" size={20} color={theme.iconColor} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder="Enter username"
                placeholderTextColor={theme.placeholderColor}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
              <Ionicons name="mail-outline" size={20} color={theme.iconColor} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder="Enter your email"
                placeholderTextColor={theme.placeholderColor}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Phone Number</Text>
            <View style={styles.phoneRow}>
              <View style={{ flex: 1 }}>
                <View style={[styles.inputContainer, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
                  <Ionicons name="call-outline" size={20} color={theme.iconColor} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.textPrimary }]}
                    placeholder="Enter phone number"
                    placeholderTextColor={theme.placeholderColor}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <TouchableOpacity
                style={[styles.otpButton, { backgroundColor: theme.linkColor }]}
                onPress={handleSendOtp}
                disabled={otpSent || loading}
              >
                <Text style={styles.otpButtonText}>
                  {otpSent ? 'Sent' : 'Send OTP'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {otpSent && (
            <View>
              <Text style={[styles.label, { color: theme.textSecondary }]}>OTP</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
                <Ionicons name="key-outline" size={20} color={theme.iconColor} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder="Enter OTP"
                  placeholderTextColor={theme.placeholderColor}
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>
            </View>
          )}

          <View>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Password</Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.iconColor} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder="Create a password"
                placeholderTextColor={theme.placeholderColor}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color={theme.iconColor} 
                />
              </TouchableOpacity>
            </View>
          </View>

          <View>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Confirm Password</Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.iconColor} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder="Confirm your password"
                placeholderTextColor={theme.placeholderColor}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons 
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color={theme.iconColor} 
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.termsRow}>
            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={() => setAgreeTerms(!agreeTerms)}
            >
              <View style={[styles.checkbox, agreeTerms && styles.checkboxActive]}>
                {agreeTerms && <Ionicons name="checkmark" size={12} color="white" />}
              </View>
              <Text style={[styles.checkboxText, { color: theme.textSecondary }]}>
                I agree to the{' '}
                <Text style={[styles.linkText, { color: theme.linkColor }]}>Terms & Conditions</Text>
                {' '}and{' '}
                <Text style={[styles.linkText, { color: theme.linkColor }]}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <GradientButton onPress={handleSignup} loading={loading}>
            Create Account
          </GradientButton>

          <View style={styles.loginRow}>
            <Text style={[styles.loginText, { color: theme.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={[styles.linkText, { color: theme.linkColor }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
      </KeyboardAvoidingView>
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
  backgroundGradient: {
    height: 80,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  card: {
    flex: 1,
    marginTop: -40,
    marginHorizontal: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 32,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: 12,
    position: 'relative',
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  countryDropdown: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 80,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 200,
    zIndex: 1000,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  countryOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  countryOptionText: {
    fontSize: 14,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
  },
  phoneInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
  },
  termsRow: {
    marginTop: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  checkboxText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 12,
  },
  buttonContainerDark: {
    shadowColor: '#4f46e5',
  },
  gradientButton: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 60,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    paddingBottom: 20,
  },
  loginText: {
    fontSize: 14,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  otpButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  otpButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});