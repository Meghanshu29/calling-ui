import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';
import { Toast } from '../../components/Toast';
import { sendWhatsAppMessage } from '../../endpoints/users';
import { useToast } from '../../hooks/useToast';

export default function WhatsAppScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [isInterested, setIsInterested] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { toast, showSuccess, showError, hideToast } = useToast();

  const handleSendMessage = async () => {
    if (!phoneNumber.trim()) {
      showError('Phone number is required');
      return;
    }
    if (!name.trim()) {
      showError('Name is required');
      return;
    }
    if (isInterested === null) {
      showError('Please select interest status');
      return;
    }

    setLoading(true);
    try {
      const messageData = {
        phone_number: phoneNumber.trim(),
        name: name.trim(),
        is_interested: isInterested,
      };

      await sendWhatsAppMessage(messageData);
      showSuccess('WhatsApp message sent successfully!');
      
      // Clear form
      setPhoneNumber('');
      setName('');
      setIsInterested(null);
    } catch (error: any) {
      showError(error.message || 'Failed to send WhatsApp message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={isDark ? ['#0f172a', '#1e293b', '#334155'] : ['#f0f9ff', '#e0f2fe', '#f8fafc']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <LinearGradient
            colors={['#10b981', '#059669']}
            style={styles.headerIcon}
          >
            <Ionicons name="logo-whatsapp" size={28} color="white" />
          </LinearGradient>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.title, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
              Send WhatsApp Message
            </Text>
            <Text style={[styles.subtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              Send custom messages to users
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={[styles.formCard, { backgroundColor: isDark ? '#1e293b' : '#ffffff' }]}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                Phone Number *
              </Text>
              <View style={[styles.inputContainer, { backgroundColor: isDark ? '#334155' : '#f8fafc', borderColor: isDark ? '#475569' : '#e2e8f0' }]}>
                <Ionicons name="call" size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                <TextInput
                  style={[styles.input, { color: isDark ? '#f8fafc' : '#0f172a' }]}
                  placeholder="Enter phone number with country code"
                  placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
              </View>
              <Text style={[styles.helperText, { color: isDark ? '#64748b' : '#94a3b8' }]}>
                Example: +919876543210
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                Name *
              </Text>
              <View style={[styles.inputContainer, { backgroundColor: isDark ? '#334155' : '#f8fafc', borderColor: isDark ? '#475569' : '#e2e8f0' }]}>
                <Ionicons name="person" size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                <TextInput
                  style={[styles.input, { color: isDark ? '#f8fafc' : '#0f172a' }]}
                  placeholder="Enter recipient name"
                  placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                Interest Status *
              </Text>
              <View style={styles.interestButtons}>
                <TouchableOpacity
                  style={[
                    styles.interestButton,
                    isInterested === 1 && styles.selectedInterest,
                    { backgroundColor: isInterested === 1 ? '#22c55e' : (isDark ? '#334155' : '#f8fafc') }
                  ]}
                  onPress={() => setIsInterested(1)}
                >
                  <Ionicons 
                    name="checkmark-circle" 
                    size={20} 
                    color={isInterested === 1 ? 'white' : '#22c55e'} 
                  />
                  <Text style={[
                    styles.interestText,
                    { color: isInterested === 1 ? 'white' : (isDark ? '#f8fafc' : '#0f172a') }
                  ]}>
                    Interested
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.interestButton,
                    isInterested === 0 && styles.selectedInterest,
                    { backgroundColor: isInterested === 0 ? '#ef4444' : (isDark ? '#334155' : '#f8fafc') }
                  ]}
                  onPress={() => setIsInterested(0)}
                >
                  <Ionicons 
                    name="close-circle" 
                    size={20} 
                    color={isInterested === 0 ? 'white' : '#ef4444'} 
                  />
                  <Text style={[
                    styles.interestText,
                    { color: isInterested === 0 ? 'white' : (isDark ? '#f8fafc' : '#0f172a') }
                  ]}>
                    Not Interested
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
              disabled={loading}
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.sendButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="send" size={20} color="white" />
                    <Text style={styles.sendButtonText}>Send WhatsApp Message</Text>
                  </>
                )}
              </LinearGradient>
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  formCard: {
    borderRadius: 16,
    padding: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
  interestButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  interestButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  selectedInterest: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  interestText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sendButton: {
    marginTop: 8,
  },
  sendButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});