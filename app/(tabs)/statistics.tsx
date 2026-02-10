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
import { AssignmentStats, getAssignmentStats, sendStatisticsEmail, getComparisonStats, ComparisonData } from "../../endpoints/stats";
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

  const [showComparison, setShowComparison] = useState(false);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [sendingAgentEmail, setSendingAgentEmail] = useState<{[key: string]: boolean}>({});
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { toast, showError, showSuccess, hideToast } = useToast();

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

  const handleSendAgentEmail = async (agentName: string) => {
    try {
      setSendingAgentEmail(prev => ({ ...prev, [agentName]: true }));
      const userInfo = await AsyncStorage.getItem("userInfo");
      if (!userInfo) {
        showError("User information not found");
        return;
      }
      const parsedUser = JSON.parse(userInfo);
      const email = parsedUser.email || "";
      
      if (!email) {
        showError("Email address not found");
        return;
      }

      await sendStatisticsEmail(agentName, email, selectedPeriod);
      showSuccess(`Statistics sent for ${agentName}`);
    } catch (error) {
      console.error("Error sending email:", error);
      showError("Failed to send statistics email");
    } finally {
      setSendingAgentEmail(prev => ({ ...prev, [agentName]: false }));
    }
  };

  const loadComparison = async () => {
    try {
      setShowComparison(true);
      const data = await getComparisonStats();
      console.log('Comparison data loaded:', data);
      setComparisonData(data);
    } catch (error) {
      console.error("Error loading comparison:", error);
      showError("Failed to load comparison data");
      setShowComparison(false);
    }
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const getAgentStats = (data: AssignmentStats[], agent: string) => {
    return data.find(s => s.assigned_to === agent) || { total: 0, interested: 0, pending: 0 };
  };

  const renderComparison = () => {
    if (!comparisonData) {
      return (
        <View style={[styles.comparisonContainer, { 
          backgroundColor: isDark ? "#1e293b" : "#ffffff",
          borderColor: isDark ? "#475569" : "#e2e8f0"
        }]}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={{ textAlign: 'center', marginTop: 12, color: isDark ? "#94a3b8" : "#64748b" }}>Loading comparison...</Text>
        </View>
      );
    }

    console.log('Rendering comparison with agents:', masterAgents.length);

    return (
      <View style={[styles.comparisonContainer, { 
        backgroundColor: isDark ? "#1e293b" : "#ffffff",
        borderColor: isDark ? "#475569" : "#e2e8f0"
      }]}>
        <View style={styles.comparisonHeader}>
          <View>
            <Text style={[styles.comparisonTitle, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
              Performance Comparison
            </Text>
            <Text style={[styles.comparisonSubtitle, { color: isDark ? "#94a3b8" : "#64748b" }]}>
              Today's performance vs historical data
            </Text>
          </View>
          <TouchableOpacity onPress={() => setShowComparison(false)}>
            <Ionicons name="close" size={24} color={isDark ? "#94a3b8" : "#64748b"} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.comparisonScroll} showsVerticalScrollIndicator={true}>
          {masterAgents.map(agent => {
            const today = getAgentStats(comparisonData.today, agent);
            const yesterday = getAgentStats(comparisonData.yesterday, agent);
            const last7Avg = getAgentStats(comparisonData.last7, agent).total / 7;
            const vsYesterday = calculateChange(today.total, yesterday.total);
            const vsLast7 = calculateChange(today.total, last7Avg);

            return (
              <View key={agent} style={[styles.comparisonCard, {
                backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                borderColor: isDark ? "#334155" : "#e2e8f0"
              }]}>
                {/* Agent Header */}
                <View style={styles.comparisonCardHeader}>
                  <LinearGradient
                    colors={["#f97316", "#ea580c"]}
                    style={styles.comparisonAvatar}
                  >
                    <Text style={styles.comparisonAvatarText}>
                      {agent.charAt(0).toUpperCase()}
                    </Text>
                  </LinearGradient>
                  <Text style={[styles.comparisonAgentName, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
                    {agent}
                  </Text>
                </View>

                {/* Today's Stats */}
                <View style={styles.todayStats}>
                  <Text style={[styles.todayLabel, { color: isDark ? "#94a3b8" : "#64748b" }]}>Today's Calls</Text>
                  <Text style={[styles.todayValue, { color: "#3b82f6" }]}>{today.total}</Text>
                </View>

                {/* Comparison Metrics */}
                <View style={styles.comparisonMetrics}>
                  {/* vs Yesterday */}
                  <View style={[styles.metricBox, {
                    backgroundColor: isDark ? "#1e293b" : "#ffffff",
                    borderColor: vsYesterday >= 0 ? "#10b981" : "#ef4444"
                  }]}>
                    <View style={styles.metricHeader}>
                      <Ionicons name="calendar-outline" size={16} color={isDark ? "#94a3b8" : "#64748b"} />
                      <Text style={[styles.metricTitle, { color: isDark ? "#94a3b8" : "#64748b" }]}>vs Yesterday</Text>
                    </View>
                    <View style={styles.metricContent}>
                      <Text style={[styles.metricCount, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
                        {yesterday.total}
                      </Text>
                      <View style={styles.metricChange}>
                        <Ionicons 
                          name={vsYesterday >= 0 ? "arrow-up" : "arrow-down"} 
                          size={18} 
                          color={vsYesterday >= 0 ? "#10b981" : "#ef4444"} 
                        />
                        <Text style={[styles.metricPercent, { color: vsYesterday >= 0 ? "#10b981" : "#ef4444" }]}>
                          {Math.abs(vsYesterday).toFixed(0)}%
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.metricLabel, { color: vsYesterday >= 0 ? "#10b981" : "#ef4444" }]}>
                      {vsYesterday >= 0 ? "Increased" : "Decreased"}
                    </Text>
                  </View>

                  {/* vs Last 7 Days */}
                  <View style={[styles.metricBox, {
                    backgroundColor: isDark ? "#1e293b" : "#ffffff",
                    borderColor: vsLast7 >= 0 ? "#10b981" : "#ef4444"
                  }]}>
                    <View style={styles.metricHeader}>
                      <Ionicons name="calendar" size={16} color={isDark ? "#94a3b8" : "#64748b"} />
                      <Text style={[styles.metricTitle, { color: isDark ? "#94a3b8" : "#64748b" }]}>vs Last 7 Days Avg</Text>
                    </View>
                    <View style={styles.metricContent}>
                      <Text style={[styles.metricCount, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
                        {last7Avg.toFixed(1)}
                      </Text>
                      <View style={styles.metricChange}>
                        <Ionicons 
                          name={vsLast7 >= 0 ? "arrow-up" : "arrow-down"} 
                          size={18} 
                          color={vsLast7 >= 0 ? "#10b981" : "#ef4444"} 
                        />
                        <Text style={[styles.metricPercent, { color: vsLast7 >= 0 ? "#10b981" : "#ef4444" }]}>
                          {Math.abs(vsLast7).toFixed(0)}%
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.metricLabel, { color: vsLast7 >= 0 ? "#10b981" : "#ef4444" }]}>
                      {vsLast7 >= 0 ? "Above Average" : "Below Average"}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderStatsCard = ({ item }: { item: AssignmentStats }) => {
    const totalCalls = item.total;
    const completionRate = totalCalls > 0 ? (((totalCalls - item.pending) / totalCalls) * 100).toFixed(1) : "0";
    const conversionRate = totalCalls > 0 ? ((item.interested / totalCalls) * 100).toFixed(1) : "0";
    const isEmailSending = sendingAgentEmail[item.assigned_to] || false;

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
          <TouchableOpacity
            style={[styles.agentEmailButton, { opacity: isEmailSending ? 0.6 : 1 }]}
            onPress={() => handleSendAgentEmail(item.assigned_to)}
            disabled={isEmailSending}
          >
            {isEmailSending ? (
              <ActivityIndicator size="small" color="#3b82f6" />
            ) : (
              <Ionicons name="mail-outline" size={20} color="#3b82f6" />
            )}
          </TouchableOpacity>
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

        {/* Comparison Button */}
        <TouchableOpacity
          style={[styles.comparisonButton, { 
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            borderColor: "#10b981"
          }]}
          onPress={loadComparison}
        >
          <Ionicons name="git-compare" size={20} color="#10b981" />
          <Text style={[styles.comparisonButtonText, { color: "#10b981" }]}>
            Compare Performance
          </Text>
        </TouchableOpacity>
      </View>

      {showComparison && renderComparison()}

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
  comparisonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
    borderWidth: 2,
  },
  comparisonButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  comparisonContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    maxHeight: 500,
  },
  comparisonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  comparisonTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  comparisonSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  comparisonScroll: {
    maxHeight: 400,
  },
  comparisonCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  comparisonCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  comparisonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comparisonAvatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  comparisonAgentName: {
    fontSize: 16,
    fontWeight: '700',
  },
  todayStats: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  todayLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  todayValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  comparisonMetrics: {
    flexDirection: 'row',
    gap: 12,
  },
  metricBox: {
    flex: 1,
    borderRadius: 10,
    padding: 12,
    borderWidth: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metricContent: {
    alignItems: 'center',
    marginBottom: 8,
  },
  metricCount: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  metricPercent: {
    fontSize: 16,
    fontWeight: '800',
  },
   
  agentEmailButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
});
