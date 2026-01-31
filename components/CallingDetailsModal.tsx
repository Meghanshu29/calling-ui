import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getCallingDetails } from '../endpoints/stats';
import { UserDetailsModal } from './UserDetailsModal';

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

interface CallingDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  agentName: string;
  timePeriod: string;
  status?: string;
  isDark: boolean;
}

export const CallingDetailsModal: React.FC<CallingDetailsModalProps> = ({
  visible,
  onClose,
  agentName,
  timePeriod,
  status,
  isDark,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    if (visible && agentName) {
      fetchDetails();
    }
  }, [visible, agentName, timePeriod, status]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      console.log('Fetching details for:', { agentName, timePeriod, status });
      const response = await getCallingDetails(agentName, timePeriod, status);
      console.log('API Response:', response);
      if (response && response.success && response.data) {
        let users = response.data.users || [];
        
        // Filter by status if provided
        if (status) {
          users = users.filter((user: User) => 
            user.status?.toLowerCase() === status.toLowerCase()
          );
          console.log(`Filtered to ${users.length} users with status: ${status}`);
        }
        
        setUsers(users);
      }
    } catch (error) {
      console.error('Error fetching calling details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserPress = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={[
        styles.userItem,
        { backgroundColor: isDark ? '#334155' : '#f8fafc', borderColor: isDark ? '#475569' : '#e2e8f0' }
      ]}
      onPress={() => handleUserPress(item)}
    >
      <View style={styles.userHeader}>
        <Text style={[styles.userName, { color: isDark ? '#f8fafc' : '#0f172a' }]}>{item.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={[styles.userPhone, { color: isDark ? '#94a3b8' : '#64748b' }]}>{item.mobile_no}</Text>
      {item.feedback && (
        <Text style={[styles.userFeedback, { color: isDark ? '#cbd5e1' : '#4b5563' }]} numberOfLines={1}>
          {item.feedback}
        </Text>
      )}
    </TouchableOpacity>
  );

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'interested': return '#22c55e';
      case 'not interested': return '#ef4444';
      case 'declined': return '#991b1b';
      case 'busy call later': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <LinearGradient
          colors={isDark ? ['#1e293b', '#334155'] : ['#ffffff', '#f1f5f9']}
          style={styles.container}
        >
          <View style={styles.header}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[styles.title, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
                {status ? `${status} - ${agentName}` : `${agentName}'s Calls`}
              </Text>
              <Text style={[styles.subtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                {timePeriod === 'current' ? "Today's activity" : 
                 timePeriod === 'yesterday' ? "Yesterday's activity" :
                 timePeriod === 'all' ? "All time activity" :
                 `Activity for ${timePeriod.replace(/_/g, ' ')}`}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={isDark ? '#f8fafc' : '#0f172a'} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color="#3b82f6" />
            </View>
          ) : users.length > 0 ? (
            <FlatList
              data={users}
              renderItem={renderUserItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            <View style={styles.centerContent}>
              <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }}>No users found</Text>
            </View>
          )}
        </LinearGradient>
      </View>

      <UserDetailsModal
        visible={showUserModal}
        onClose={() => setShowUserModal(false)}
        user={selectedUser}
        isDark={isDark}
        isSuperAdmin={true}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  userItem: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userPhone: {
    fontSize: 14,
    marginBottom: 4,
  },
  userFeedback: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
