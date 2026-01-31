import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, Linking, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getAssignmentStats } from '../endpoints/stats';
import { updateFeedback, updateUserInstructionAndAssignment } from '../endpoints/users';
import { useToast } from '../hooks/useToast';
import { GradientButton } from './GradientButton';
import { Toast } from './Toast';

interface User {
  id: number;
  name: string;
  mobile_no: string | number | null;
  instruction: string | null;
  status: string;
  feedback: string | null;
  assigned_to: string;
  tag: string | null;
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
  isSuperAdmin?: boolean;
  currentUser?: string | null;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ 
  visible, 
  onClose, 
  user, 
  isDark, 
  onUserUpdate, 
  isSuperAdmin = false,
  currentUser = null
}) => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [feedback, setFeedback] = useState('');
  const [updating, setUpdating] = useState(false);
  const [editableInstruction, setEditableInstruction] = useState('');
  const [updatingInstruction, setUpdatingInstruction] = useState(false);
  const [editableAssignedTo, setEditableAssignedTo] = useState('');
  const [updatingAssignment, setUpdatingAssignment] = useState(false);
  const [agents, setAgents] = useState<string[]>([]);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [agentSearch, setAgentSearch] = useState('');
  const instructionInputRef = useRef<TextInput>(null);
  const { toast, showSuccess, showError, hideToast } = useToast();
  
  useEffect(() => {
    if (user) {
      setEditableInstruction(user.instruction || '');
      setEditableAssignedTo(user.assigned_to || '');
    }
    fetchAgents();
  }, [user]);

  const fetchAgents = async () => {
    try {
      const response = await getAssignmentStats();
      if (response && Array.isArray(response.data)) {
        const agentNames = response.data.map(stat => stat.assigned_to).filter(Boolean);
        const uniqueAgents = [...new Set(agentNames)].sort((a, b) => a.localeCompare(b));
        setAgents(uniqueAgents);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };
  
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
      showError('Please select status and enter feedback');
      return;
    }
    
    setUpdating(true);
    try {
      // 1. Update feedback and status
      await updateFeedback(user.id, selectedStatus, feedback, undefined, currentUser || undefined);
      
      // 2. Update assignment and instruction using the specific endpoint requested
      // We pass the current instruction (either the one already there or the edited one)
      // and the current logged in user as the assigned_to
      if (currentUser) {
        await updateUserInstructionAndAssignment(
          user.id,
          editableInstruction || user.instruction || '',
          currentUser
        );
      }

      showSuccess('Status updated successfully!');
      setSelectedStatus('');
      setFeedback('');
      onUserUpdate?.();
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      console.error('Error updating status:', error);
      showError('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateInstruction = async () => {
    if (!editableInstruction.trim()) {
      showError('Please enter an instruction');
      return;
    }
    
    setUpdatingInstruction(true);
    try {
      await updateUserInstructionAndAssignment(
        user.id,
        editableInstruction,
        user.assigned_to
      );
      showSuccess('Instruction updated successfully!');
      onUserUpdate?.();
    } catch (error) {
      console.error('Error updating instruction:', error);
      showError('Failed to update instruction');
    } finally {
      setUpdatingInstruction(false);
    }
  };

  const handleUpdateAssignment = async () => {
    if (!editableAssignedTo.trim()) {
      showError('Please select an agent');
      return;
    }
    
    setUpdatingAssignment(true);
    try {
      await updateUserInstructionAndAssignment(
        user.id,
        editableInstruction || user.instruction || '',
        editableAssignedTo
      );
      showSuccess('Assignment updated successfully!');
      // Blur the instruction input and dismiss keyboard
      instructionInputRef.current?.blur();
      Keyboard.dismiss();
      onUserUpdate?.();
    } catch (error) {
      console.error('Error updating assignment:', error);
      showError('Failed to update assignment');
    } finally {
      setUpdatingAssignment(false);
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
                    {user.mobile_no ? (
                      String(user.mobile_no).split(',').map((phone: string, index: number) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handlePhonePress(phone)}
                          style={styles.phoneButton}
                        >
                          <Text style={[styles.detailValue, styles.phoneText, { color: '#3b82f6' }]}>
                            {phone.trim()}
                          </Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <Text style={[styles.detailValue, { color: isDark ? '#94a3b8' : '#6b7280' }]}>No phone number</Text>
                    )}
                  </View>
                </View>
              </View>

              {/* Call Instructions - Editable */}
              <View style={[styles.detailRow, { borderBottomColor: isDark ? '#475569' : '#e5e7eb', flexDirection: 'column', alignItems: 'flex-start' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Ionicons name="clipboard-outline" size={20} color={isDark ? '#60a5fa' : '#3b82f6'} />
                  <Text style={[styles.detailLabel, { color: isDark ? '#94a3b8' : '#6b7280', marginLeft: 16 }]}>Call Instructions</Text>
                </View>
                <TextInput
                  style={[
                    styles.instructionInput,
                    {
                      backgroundColor: isDark ? '#334155' : '#ffffff',
                      borderColor: isDark ? '#64748b' : '#e2e8f0',
                      color: isDark ? '#f8fafc' : '#0f172a',
                    }
                  ]}
                  placeholder="Enter call instructions..."
                  placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                  value={editableInstruction}
                  onChangeText={setEditableInstruction}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
                <GradientButton
                  onPress={handleUpdateInstruction}
                  loading={updatingInstruction}
                >
                  Update Instruction
                </GradientButton>
              </View>


              {!isSuperAdmin && (
                <View style={[styles.detailRow, { borderBottomColor: isDark ? '#475569' : '#e5e7eb' }]}>
                  <Ionicons name="flag" size={20} color={isDark ? '#60a5fa' : '#3b82f6'} />
                  <View style={styles.detailContent}>
                    <Text style={[styles.detailLabel, { color: isDark ? '#94a3b8' : '#6b7280' }]}>Status</Text>
                    <Text style={[styles.detailValue, { color: isDark ? '#f8fafc' : '#0f172a' }]}>{user.status}</Text>
                  </View>
                </View>
              )}

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

              {!isSuperAdmin && (
                <View style={[styles.detailRow, { borderBottomColor: isDark ? '#475569' : '#e5e7eb' }]}>
                  <Ionicons name="chatbubble" size={20} color={isDark ? '#60a5fa' : '#3b82f6'} />
                  <View style={styles.detailContent}>
                    <Text style={[styles.detailLabel, { color: isDark ? '#94a3b8' : '#6b7280' }]}>Feedback</Text>
                    <Text style={[styles.detailValue, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
                      {user.feedback || 'No feedback'}
                    </Text>
                  </View>
                </View>
              )}

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

            {!isSuperAdmin && (
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
            )}

            {/* Update Assign To Section */}
            <View style={[styles.updateSection, { backgroundColor: isDark ? '#475569' : '#f0fdf4', marginTop: 20 }]}>
              <Text style={[styles.updateTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Update Assignment</Text>
              
              <View style={styles.feedbackSection}>
                <Text style={[styles.inputLabel, { color: isDark ? '#94a3b8' : '#6b7280' }]}>Assigned To</Text>
                <TouchableOpacity
                  style={[
                    styles.pickerButton,
                    {
                      backgroundColor: isDark ? '#334155' : '#ffffff',
                      borderColor: isDark ? '#64748b' : '#e2e8f0',
                    }
                  ]}
                  onPress={() => setShowAgentModal(true)}
                >
                  <Text style={[styles.pickerButtonText, { color: editableAssignedTo ? (isDark ? '#f8fafc' : '#0f172a') : (isDark ? '#94a3b8' : '#64748b') }]}>
                    {editableAssignedTo || 'Select agent...'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                </TouchableOpacity>
              </View>

              <View style={styles.feedbackSection}>
                <Text style={[styles.inputLabel, { color: isDark ? '#94a3b8' : '#6b7280' }]}>Instruction</Text>
                <TextInput
                  ref={instructionInputRef}
                  style={[
                    styles.feedbackInput,
                    {
                      backgroundColor: isDark ? '#334155' : '#ffffff',
                      borderColor: isDark ? '#64748b' : '#e2e8f0',
                      color: isDark ? '#f8fafc' : '#0f172a',
                    }
                  ]}
                  placeholder="Enter instruction..."
                  placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                  value={editableInstruction}
                  onChangeText={setEditableInstruction}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <GradientButton 
                onPress={handleUpdateAssignment} 
                loading={updatingAssignment}
              >
                Update Assignment
              </GradientButton>
            </View>

            {/* Agent Picker Modal */}
            <Modal visible={showAgentModal} transparent animationType="fade">
              <TouchableOpacity 
                style={styles.pickerOverlay}
                activeOpacity={1}
                onPress={() => setShowAgentModal(false)}
              >
                <View 
                  style={[styles.pickerContainer, { backgroundColor: isDark ? '#1e293b' : '#ffffff' }]}
                  onStartShouldSetResponder={() => true}
                >
                  <View style={styles.pickerHeader}>
                    <Text style={[styles.pickerTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Select Agent</Text>
                    <TouchableOpacity onPress={() => setShowAgentModal(false)}>
                      <Ionicons name="close" size={24} color={isDark ? '#94a3b8' : '#64748b'} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={[styles.searchBar, { backgroundColor: isDark ? '#334155' : '#f8fafc' }]}>
                    <Ionicons name="search" size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                    <TextInput
                      style={[styles.searchInput, { color: isDark ? '#f8fafc' : '#0f172a' }]}
                      placeholder="Search agents..."
                      placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                      value={agentSearch}
                      onChangeText={setAgentSearch}
                    />
                  </View>

                  <ScrollView style={styles.agentList}>
                    {agents
                      .filter(agent => agent.toLowerCase().includes(agentSearch.toLowerCase()))
                      .map((agent) => (
                        <TouchableOpacity
                          key={agent}
                          style={[
                            styles.agentItem,
                            { borderBottomColor: isDark ? '#334155' : '#f1f5f9' }
                          ]}
                          onPress={() => {
                            setEditableAssignedTo(agent);
                            setShowAgentModal(false);
                            setAgentSearch('');
                          }}
                        >
                          <Text style={[styles.agentItemText, { color: isDark ? '#f8fafc' : '#0f172a' }]}>{agent}</Text>
                          {editableAssignedTo === agent && (
                            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                          )}
                        </TouchableOpacity>
                      ))}
                    {agents.filter(agent => agent.toLowerCase().includes(agentSearch.toLowerCase())).length === 0 && (
                      <View style={{ padding: 20, alignItems: 'center' }}>
                        <Ionicons name="people-outline" size={32} color={isDark ? '#475569' : '#cbd5e1'} />
                        <Text style={[styles.noAgentsText, { color: isDark ? '#94a3b8' : '#64748b', marginTop: 8 }]}>
                          No agents found
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              </TouchableOpacity>
            </Modal>
          </ScrollView>
        </LinearGradient>
      </View>

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
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
  instructionInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    width: '100%',
    marginBottom: 12,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 50,
  },
  pickerButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerContainer: {
    width: '100%',
    maxHeight: '70%',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 15,
    height: 45,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  agentList: {
    maxHeight: 400,
  },
  agentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  agentItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  noAgentsText: {
    textAlign: 'center',
    fontSize: 14,
  },
});