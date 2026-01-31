import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';
import { AssignmentStats, getAssignmentStats, getCallingDetails } from '../endpoints/stats';
import { UserDetailsModal } from './UserDetailsModal';

interface StatsCardProps {
  isDark: boolean;
}

const TIME_PERIODS = [
  { key: 'all', label: 'All Time' },
  { key: 'current', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'last_7_days', label: 'Last 7 Days' },
  { key: 'last_15_days', label: 'Last 15 Days' },
  { key: 'last_30_days', label: 'Last 30 Days' },
  { key: 'last_3_months', label: 'Last 3 Months' },
];

export const StatsCard: React.FC<StatsCardProps> = ({ isDark }) => {
  const [stats, setStats] = useState<AssignmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [statusRecords, setStatusRecords] = useState<any[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    loadUserStats();
  }, [selectedPeriod]);

  const loadUserStats = async () => {
    setLoading(true);
    try {
      // Get current user
      const userInfo = await AsyncStorage.getItem('userInfo');
      let username = '';
      if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
        username = parsedUser.username || parsedUser.email || '';
      }
      setCurrentUser(username);
      
      console.log('📊 Fetching stats for period:', selectedPeriod, 'Username:', username);

      // Fetch stats
      const response = await getAssignmentStats(selectedPeriod);
      
      if (response && response.success && Array.isArray(response.data)) {
        // Use case-insensitive matching and trim whitespace
        const userStats = response.data.find(stat => 
          stat.assigned_to?.toLowerCase().trim() === username.toLowerCase().trim()
        );
        
        console.log('✅ Found stats for user:', userStats ? 'Yes' : 'No');
        setStats(userStats || null);
      } else {
        setStats(null);
      }
    } catch (error) {
      console.error('❌ Error loading stats:', error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'interested': return '#22c55e';
      case 'not_interested': return '#ef4444';
      case 'escalate_to_sonia': return '#8b5cf6';
      case 'declined': return '#dc2626';
      case 'busy_call_later': return '#f59e0b';
      case 'married_engaged': return '#ec4899';
      case 'complete_soon': return '#10b981';
      case 'need_help_completing': return '#3b82f6';
      case 'not_serious': return '#f97316';
      case 'pending': return '#6366f1';
      case 'no_status': return '#94a3b8';
      default: return '#64748b';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'interested': return 'heart';
      case 'not_interested': return 'heart-dislike';
      case 'escalate_to_sonia': return 'arrow-up-circle';
      case 'declined': return 'close-circle';
      case 'busy_call_later': return 'time';
      case 'married_engaged': return 'people';
      case 'complete_soon': return 'checkmark-circle';
      case 'need_help_completing': return 'help-circle';
      case 'not_serious': return 'warning';
      case 'pending': return 'hourglass';
      case 'no_status': return 'remove-circle';
      default: return 'ellipse';
    }
  };

  const formatStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusKey = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      'interested': 'Interested',
      'not_interested': 'Not Interested',
      'escalate_to_sonia': 'Escalate to Sonia',
      'declined': 'Declined',
      'busy_call_later': 'Busy Call Later',
      'married_engaged': 'Married/Engaged',
      'complete_soon': 'Complete Soon',
      'need_help_completing': 'Need Help completing',
      'not_serious': 'Not Serious',
      'pending': 'pending',
    };
    return statusMap[status] || status;
  };

  const handleStatusClick = async (statusKey: string) => {
    setSelectedStatus(statusKey);
    setShowDetailsModal(true);
    setLoadingRecords(true);
    
    try {
      const statusValue = getStatusKey(statusKey);
      console.log('🔍 Fetching records for status:', statusKey, '→', statusValue);
      
      const response = await getCallingDetails(currentUser, selectedPeriod, statusValue);
      if (response && response.success && response.data) {
        const allUsers = response.data.users || [];
        console.log('📦 Total users received:', allUsers.length);
        
        // Filter users by status (case-insensitive comparison)
        const filteredUsers = allUsers.filter((user: any) => {
          const userStatus = (user.status || '').toLowerCase().trim();
          const targetStatus = statusValue.toLowerCase().trim();
          const matches = userStatus === targetStatus;
          
          if (!matches) {
            console.log(`❌ Filtering out: ${user.name} (status: "${user.status}" !== "${statusValue}")`);
          }
          
          return matches;
        });
        
        console.log('✅ Filtered users:', filteredUsers.length, 'matching status:', statusValue);
        setStatusRecords(filteredUsers);
      }
    } catch (error) {
      console.error('Error fetching calling details:', error);
      setStatusRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleUserClick = (user: any) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={[styles.loadingText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
            Loading stats...
          </Text>
        </View>
      );
    }

    if (!stats) {
      return (
        <View style={styles.centerContent}>
          <Ionicons name="stats-chart" size={48} color={isDark ? '#475569' : '#cbd5e1'} />
          <Text style={[styles.emptyText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
            No statistics found for {currentUser} in this period.
          </Text>
        </View>
      );
    }

    const completionRate = stats.total > 0 
      ? (((stats.total - stats.pending) / stats.total) * 100).toFixed(1)
      : '0';

    const conversionRate = stats.total > 0
      ? ((stats.interested / stats.total) * 100).toFixed(1)
      : '0';

    const statusItems = [
      { key: 'interested', value: stats.interested },
      { key: 'not_interested', value: stats.not_interested },
      { key: 'escalate_to_sonia', value: stats.escalate_to_sonia },
      { key: 'declined', value: stats.declined },
      { key: 'busy_call_later', value: stats.busy_call_later },
      { key: 'married_engaged', value: stats.married_engaged },
      { key: 'complete_soon', value: stats.complete_soon },
      { key: 'need_help_completing', value: stats.need_help_completing },
      { key: 'not_serious', value: stats.not_serious },
      { key: 'pending', value: stats.pending },
      { key: 'no_status', value: stats.no_status || 0 },
    ].filter(item => item.value > 0);

    return (
      <View style={styles.statsWrapper}>
        {/* Summary Cards */}
        <View style={styles.summaryCardsContainer}>
          <LinearGradient
            colors={isDark ? ['#1e3a8a', '#3b82f6'] : ['#dbeafe', '#bfdbfe']}
            style={styles.summaryCard}
          >
            <View style={[styles.summaryIconWrapper, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <Ionicons name="call" size={16} color="white" />
            </View>
            <Text style={[styles.summaryCardLabel, { color: isDark ? '#e0e7ff' : '#1e3a8a' }]} numberOfLines={1} adjustsFontSizeToFit>Total Calls</Text>
            <Text style={[styles.summaryCardValue, { color: isDark ? '#ffffff' : '#1e40af' }]}>{stats.total}</Text>
          </LinearGradient>

          <LinearGradient
            colors={isDark ? ['#1e40af', '#3b82f6'] : ['#dbeafe', '#93c5fd']}
            style={styles.summaryCard}
          >
            <View style={[styles.summaryIconWrapper, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <Ionicons name="checkmark-circle" size={16} color="white" />
            </View>
            <Text style={[styles.summaryCardLabel, { color: isDark ? '#e0e7ff' : '#1e3a8a' }]} numberOfLines={1} adjustsFontSizeToFit>Completion</Text>
            <Text style={[styles.summaryCardValue, { color: isDark ? '#ffffff' : '#1e40af' }]}>{completionRate}%</Text>
          </LinearGradient>

          <LinearGradient
            colors={isDark ? ['#065f46', '#10b981'] : ['#d1fae5', '#a7f3d0']}
            style={styles.summaryCard}
          >
            <View style={[styles.summaryIconWrapper, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <Ionicons name="trending-up" size={16} color="white" />
            </View>
            <Text style={[styles.summaryCardLabel, { color: isDark ? '#d1fae5' : '#065f46' }]} numberOfLines={1} adjustsFontSizeToFit>Conversion</Text>
            <Text style={[styles.summaryCardValue, { color: isDark ? '#ffffff' : '#047857' }]}>{conversionRate}%</Text>
          </LinearGradient>
        </View>

        {/* Status Breakdown Title */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Status Breakdown</Text>
          <View style={[styles.divider, { backgroundColor: isDark ? '#334155' : '#e2e8f0' }]} />
        </View>

        <View style={styles.statsGrid}>
          {statusItems.map((item) => {
            const percentage = stats.total > 0 ? (item.value / stats.total) * 100 : 0;
            const color = getStatusColor(item.key);
            
            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.statCard,
                  { 
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    borderLeftWidth: 3,
                    borderLeftColor: color,
                  }
                ]}
                onPress={() => handleStatusClick(item.key)}
                activeOpacity={0.7}
              >
                <View style={styles.statContent}>
                  <View style={styles.statLeft}>
                    <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
                      <Ionicons
                        name={getStatusIcon(item.key) as any}
                        size={16}
                        color={color}
                      />
                    </View>
                    <View style={styles.statTextContainer}>
                      <Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]} numberOfLines={1}>
                        {formatStatusLabel(item.key)}
                      </Text>
                      <View style={styles.statMetrics}>
                        <Text style={[styles.statValue, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
                          {item.value}
                        </Text>
                        <Text style={[styles.percentage, { color: color }]}>
                          {percentage.toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                
                <View style={[styles.progressBar, { backgroundColor: isDark ? '#334155' : '#f1f5f9' }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { backgroundColor: color, width: `${percentage}%` }
                    ]}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={isDark ? ['#1e293b', '#334155'] : ['#ffffff', '#f8fafc']}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <LinearGradient
            colors={['#3b82f6', '#8b5cf6']}
            style={styles.iconContainer}
          >
            <Ionicons name="stats-chart" size={24} color="white" />
          </LinearGradient>
          <View style={styles.titleContent}>
            <Text style={[styles.title, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
              My Statistics
            </Text>
            <Text style={[styles.subtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
               {stats ? `Total: ${stats.total}` : currentUser}
            </Text>
          </View>
        </View>
        
        {/* Scrollable Filter Chips */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {TIME_PERIODS.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.filterChip,
                selectedPeriod === period.key && styles.activeFilterChip,
                { 
                  backgroundColor: selectedPeriod === period.key 
                    ? '#3b82f6' 
                    : (isDark ? '#374151' : '#f3f4f6') 
                }
              ]}
              onPress={() => setSelectedPeriod(period.key)}
            >
              <Text style={[
                styles.filterText,
                { color: selectedPeriod === period.key ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b') }
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>

      {/* Status Details Modal */}
      <Modal visible={showDetailsModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={isDark ? ['#1e293b', '#334155'] : ['#ffffff', '#f8fafc']}
            style={styles.detailsModal}
          >
            <View style={styles.detailsHeader}>
              <View style={styles.detailsTitleRow}>
                <Text style={[styles.detailsTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
                  {formatStatusLabel(selectedStatus)}
                </Text>
                <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                  <Ionicons name="close" size={24} color={isDark ? '#f8fafc' : '#0f172a'} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.detailsSubtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                {statusRecords.length} record{statusRecords.length !== 1 ? 's' : ''}
              </Text>
            </View>

            {loadingRecords ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={[styles.loadingText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                  Loading records...
                </Text>
              </View>
            ) : (
              <FlatList
                data={statusRecords}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.recordCard,
                      { backgroundColor: isDark ? '#334155' : '#f8fafc' }
                    ]}
                    onPress={() => handleUserClick(item)}
                  >
                    <View style={styles.recordHeader}>
                      <LinearGradient
                        colors={['#3b82f6', '#8b5cf6']}
                        style={styles.recordAvatar}
                      >
                        <Text style={styles.recordAvatarText}>
                          {item.name?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                      </LinearGradient>
                      <View style={styles.recordInfo}>
                        <Text style={[styles.recordName, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
                          {item.name}
                        </Text>
                        <Text style={[styles.recordPhone, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                          {item.mobile_no}
                        </Text>
                      </View>
                    </View>
                    {item.feedback && (
                      <View style={[styles.feedbackBadge, { backgroundColor: isDark ? '#1e293b' : '#e0e7ff' }]}>
                        <Ionicons name="chatbubble" size={12} color={isDark ? '#60a5fa' : '#3b82f6'} />
                        <Text style={[styles.feedbackText, { color: isDark ? '#94a3b8' : '#64748b' }]} numberOfLines={1}>
                          {item.feedback}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="document-outline" size={48} color={isDark ? '#475569' : '#cbd5e1'} />
                    <Text style={[styles.emptyText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                      No records found
                    </Text>
                  </View>
                }
                contentContainerStyle={styles.recordsList}
              />
            )}
          </LinearGradient>
        </View>
      </Modal>

      {/* User Details Modal */}
      <UserDetailsModal
        visible={showUserModal}
        onClose={() => setShowUserModal(false)}
        user={selectedUser}
        isDark={isDark}
        onUserUpdate={() => {
          // Refresh the status records
          if (selectedStatus) {
            handleStatusClick(selectedStatus);
          }
        }}
        currentUser={currentUser}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    margin: 0,
    paddingBottom: 8,
    overflow: 'hidden',
  },
  header: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  titleContent: {
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterContainer: {
    gap: 8,
    paddingRight: 20,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeFilterChip: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    paddingBottom: 20,
  },
  statsWrapper: {
    paddingHorizontal: 16,
  },
  summaryCardsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryCardLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  summaryCardValue: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  divider: {
    height: 2,
    borderRadius: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  rateWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statsGrid: {
    gap: 10,
  },
  statCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  statContent: {
    marginBottom: 8,
  },
  statLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statTextContainer: {
    flex: 1,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statMetrics: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  percentage: {
    fontSize: 11,
    fontWeight: '700',
  },
  centerContent: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  detailsModal: {
    height: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  detailsHeader: {
    marginBottom: 20,
  },
  detailsTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  detailsSubtitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  recordsList: {
    paddingBottom: 20,
  },
  recordCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  recordAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  recordInfo: {
    flex: 1,
  },
  recordName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  recordPhone: {
    fontSize: 14,
    fontWeight: '500',
  },
  feedbackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  feedbackText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
});