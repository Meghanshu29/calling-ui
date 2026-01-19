import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { updateFeedback } from '../endpoints/users';
import { GradientButton } from './GradientButton';

interface User {
  id: number;
  name: string;
  mobile_no: string;
  instruction: string | null;
  status: string;
  feedback: string | null;
  assigned_to: string;
  tag: string;
  priority: string;
  is_processed: boolean;
  created_at: string;
  updated_at: string;
}

interface UserDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  user: User | null;
  isDark: boolean;
  onUserUpdate?: () => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ visible, onClose, user, isDark, onUserUpdate }) => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [feedback, setFeedback] = useState('');
  const [updating, setUpdating] = useState(false);
  
  if (!user) return null;

  const statusOptions = [
    "Interested",
    "Not Interested",
    "Escalate to Sonia",
    "Declined",
    "Busy Call Later",
    "Married/Engaged",
    "Complete Soon",
    "Need Help completing",
    "Not Serious",
  ];

  const handlePhonePress = (phone: string) => {
    Linking.openURL(`tel:${phone.trim()}`);
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus || !feedback.trim()) {
      alert('Please select status and enter feedback');
      return;
    }
    
    setUpdating(true);
    try {
      await updateFeedback(user.id, selectedStatus, feedback);
      alert('Status updated successfully!');
      setSelectedStatus('');
      setFeedback('');
      onUserUpdate?.();
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <LinearGradient
          colors={isDark ? ['#1e293b', '#334155'] : ['#ffffff', '#f8fafc']}
          style={styles.modal}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
              User Details
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={isDark ? '#f8fafc' : '#0f172a'} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.avatarSection}>
              <LinearGradient
                colors={['#3b82f6', '#8b5cf6']}
                style={styles.avatarLarge}
              >
                <Text style={styles.avatarLargeText}>{user.name.charAt(0).toUpperCase()}</Text>
              </LinearGradient>
              <Text style={[styles.nameText, { color: isDark ? '#f8fafc' : '#0f172a' }]}>{user.name}</Text>
            </View>

            <View style={styles.detailsSection}>
              <View style={[styles.detailRow, { borderBottomColor: isDark ? '#475569' : '#e5e7eb' }]}>
                <Ionicons name="id-card" size={20} color={isDark ? '#60a5fa' : '#3b82f6'} />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: isDark ? '#94a3b8' : '#6b7280' }]}>ID</Text>
                  <Text style={[styles.detailValue, { color: isDark ? '#f8fafc' : '#0f172a' }]}>{user.id}</Text>
                </View>
              </View>

              <View style={[styles.detailRow, { borderBottomColor: isDark ? '#475569' : '#e5e7eb' }]}>
                <Ionicons name="call" size={20} color={isDark ? '#60a5fa' : '#3b82f6'} />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: isDark ? '#94a3b8' : '#6b7280' }]}>Phone</Text>
                  <View>
                    {user.mobile_no.split(',').map((phone, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handlePhonePress(phone)}
                        style={styles.phoneButton}
                      >
                        <Text style={[styles.detailValue, styles.phoneText, { color: '#3b82f6' }]}>
                          {phone.trim()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={[styles.detailRow, { borderBottomColor: isDark ? '#475569' : '#e5e7eb' }]}>
                <Ionicons name="flag" size={20} color={isDark ? '#60a5fa' : '#3b82f6'} />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: isDark ? '#94a3b8' : '#6b7280' }]}>Status</Text>
                  <Text style={[styles.detailValue, { color: isDark ? '#f8fafc' : '#0f172a' }]}>{user.status}</Text>
                </View>
              </View>

              <View style={[styles.detailRow, { borderBottomColor: isDark ? '#475569' : '#e5e7eb' }]}>
                <Ionicons name="pricetag" size={20} color={isDark ? '#60a5fa' : '#3b82f6'} />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: isDark ? '#94a3b8' : '#6b7280' }]}>Tag</Text>
                  <Text style={[styles.detailValue, { color: isDark ? '#f8fafc' : '#0f172a' }]}>{user.tag}</Text>
                </View>
              </View>

              <View style={[styles.detailRow, { borderBottomColor: isDark ? '#475569' : '#e5e7eb' }]}>
                <Ionicons name="person" size={20} color={isDark ? '#60a5fa' : '#3b82f6'} />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: isDark ? '#94a3b8' : '#6b7280' }]}>Assigned To</Text>
                  <Text style={[styles.detailValue, { color: isDark ? '#f8fafc' : '#0f172a' }]}>{user.assigned_to}</Text>
                </View>
              </View>

              <View style={[styles.detailRow, { borderBottomColor: isDark ? '#475569' : '#e5e7eb' }]}>
                <Ionicons name="alert-circle" size={20} color={isDark ? '#60a5fa' : '#3b82f6'} />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: isDark ? '#94a3b8' : '#6b7280' }]}>Priority</Text>
                  <Text style={[styles.detailValue, { color: isDark ? '#f8fafc' : '#0f172a' }]}>{user.priority}</Text>
                </View>
              </View>

              <View style={[styles.detailRow, { borderBottomColor: isDark ? '#475569' : '#e5e7eb' }]}>
                <Ionicons name="chatbubble" size={20} color={isDark ? '#60a5fa' : '#3b82f6'} />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: isDark ? '#94a3b8' : '#6b7280' }]}>Feedback</Text>
                  <Text style={[styles.detailValue, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
                    {user.feedback || 'No feedback'}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="calendar" size={20} color={isDark ? '#60a5fa' : '#3b82f6'} />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: isDark ? '#94a3b8' : '#6b7280' }]}>Created</Text>
                  <Text style={[styles.detailValue, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.updateSection, { backgroundColor: isDark ? '#475569' : '#f0f9ff' }]}>
              <Text style={[styles.updateTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Update Status</Text>
              
              <View style={styles.statusDropdown}>
                <Text style={[styles.inputLabel, { color: isDark ? '#94a3b8' : '#6b7280' }]}>Status</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusScroll}>
                  {statusOptions.map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusChip,
                        {
                          backgroundColor: selectedStatus === status ? '#3b82f6' : (isDark ? '#334155' : '#e2e8f0'),
                        }
                      ]}
                      onPress={() => setSelectedStatus(status)}
                    >
                      <Text style={[
                        styles.statusChipText,
                        { color: selectedStatus === status ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b') }
                      ]}>
                        {status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.feedbackSection}>
                <Text style={[styles.inputLabel, { color: isDark ? '#94a3b8' : '#6b7280' }]}>Feedback</Text>
                <TextInput
                  style={[
                    styles.feedbackInput,
                    {
                      backgroundColor: isDark ? '#334155' : '#ffffff',
                      borderColor: isDark ? '#64748b' : '#e2e8f0',
                      color: isDark ? '#f8fafc' : '#0f172a',
                    }
                  ]}
                  placeholder="Enter feedback..."
                  placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                  value={feedback}
                  onChangeText={setFeedback}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <GradientButton onPress={handleUpdateStatus} loading={updating}>
                Update Status
              </GradientButton>
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    height: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarLargeText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
  },
  nameText: {
    fontSize: 24,
    fontWeight: '700',
  },
  detailsSection: {
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  detailContent: {
    flex: 1,
    marginLeft: 16,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  phoneButton: {
    marginBottom: 4,
  },
  phoneText: {
    textDecorationLine: 'underline',
  },
  updateSection: {
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
  },
  updateTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  statusDropdown: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusScroll: {
    flexDirection: 'row',
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  statusChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  feedbackSection: {
    marginBottom: 20,
  },
  feedbackInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
  },
});