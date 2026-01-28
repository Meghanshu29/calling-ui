import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { AssignmentStats, getAssignmentStats } from '../endpoints/stats';

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
        <View style={[styles.summaryRow, { borderBottomColor: isDark ? '#334155' : '#f1f5f9' }]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Total Calls</Text>
            <Text style={[styles.summaryValue, { color: isDark ? '#f8fafc' : '#0f172a' }]}>{stats.total}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Completion Rate</Text>
            <View style={styles.rateWrapper}>
              <Text style={[styles.summaryValue, { color: '#3b82f6' }]}>{completionRate}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          {statusItems.map((item) => {
            const percentage = stats.total > 0 ? (item.value / stats.total) * 100 : 0;
            const color = getStatusColor(item.key);
            
            return (
              <View
                key={item.key}
                style={[
                  styles.statCard,
                  { backgroundColor: isDark ? '#1e293b' : '#f8fafc' }
                ]}
              >
                <View style={styles.statHeader}>
                  <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
                    <Ionicons
                      name={getStatusIcon(item.key) as any}
                      size={18}
                      color={color}
                    />
                  </View>
                  <Text style={[styles.statValue, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
                    {item.value}
                  </Text>
                </View>
                
                <Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]} numberOfLines={1}>
                  {formatStatusLabel(item.key)}
                </Text>
                
                <View style={[styles.progressBar, { backgroundColor: isDark ? '#334155' : '#e2e8f0' }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { backgroundColor: color, width: `${percentage}%` }
                    ]}
                  />
                </View>
                
                <Text style={[styles.percentage, { color: color }]}>
                  {percentage.toFixed(1)}%
                </Text>
              </View>
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
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    margin: 16,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '47.8%',
    padding: 16,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  percentage: {
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'right',
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
});