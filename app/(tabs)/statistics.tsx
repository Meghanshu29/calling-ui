import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";
import { CallingDetailsModal } from "../../components/CallingDetailsModal";
import { Toast } from "../../components/Toast";
import { AssignmentStats, getAssignmentStats } from "../../endpoints/stats";
import { useToast } from "../../hooks/useToast";

const TIME_PERIODS = [
  { key: 'all', label: 'All Time' },
  { key: 'current', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'last_7_days', label: 'Last 7 Days' },
  { key: 'last_15_days', label: 'Last 15 Days' },
  { key: 'last_30_days', label: 'Last 30 Days' },
  { key: 'last_3_months', label: 'Last 3 Months' },
];

export default function StatisticsScreen() {
  const [statsData, setStatsData] = useState<AssignmentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [masterAgents, setMasterAgents] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { toast, showError, hideToast } = useToast();

  useEffect(() => {
    loadUserAndStats();
  }, [selectedPeriod]);

  // Initial fetch of ALL agents
  useEffect(() => {
    fetchMasterList();
  }, []);

  const fetchMasterList = async () => {
    try {
      const response = await getAssignmentStats('all');
      if (response.data) {
        const agentNames = response.data.map(stat => stat.assigned_to);
        setMasterAgents(agentNames);
      }
    } catch (error) {
      console.error("Error fetching master agent list:", error);
    }
  };

  const loadUserAndStats = async () => {
    setLoading(true);
    try {
      const userInfo = await AsyncStorage.getItem("userInfo");
      if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
        setUserRole(parsedUser.role || "CALL_AGENT");
      }

      const response = await getAssignmentStats(selectedPeriod);
      const currentStats = response.data || [];

      // Merge Logic: Use master list to ensure all agents are represented
      // If master list is empty (e.g. first load failed), fall back to current stats
      const allAgentNames = Array.from(new Set([...masterAgents, ...currentStats.map(s => s.assigned_to)]));
      
      const mergedStats: AssignmentStats[] = allAgentNames.map(name => {
        const found = currentStats.find(s => s.assigned_to === name);
        if (found) return found;
        
        // Return zeroed-out object for missing agents
        return {
          assigned_to: name,
          total: 0,
          interested: 0,
          not_interested: 0,
          escalate_to_sonia: 0,
          declined: 0,
          busy_call_later: 0,
          married_engaged: 0,
          complete_soon: 0,
          need_help_completing: 0,
          not_serious: 0,
          pending: 0,
          no_status: 0
        };
      });

      // Optional: Sort alphabetically or by total
      // Let's sort alphabetically for consistent list position
      mergedStats.sort((a, b) => a.assigned_to.localeCompare(b.assigned_to));

      setStatsData(mergedStats);
    } catch (error) {
      console.error("Error loading stats:", error);
      showError("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  const handleStatBlockPress = (agentName: string, status?: string) => {
    setSelectedAgent(agentName);
    setSelectedStatus(status);
    setShowDetailsModal(true);
  };

  const getFilteredStats = () => {
    if (!searchQuery.trim()) return statsData;
    return statsData.filter(stat => 
      stat.assigned_to.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const renderStatsCard = ({ item }: { item: AssignmentStats }) => {
    const totalCalls = item.total;
    const completionRate = totalCalls > 0 ? (((totalCalls - item.pending) / totalCalls) * 100).toFixed(1) : "0";
    const conversionRate = totalCalls > 0 ? ((item.interested / totalCalls) * 100).toFixed(1) : "0";

    return (
      <View style={[styles.statsCard, { 
        backgroundColor: isDark ? "#1e293b" : "#ffffff",
        borderColor: isDark ? "#475569" : "#e2e8f0",
        shadowColor: "#3b82f6",
      }]}>
        <View style={styles.statsHeader}>
          <LinearGradient
            colors={["#f97316", "#ea580c"]}
            style={styles.statsAvatar}
          >
            <Text style={styles.statsAvatarText}>
              {item.assigned_to.charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
          <View style={styles.statsInfo}>
            <Text style={[styles.statsName, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
              {item.assigned_to}
            </Text>
          </View>
        </View>

        <View style={styles.statsMetricsRow}>
          <View style={styles.metricColumn}>
            <Text style={[styles.metricLabel, { color: isDark ? "#64748b" : "#94a3b8" }]}>Total</Text>
            <View style={styles.metricValueRow}>
              <Ionicons name="call" size={16} color={isDark ? "#94a3b8" : "#64748b"} />
              <Text style={[styles.metricText, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
                {totalCalls}
              </Text>
            </View>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricColumn}>
            <Text style={[styles.metricLabel, { color: isDark ? "#64748b" : "#94a3b8" }]}>Done</Text>
            <View style={styles.metricValueRow}>
              <Ionicons name="checkmark-circle" size={16} color="#3b82f6" />
              <Text style={[styles.metricText, { color: '#3b82f6' }]}>
                {completionRate}%
              </Text>
            </View>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricColumn}>
            <Text style={[styles.metricLabel, { color: isDark ? "#64748b" : "#94a3b8" }]}>Conversion</Text>
            <View style={styles.metricValueRow}>
              <Ionicons name="trending-up" size={16} color="#10b981" />
              <Text style={[styles.metricText, { color: '#10b981' }]}>
                {conversionRate}%
              </Text>
            </View>
          </View>
        </View>

        {totalCalls > 0 ? (
          <View style={styles.statsGrid}>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => handleStatBlockPress(item.assigned_to, 'Interested')}
            >
              <Text style={[styles.statValue, { color: "#22c55e" }]}>{item.interested}</Text>
              <Text style={[styles.statLabel, { color: isDark ? "#94a3b8" : "#64748b" }]}>Interested</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => handleStatBlockPress(item.assigned_to, 'Not Interested')}
            >
              <Text style={[styles.statValue, { color: "#ef4444" }]}>{item.not_interested}</Text>
              <Text style={[styles.statLabel, { color: isDark ? "#94a3b8" : "#64748b" }]}>Not Interested</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => handleStatBlockPress(item.assigned_to, 'Declined')}
            >
              <Text style={[styles.statValue, { color: "#f43f5e" }]}>{item.declined}</Text>
              <Text style={[styles.statLabel, { color: isDark ? "#94a3b8" : "#64748b" }]}>Declined</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => handleStatBlockPress(item.assigned_to, 'Busy Call Later')}
            >
              <Text style={[styles.statValue, { color: "#f59e0b" }]}>{item.busy_call_later}</Text>
              <Text style={[styles.statLabel, { color: isDark ? "#94a3b8" : "#64748b" }]}>Busy/Call Later</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => handleStatBlockPress(item.assigned_to, 'Married/Engaged')}
            >
              <Text style={[styles.statValue, { color: "#ec4899" }]}>{item.married_engaged}</Text>
              <Text style={[styles.statLabel, { color: isDark ? "#94a3b8" : "#64748b" }]}>Married/Engaged</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => handleStatBlockPress(item.assigned_to, 'Escalate to Sonia')}
            >
              <Text style={[styles.statValue, { color: "#8b5cf6" }]}>{item.escalate_to_sonia}</Text>
              <Text style={[styles.statLabel, { color: isDark ? "#94a3b8" : "#64748b" }]}>Escalated</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => handleStatBlockPress(item.assigned_to, 'Complete Soon')}
            >
              <Text style={[styles.statValue, { color: "#10b981" }]}>{item.complete_soon}</Text>
              <Text style={[styles.statLabel, { color: isDark ? "#94a3b8" : "#64748b" }]}>Complete Soon</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => handleStatBlockPress(item.assigned_to, 'Need Help Completing')}
            >
              <Text style={[styles.statValue, { color: "#3b82f6" }]}>{item.need_help_completing}</Text>
              <Text style={[styles.statLabel, { color: isDark ? "#94a3b8" : "#64748b" }]}>Need Help</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => handleStatBlockPress(item.assigned_to, 'Not Serious')}
            >
              <Text style={[styles.statValue, { color: "#fb923c" }]}>{item.not_serious}</Text>
              <Text style={[styles.statLabel, { color: isDark ? "#94a3b8" : "#64748b" }]}>Not Serious</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => handleStatBlockPress(item.assigned_to, 'pending')}
            >
              <Text style={[styles.statValue, { color: "#a855f7" }]}>{item.pending}</Text>
              <Text style={[styles.statLabel, { color: isDark ? "#94a3b8" : "#64748b" }]}>Pending</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={[styles.noDataText, { color: isDark ? "#94a3b8" : "#64748b" }]}>
              No activity recorded for {TIME_PERIODS.find(p => p.key === selectedPeriod)?.label || 'this period'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={
        isDark
          ? ["#1e293b", "#334155", "#475569"]
          : ["#ffffff", "#f8fafc", "#f1f5f9"]
      }
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <LinearGradient
            colors={["#10b981", "#059669"]}
            style={styles.titleIcon}
          >
            <Ionicons name="stats-chart" size={24} color="#ffffff" />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
              Statistics
            </Text>
            <Text style={[styles.subtitle, { color: isDark ? "#94a3b8" : "#64748b" }]}>
              Call distribution and performance tracking
            </Text>
          </View>
        </View>

        <View style={styles.filterSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          >
            {TIME_PERIODS.map((period) => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.filterButton,
                  selectedPeriod === period.key && styles.activeFilter,
                  { 
                    backgroundColor: selectedPeriod === period.key 
                      ? "#3b82f6" 
                      : (isDark ? "#1e293b" : "#ffffff"),
                    borderColor: selectedPeriod === period.key 
                      ? "#3b82f6" 
                      : (isDark ? "#475569" : "#e2e8f0")
                  }
                ]}
                onPress={() => setSelectedPeriod(period.key)}
              >
                <Text style={[
                  styles.filterText, 
                  selectedPeriod === period.key && styles.activeFilterText
                ]}>
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { 
          backgroundColor: isDark ? "#1e293b" : "#ffffff",
          borderColor: isDark ? "#475569" : "#e2e8f0"
        }]}>
          <Ionicons name="search" size={20} color={isDark ? "#94a3b8" : "#64748b"} />
          <TextInput
            style={[styles.searchInput, { color: isDark ? "#f8fafc" : "#0f172a" }]}
            placeholder="Search customer support by name..."
            placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={isDark ? "#94a3b8" : "#64748b"} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <FlatList
          data={getFilteredStats()}
          renderItem={renderStatsCard}
          keyExtractor={(item) => item.assigned_to}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="analytics" size={48} color={isDark ? "#334155" : "#e2e8f0"} />
              <Text style={[styles.emptyText, { color: isDark ? "#94a3b8" : "#64748b" }]}>
                No statistics data available for {TIME_PERIODS.find(p => p.key === selectedPeriod)?.label}
              </Text>
            </View>
          }
        />
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />

      <CallingDetailsModal
        visible={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        agentName={selectedAgent || ''}
        timePeriod={selectedPeriod}
        status={selectedStatus}
        isDark={isDark}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  titleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  filterSection: {
    flexDirection: "row",
  },
  filterScrollContent: {
    gap: 8,
    paddingRight: 20, // Add some padding at the end of scroll
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  activeFilter: {
    borderColor: "#3b82f6",
  },
  filterText: {
    fontWeight: "600",
    color: "#64748b",
    fontSize: 12,
  },
  activeFilterText: {
    color: "#ffffff",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  statsCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  statsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  statsAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  statsAvatarText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
  },
  statsInfo: {
    flex: 1,
  },
  statsName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  statsTotal: {
    fontSize: 12,
    fontWeight: "500",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: "30%",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(148, 163, 184, 0.05)",
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(148, 163, 184, 0.05)',
    borderRadius: 12,
  },
  noDataText: {
    fontSize: 14,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  statsMetricsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.1)',
    gap: 16,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricText: {
    fontSize: 16,
    fontWeight: '800',
  },
  metricDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#cbd5e1',
    opacity: 0.2,
  },
  metricsGrid: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  metricColumn: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  metricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  metricBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
