import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
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

const lightTheme = {
  background: '#f8fafc',
  gradientColors: ['#e0f2fe', '#f0f9ff'] as const,
  cardBackground: '#ffffff',
  shadowColor: '#000000',
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  inputBackground: '#ffffff',
  inputBorder: '#e2e8f0',
  linkColor: '#3b82f6',
};

const darkTheme = {
  background: '#0f172a',
  gradientColors: ['#1e293b', '#334155'] as const,
  cardBackground: '#1e293b',
  shadowColor: '#000000',
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  inputBackground: '#334155',
  inputBorder: '#475569',
  linkColor: '#60a5fa',
};

const callStatuses = [
  { value: 'answered', label: 'Answered' },
  { value: 'no_answer', label: 'No Answer' },
  { value: 'busy', label: 'Busy' },
  { value: 'voicemail', label: 'Voicemail' },
  { value: 'callback', label: 'Callback Requested' },
  { value: 'not_interested', label: 'Not Interested' },
  { value: 'interested', label: 'Interested' },
];

export default function CallLogScreen() {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [callStatus, setCallStatus] = useState('');
  const [callDuration, setCallDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const theme = isDark ? darkTheme : lightTheme;

  const handleSubmit = () => {
    if (!customerName || !customerPhone || !callStatus) {
      Alert.alert('Error', 'Please fill in required fields (Name, Phone, Status)');
      return;
    }
    
    Alert.alert('Success', 'Call log saved successfully!', [
      { text: 'Add Another', onPress: () => resetForm() },
      { text: 'Dashboard', onPress: () => router.replace('/(tabs)') }
    ]);
  };

  const resetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setCallStatus('');
    setCallDuration('');
    setNotes('');
    setFollowUpDate('');
  };

  const selectStatus = (status: string) => {
    setCallStatus(status);
    setShowStatusDropdown(false);
  };

  const getStatusLabel = (value: string) => {
    return callStatuses.find(status => status.value === value)?.label || 'Select Status';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
          <View style={styles.header}>
            <TouchableOpacity 
              style={[styles.backButton, { backgroundColor: theme.inputBackground }]}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Call Log Entry</Text>
          </View>

          <View style={styles.form}>
            <View>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Customer Name *</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
                <Ionicons name="person-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder="Enter customer name"
                  placeholderTextColor={theme.textSecondary}
                  value={customerName}
                  onChangeText={setCustomerName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Phone Number *</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
                <Ionicons name="call-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder="Enter phone number"
                  placeholderTextColor={theme.textSecondary}
                  value={customerPhone}
                  onChangeText={setCustomerPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Email (Optional)</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
                <Ionicons name="mail-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder="Enter email address"
                  placeholderTextColor={theme.textSecondary}
                  value={customerEmail}
                  onChangeText={setCustomerEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Call Status *</Text>
              <TouchableOpacity
                style={[styles.inputContainer, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}
                onPress={() => setShowStatusDropdown(!showStatusDropdown)}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                <Text style={[styles.input, { color: callStatus ? theme.textPrimary : theme.textSecondary }]}>
                  {getStatusLabel(callStatus)}
                </Text>
                <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
              
              {showStatusDropdown && (
                <View style={[styles.dropdown, { backgroundColor: theme.cardBackground, borderColor: theme.inputBorder }]}>
                  <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                    {callStatuses.map((status) => (
                      <TouchableOpacity
                        key={status.value}
                        style={[styles.dropdownOption, { borderBottomColor: theme.inputBorder }]}
                        onPress={() => selectStatus(status.value)}
                      >
                        <Text style={[styles.dropdownOptionText, { color: theme.textPrimary }]}>
                          {status.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Call Duration (minutes)</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
                <Ionicons name="time-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder="e.g., 5"
                  placeholderTextColor={theme.textSecondary}
                  value={callDuration}
                  onChangeText={setCallDuration}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Follow-up Date (Optional)</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
                <Ionicons name="calendar-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor={theme.textSecondary}
                  value={followUpDate}
                  onChangeText={setFollowUpDate}
                />
              </View>
            </View>

            <View>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Notes</Text>
              <View style={[styles.textAreaContainer, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
                <TextInput
                  style={[styles.textArea, { color: theme.textPrimary }]}
                  placeholder="Add call notes, customer feedback, or important details..."
                  placeholderTextColor={theme.textSecondary}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <GradientButton onPress={handleSubmit}>
              Save Call Log
            </GradientButton>
          </View>
        </ScrollView>
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
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  card: {
    flex: 1,
    marginTop: -20,
    marginHorizontal: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 32,
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
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
  textAreaContainer: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  textArea: {
    fontSize: 16,
    minHeight: 80,
  },
  dropdown: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 200,
    zIndex: 1000,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dropdownOptionText: {
    fontSize: 16,
  },
});