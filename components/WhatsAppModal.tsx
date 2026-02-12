import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { sendWhatsAppMessage } from '../endpoints/users';

interface WhatsAppModalProps {
  visible: boolean;
  onClose: () => void;
  user: any;
  isDark: boolean;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  visible,
  onClose,
  user,
  isDark,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedInterest, setSelectedInterest] = useState<number | null>(null);

  if (!user) return null;

  const phoneNumbers = user.mobile_no
    ? String(user.mobile_no).split(',').map(phone => phone.trim()).filter(phone => phone)
    : [];

  const handleSendMessage = async (phoneNumber: string) => {
    if (selectedInterest === null) {
      Alert.alert('Error', 'Please select interest status first');
      return;
    }

    setLoading(true);
    try {
      const messageData = {
        phone_number: phoneNumber,
        name: user.name || 'Unknown User',
        is_interested: selectedInterest,
        feedback: user.feedback || '',
      };

      await sendWhatsAppMessage(messageData);
      Alert.alert('Success', 'WhatsApp message sent successfully!');
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send WhatsApp message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: isDark ? '#1e293b' : '#ffffff' }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
              Send WhatsApp Message
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={isDark ? '#94a3b8' : '#64748b'} />
            </TouchableOpacity>
          </View>

          <View style={styles.userInfo}>
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.whatsappIcon}
            >
              <Ionicons name="logo-whatsapp" size={24} color="white" />
            </LinearGradient>
            <Text style={[styles.userName, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
              {user.name}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              Select Interest Status
            </Text>
            <View style={styles.interestButtons}>
              <TouchableOpacity
                style={[
                  styles.interestButton,
                  selectedInterest === 1 && styles.selectedInterest,
                  { backgroundColor: selectedInterest === 1 ? '#22c55e' : (isDark ? '#334155' : '#f8fafc') }
                ]}
                onPress={() => setSelectedInterest(1)}
              >
                <Ionicons
                  name="heart"
                  size={20}
                  color={selectedInterest === 1 ? 'white' : '#22c55e'}
                />
                <Text style={[
                  styles.interestText,
                  { color: selectedInterest === 1 ? 'white' : (isDark ? '#f8fafc' : '#0f172a') }
                ]}>
                  Interested
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.interestButton,
                  selectedInterest === 0 && styles.selectedInterest,
                  { backgroundColor: selectedInterest === 0 ? '#ef4444' : (isDark ? '#334155' : '#f8fafc') }
                ]}
                onPress={() => setSelectedInterest(0)}
              >
                <Ionicons
                  name="heart-dislike"
                  size={20}
                  color={selectedInterest === 0 ? 'white' : '#ef4444'}
                />
                <Text style={[
                  styles.interestText,
                  { color: selectedInterest === 0 ? 'white' : (isDark ? '#f8fafc' : '#0f172a') }
                ]}>
                  Not Interested
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              Select Phone Number ({phoneNumbers.length})
            </Text>
            {phoneNumbers.length === 0 ? (
              <Text style={[styles.noPhone, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                No phone numbers available
              </Text>
            ) : (
              phoneNumbers.map((phone, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.phoneButton,
                    { backgroundColor: isDark ? '#334155' : '#f8fafc' }
                  ]}
                  onPress={() => handleSendMessage(phone)}
                  disabled={loading || selectedInterest === null}
                >
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    style={styles.phoneIcon}
                  >
                    <Ionicons name="logo-whatsapp" size={16} color="white" />
                  </LinearGradient>
                  <Text style={[styles.phoneText, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
                    {phone}
                  </Text>
                  {loading ? (
                    <ActivityIndicator size="small" color="#10b981" />
                  ) : (
                    <Ionicons name="send" size={16} color="#10b981" />
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  whatsappIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
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
    paddingVertical: 12,
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
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  phoneIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  noPhone: {
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 20,
  },
});