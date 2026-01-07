import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme, ActivityIndicator, Modal, TextInput, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GetUnregisterdUsers, updateFeedback } from '../../endpoints/users';
import { UserCard } from '../../components/UserCard';
import { Toast } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import { Ionicons } from '@expo/vector-icons';

interface User {
  id: number;
  name: string;
  mobile_no: string | null;
  instruction: string;
  status: string;
  feedback: string;
  assigned_to: string;
  is_processed: boolean;
  created_at: string;
  updated_at: string;
}

export default function HomeScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [completedUsers, setCompletedUsers] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { toast, showSuccess, showError, hideToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await GetUnregisterdUsers({ limit: 100, offset: 0 });
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      showError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = () => {
    if (!selectedStatus) {
      showError('Please select a call status before proceeding');
      return;
    }
    setShowFeedbackModal(true);
  };

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) {
      showError('Please enter feedback before proceeding');
      return;
    }
    
    setSubmittingFeedback(true);
    try {
      const currentUser = users[currentIndex];
      await updateFeedback(currentUser.id, selectedStatus, feedback);
      
      setCompletedUsers(prev => new Set(prev).add(currentIndex));
      
      if (currentIndex < users.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedStatus('');
        setFeedback('');
        setShowFeedbackModal(false);
        showSuccess('Status saved successfully!');
      } else {
        setShowFeedbackModal(false);
        showSuccess('All users have been contacted successfully!');
      }
    } catch (error) {
      console.error('Error updating feedback:', error);
      showError('Failed to save feedback. Please try again.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedStatus('');
      setFeedback('');
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={isDark ? ['#0f172a', '#1e293b'] as const : ['#f0f9ff', '#e0f2fe'] as const}
        style={[styles.container, styles.centered]}
      >
        <ActivityIndicator size="large" color={isDark ? '#60a5fa' : '#3b82f6'} />
        <Text style={[styles.loadingText, { color: isDark ? '#94a3b8' : '#64748b' }]}>Loading contacts...</Text>
      </LinearGradient>
    );
  }

  if (users.length === 0) {
    return (
      <LinearGradient
        colors={isDark ? ['#0f172a', '#1e293b'] as const : ['#f0f9ff', '#e0f2fe'] as const}
        style={[styles.container, styles.centered]}
      >
        <Text style={[styles.emptyText, { color: isDark ? '#94a3b8' : '#64748b' }]}>📭 No contacts found</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={isDark ? ['#0f172a', '#1e293b', '#334155'] as const : ['#f0f9ff', '#e0f2fe', '#f8fafc'] as const}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Calling Dashboard</Text>
        <View style={[
          styles.progressContainer,
          { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)' }
        ]}>
          <Text style={[styles.progress, { color: isDark ? '#60a5fa' : '#3b82f6' }]}>
            {currentIndex + 1} of {users.length} contacts
          </Text>
        </View>
      </View>

      <UserCard
        user={users[currentIndex] || null}
        onSubmit={handleSubmitFeedback}
        onPrevious={handlePrevious}
        isDark={isDark}
        isLastUser={currentIndex === users.length - 1}
        isFirstUser={currentIndex === 0}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
      
      <Modal visible={showFeedbackModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={isDark ? ['#1e293b', '#334155'] : ['#ffffff', '#f8fafc']}
            style={styles.feedbackModal}
          >
            <Text style={[styles.modalTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
              📝 Add Feedback
            </Text>
            <TextInput
              style={[
                styles.feedbackInput,
                {
                  backgroundColor: isDark ? '#475569' : '#ffffff',
                  borderColor: isDark ? '#64748b' : '#e2e8f0',
                  color: isDark ? '#f8fafc' : '#0f172a'
                }
              ]}
              placeholder="Enter your feedback about the call..."
              placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
              value={feedback}
              onChangeText={setFeedback}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowFeedbackModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleFeedbackSubmit}
                disabled={submittingFeedback}
              >
                <LinearGradient
                  colors={['#3b82f6', '#1d4ed8']}
                  style={[styles.modalButton, styles.submitButton]}
                >
                  {submittingFeedback ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>Submit</Text>
                      <Ionicons name="checkmark" size={16} color="white" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: -1,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  progress: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  feedbackModal: {
    width: '100%',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  feedbackInput: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#6b7280',
  },
  submitButton: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
