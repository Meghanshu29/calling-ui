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
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";
import { Toast } from "../components/Toast";
import { UserDetailsModal } from "../components/UserDetailsModal";
import { FilterState, UserFilter } from "../components/UserFilter";
import { useAuth } from "../contexts/AuthContext";
import { AssignmentStats } from "../endpoints/stats";
import {
    getEscalatedUsers,
    GetUnregisterdUsers,
    sendWhatsAppMessage
} from "../endpoints/users";
import { useToast } from "../hooks/useToast";

interface User {
  id: number;
  name: string;
  mobile_no: number | null;
  instruction: string;
  status: string;
  feedback: string | null;
  assigned_to: string;
  tag: string | null;
  is_processed: boolean;
  created_at: string;
  updated_at: string;
  priority: string;
}

type TabType = "unregister user" | "matched_users" | "incomplete user" | "others" | "whatsapp";

const TABS: {
  key: TabType;
  label: string;
  icon: string;
}[] = [
  { key: "unregister user", label: "Unregistered", icon: "person-add" },
  { key: "matched_users", label: "Matched User", icon: "heart" },
  { key: "incomplete user", label: "Incomplete User", icon: "hourglass" },
  { key: "others", label: "Others", icon: "people" },
  { key: "whatsapp", label: "WhatsApp", icon: "logo-whatsapp" },
];

export default function SuperAdminScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("unregister user");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<FilterState>({});
  const [loggedInUser, setLoggedInUser] = useState<string>("ADMIN");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [isInterested, setIsInterested] = useState<number | null>(null);
  const [statsData, setStatsData] = useState<AssignmentStats[]>([]);
  const [showCurrentDay, setShowCurrentDay] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { toast, showSuccess, showError, hideToast } = useToast();
  const { logout } = useAuth();

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const userInfo = await AsyncStorage.getItem("userInfo");
      if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
        const username = parsedUser.username || parsedUser.email;
        setLoggedInUser(username);
      } else {
        setLoggedInUser("ADMIN");
      }
      // Automaticaly fetch users after loading info
      fetchUsers();
    } catch (error) {
      console.error("Error loading user info:", error);
      setLoggedInUser("ADMIN");
      fetchUsers();
    }
  };;

  const getTabColor = (tab: TabType): string => {
    switch (tab) {
      case "unregister user":
        return "#3b82f6";
      case "matched_users":
        return "#ec4899";
      case "incomplete user":
        return "#f59e0b";
      case "others":
        return "#8b5cf6";
      default:
        return "#3b82f6";
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let response;
      
      if (activeTab === "others") {
        response = await getEscalatedUsers();
      } else if (activeTab === "whatsapp") {
        setUsers([]);
        setLoading(false);
        return;
      } else {
        response = await GetUnregisterdUsers({
          tag: activeTab,
          status: "pending",
          state: filters.state || undefined,
          city: filters.city || undefined,
          auto_assign: false,
          limit: 100,
          offset: 0,
        });
      }
      
      setUsers(response?.users || []);
      showSuccess(`Loaded ${response?.users?.length || 0} users`);
    } catch (error: any) {
      showError(error.message || "Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const renderUserItem = ({ item }: { item: User }) => {
    const tabColor = getTabColor(activeTab);
    return (
      <TouchableOpacity 
        style={[styles.userItem, { backgroundColor: isDark ? "#1e293b" : "#ffffff", borderColor: isDark ? "#334155" : "#e2e8f0" }]}
        onPress={() => handleUserPress(item)}
      >
        <View style={styles.userHeader}>
          <LinearGradient
            colors={[tabColor, tabColor + 'dd']}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
          </LinearGradient>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: isDark ? "#f8fafc" : "#0f172a" }]}>{item.name}</Text>
            <Text style={[styles.userPhone, { color: isDark ? "#94a3b8" : "#64748b" }]}>{item.mobile_no || 'No number'}</Text>
            <Text style={[styles.userStatus, { color: tabColor }]}>{item.status || 'Pending'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={isDark ? "#475569" : "#cbd5e1"} />
        </View>
      </TouchableOpacity>
    );
  };

  const handleUserPress = (user: User) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleSendWhatsApp = async () => {
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
      
      setPhoneNumber('');
      setName('');
      setIsInterested(null);
    } catch (error: any) {
      showError(error.message || 'Failed to send WhatsApp message');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredUsers = () => {
    if (!searchQuery) return users;
    return users.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(user.mobile_no).includes(searchQuery) ||
      user.assigned_to.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const renderStatsCard = ({ item }: { item: AssignmentStats }) => {
    const totalCalls = item.total;
    const completionRate = totalCalls > 0 ? ((totalCalls - item.pending) / totalCalls * 100).toFixed(1) : '0';
    
    return (
      <View style={[styles.statsCard, { backgroundColor: isDark ? "#1e293b" : "#ffffff" }]}>
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
            <Text style={[styles.statsTotal, { color: isDark ? "#94a3b8" : "#64748b" }]}>
              Total: {totalCalls} • Completion: {completionRate}%
            </Text>
          </View>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#22c55e" }]}>{item.interested}</Text>
            <Text style={[styles.statLabel, { color: isDark ? "#94a3b8" : "#64748b" }]}>Interested</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#ef4444" }]}>{item.not_interested}</Text>
            <Text style={[styles.statLabel, { color: isDark ? "#94a3b8" : "#64748b" }]}>Not Interested</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#8b5cf6" }]}>{item.escalate_to_sonia}</Text>
            <Text style={[styles.statLabel, { color: isDark ? "#94a3b8" : "#64748b" }]}>Escalated</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#f59e0b" }]}>{item.pending}</Text>
            <Text style={[styles.statLabel, { color: isDark ? "#94a3b8" : "#64748b" }]}>Pending</Text>
          </View>
        </View>
      </View>
    );
  };

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    const hasFilters = newFilters.state || newFilters.city || newFilters.status;
    showSuccess(
      hasFilters ? "Filters applied" : "Filters cleared",
    );
  };

  return (
    <LinearGradient
      colors={
        isDark
          ? (["#0f172a", "#1e293b", "#334155"] as const)
          : (["#f0f9ff", "#e0f2fe", "#f8fafc"] as const)
      }
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <LinearGradient
            colors={["#8b5cf6", "#ec4899"]}
            style={styles.titleIcon}
          >
            <Ionicons name="shield-checkmark" size={24} color="#ffffff" />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text
              style={[styles.title, { color: isDark ? "#f8fafc" : "#0f172a" }]}
            >
              Super Admin Dashboard
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: isDark ? "#94a3b8" : "#64748b" },
              ]}
            >
              {loggedInUser} • {activeTab.replace("_", " ")} • {users.length} users
            </Text>
          </View>
          <TouchableOpacity
            onPress={logout}
            style={[
              styles.logoutButton,
              { backgroundColor: isDark ? "#374151" : "#f3f4f6" },
            ]}
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color={isDark ? "#f87171" : "#dc2626"}
            />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContainer}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const tabColor = getTabColor(tab.key);

            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tab,
                  {
                    backgroundColor: isActive
                      ? tabColor
                      : isDark
                        ? "#334155"
                        : "#f1f5f9",
                    borderColor: isActive ? tabColor : "transparent",
                  },
                ]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={16}
                  color={isActive ? "#ffffff" : isDark ? "#94a3b8" : "#64748b"}
                />
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: isActive
                        ? "#ffffff"
                        : isDark
                          ? "#94a3b8"
                          : "#64748b",
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              { backgroundColor: isDark ? "#1e293b" : "#ffffff" },
            ]}
            onPress={() => setShowFilter(true)}
          >
            <Ionicons name="filter" size={16} color="#6366f1" />
            <Text
              style={[
                styles.filterButtonText,
                { color: isDark ? "#f8fafc" : "#1e293b" },
              ]}
            >
              Filter
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.fetchButton,
              { backgroundColor: getTabColor(activeTab) },
            ]}
            onPress={fetchUsers}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="download" size={16} color="white" />
                <Text style={styles.fetchButtonText}>Load Users</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={getTabColor(activeTab)} />
          <Text style={[styles.loadingText, { color: isDark ? "#94a3b8" : "#64748b" }]}>
            Loading users...
          </Text>
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people" size={48} color={isDark ? "#64748b" : "#94a3b8"} />
              <Text style={[styles.emptyText, { color: isDark ? "#94a3b8" : "#64748b" }]}>
                No users found. Click "Load Users" to fetch data.
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

      <UserFilter
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
        isDark={isDark}
      />

      <UserDetailsModal
        visible={showUserDetails}
        onClose={() => setShowUserDetails(false)}
        user={selectedUser}
        isDark={isDark}
        onUserUpdate={fetchUsers}
        isSuperAdmin={true}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    marginTop: 2,
  },
  tabScrollContainer: {
    paddingHorizontal: 4,
    gap: 12,
    marginBottom: 16,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    gap: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 16,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 12,
    flex: 1,
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  fetchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    gap: 8,
  },
  fetchButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  userItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  userStatus: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
  },
  statsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(148, 163, 184, 0.1)",
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
  },
  activeToggle: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
  },
  statsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
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
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  statsInfo: {
    flex: 1,
  },
  statsName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  statsTotal: {
    fontSize: 14,
    fontWeight: "500",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
});