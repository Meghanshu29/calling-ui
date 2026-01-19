import { LinearGradient } from "expo-linear-gradient";
import { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  ActivityIndicator,
  FlatList,
  Linking,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getEscalatedUsers, getNotSeriousUsers, getDeclinedUsers, getBusyCallLaterUsers, getInterestedUsers, getNotInterestedUsers, getMarriedEngagedUsers, getCompleteSoonUsers, getNeedHelpUsers, getInterestedNotRegisteredUsers } from "../../endpoints/users";
import { useToast } from "../../hooks/useToast";
import { Toast } from "../../components/Toast";
import { UserDetailsModal } from "../../components/UserDetailsModal";

type SubTabType = "Busy Call Later" | "Declined" | "Not Serious" | "Escalate to Sonia" | "Interested" | "Not Interested" | "Interested Not Registered" | "Married/Engaged" | "Complete Soon" | "Need Help completing";

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

const SUB_TABS: {
  key: SubTabType;
  label: string;
}[] = [
  { key: "Busy Call Later", label: "Busy Call Later" },
  { key: "Declined", label: "Declined" },
  { key: "Not Serious", label: "Not Serious" },
  { key: "Escalate to Sonia", label: "Escalate to Sonia" },
  { key: "Interested", label: "Interested" },
  { key: "Not Interested", label: "Not Interested" },
  { key: "Interested Not Registered", label: "Interested Not Registered" },
  { key: "Married/Engaged", label: "Married/Engaged" },
  { key: "Complete Soon", label: "Complete Soon" },
  { key: "Need Help completing", label: "Need Help" },
];

export default function OthersScreen() {
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>("Busy Call Later");
  const [searchQuery, setSearchQuery] = useState("");
  const [escalatedUsers, setEscalatedUsers] = useState<User[]>([]);
  const [notSeriousUsers, setNotSeriousUsers] = useState<User[]>([]);
  const [declinedUsers, setDeclinedUsers] = useState<User[]>([]);
  const [busyCallLaterUsers, setBusyCallLaterUsers] = useState<User[]>([]);
  const [interestedUsers, setInterestedUsers] = useState<User[]>([]);
  const [notInterestedUsers, setNotInterestedUsers] = useState<User[]>([]);
  const [interestedNotRegisteredUsers, setInterestedNotRegisteredUsers] = useState<User[]>([]);
  const [marriedEngagedUsers, setMarriedEngagedUsers] = useState<User[]>([]);
  const [completeSoonUsers, setCompleteSoonUsers] = useState<User[]>([]);
  const [needHelpUsers, setNeedHelpUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { toast, showError, hideToast } = useToast();

  const fetchEscalatedUsers = async () => {
    setLoading(true);
    try {
      const response = await getEscalatedUsers();
      setEscalatedUsers(response.users || []);
    } catch (error) {
      console.error("Error fetching escalated users:", error);
      showError("Failed to load escalated users");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotSeriousUsers = async () => {
    setLoading(true);
    try {
      const response = await getNotSeriousUsers();
      setNotSeriousUsers(response.users || []);
    } catch (error) {
      console.error("Error fetching not serious users:", error);
      showError("Failed to load not serious users");
    } finally {
      setLoading(false);
    }
  };

  const fetchDeclinedUsers = async () => {
    setLoading(true);
    try {
      const response = await getDeclinedUsers();
      setDeclinedUsers(response.users || []);
    } catch (error) {
      console.error("Error fetching declined users:", error);
      showError("Failed to load declined users");
    } finally {
      setLoading(false);
    }
  };

  const fetchBusyCallLaterUsers = async () => {
    setLoading(true);
    try {
      const response = await getBusyCallLaterUsers();
      setBusyCallLaterUsers(response.users || []);
    } catch (error) {
      console.error("Error fetching busy call later users:", error);
      showError("Failed to load busy call later users");
    } finally {
      setLoading(false);
    }
  };

  const fetchInterestedUsers = async () => {
    setLoading(true);
    try {
      const response = await getInterestedUsers();
      setInterestedUsers(response.users || []);
    } catch (error) {
      console.error("Error fetching interested users:", error);
      showError("Failed to load interested users");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotInterestedUsers = async () => {
    setLoading(true);
    try {
      const response = await getNotInterestedUsers();
      setNotInterestedUsers(response.users || []);
    } catch (error) {
      console.error("Error fetching not interested users:", error);
      showError("Failed to load not interested users");
    } finally {
      setLoading(false);
    }
  };

  const fetchMarriedEngagedUsers = async () => {
    setLoading(true);
    try {
      const response = await getMarriedEngagedUsers();
      setMarriedEngagedUsers(response.users || []);
    } catch (error) {
      console.error("Error fetching married/engaged users:", error);
      showError("Failed to load married/engaged users");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompleteSoonUsers = async () => {
    setLoading(true);
    try {
      const response = await getCompleteSoonUsers();
      setCompleteSoonUsers(response.users || []);
    } catch (error) {
      console.error("Error fetching complete soon users:", error);
      showError("Failed to load complete soon users");
    } finally {
      setLoading(false);
    }
  };

  const fetchInterestedNotRegisteredUsers = async () => {
    setLoading(true);
    try {
      const response = await getInterestedNotRegisteredUsers();
      setInterestedNotRegisteredUsers(response.users || []);
    } catch (error) {
      console.error("Error fetching interested not registered users:", error);
      showError("Failed to load interested not registered users");
    } finally {
      setLoading(false);
    }
  };

  const fetchNeedHelpUsers = async () => {
    setLoading(true);
    try {
      const response = await getNeedHelpUsers();
      setNeedHelpUsers(response.users || []);
    } catch (error) {
      console.error("Error fetching need help users:", error);
      showError("Failed to load need help users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === "Escalate to Sonia") {
      fetchEscalatedUsers();
    } else if (activeSubTab === "Not Serious") {
      fetchNotSeriousUsers();
    } else if (activeSubTab === "Declined") {
      fetchDeclinedUsers();
    } else if (activeSubTab === "Busy Call Later") {
      fetchBusyCallLaterUsers();
    } else if (activeSubTab === "Interested") {
      fetchInterestedUsers();
    } else if (activeSubTab === "Not Interested") {
      fetchNotInterestedUsers();
    } else if (activeSubTab === "Interested Not Registered") {
      fetchInterestedNotRegisteredUsers();
    } else if (activeSubTab === "Married/Engaged") {
      fetchMarriedEngagedUsers();
    } else if (activeSubTab === "Complete Soon") {
      fetchCompleteSoonUsers();
    } else if (activeSubTab === "Need Help completing") {
      fetchNeedHelpUsers();
    }
  }, [activeSubTab]);

  const handleUserPress = (user: User) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const getTabIcon = (tab: SubTabType) => {
    switch (tab) {
      case "Busy Call Later": return "time";
      case "Declined": return "close-circle";
      case "Not Serious": return "warning";
      case "Escalate to Sonia": return "arrow-up-circle";
      case "Interested": return "heart";
      case "Not Interested": return "heart-dislike";
      case "Interested Not Registered": return "person-add";
      case "Married/Engaged": return "people";
      case "Complete Soon": return "checkmark-circle";
      case "Need Help completing": return "help-circle";
      default: return "ellipse";
    }
  };

  const getTabColor = (tab: SubTabType) => {
    switch (tab) {
      case "Busy Call Later": return "#f59e0b";
      case "Declined": return "#ef4444";
      case "Not Serious": return "#f97316";
      case "Escalate to Sonia": return "#8b5cf6";
      case "Interested": return "#22c55e";
      case "Not Interested": return "#dc2626";
      case "Interested Not Registered": return "#06b6d4";
      case "Married/Engaged": return "#ec4899";
      case "Complete Soon": return "#10b981";
      case "Need Help completing": return "#3b82f6";
      default: return "#3b82f6";
    }
  };

  const getCurrentData = () => {
    const data = (() => {
      switch (activeSubTab) {
        case "Busy Call Later": return busyCallLaterUsers;
        case "Escalate to Sonia": return escalatedUsers;
        case "Not Serious": return notSeriousUsers;
        case "Declined": return declinedUsers;
        case "Interested": return interestedUsers;
        case "Not Interested": return notInterestedUsers;
        case "Interested Not Registered": return interestedNotRegisteredUsers;
        case "Married/Engaged": return marriedEngagedUsers;
        case "Complete Soon": return completeSoonUsers;
        case "Need Help completing": return needHelpUsers;
        default: return [];
      }
    })();
    
    if (!searchQuery) return data;
    
    return data.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.mobile_no.includes(searchQuery) ||
      user.assigned_to.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high": return "#ef4444";
      case "medium": return "#f59e0b";
      case "low": return "#22c55e";
      default: return "#64748b";
    }
  };

  const handleUserUpdate = () => {
    // Refresh current tab data after user update
    if (activeSubTab === "Escalate to Sonia") {
      fetchEscalatedUsers();
    } else if (activeSubTab === "Not Serious") {
      fetchNotSeriousUsers();
    } else if (activeSubTab === "Declined") {
      fetchDeclinedUsers();
    } else if (activeSubTab === "Busy Call Later") {
      fetchBusyCallLaterUsers();
    } else if (activeSubTab === "Interested") {
      fetchInterestedUsers();
    } else if (activeSubTab === "Not Interested") {
      fetchNotInterestedUsers();
    } else if (activeSubTab === "Interested Not Registered") {
      fetchInterestedNotRegisteredUsers();
    } else if (activeSubTab === "Married/Engaged") {
      fetchMarriedEngagedUsers();
    } else if (activeSubTab === "Complete Soon") {
      fetchCompleteSoonUsers();
    } else if (activeSubTab === "Need Help completing") {
      fetchNeedHelpUsers();
    }
  };

  const renderUserCard = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={[styles.userCard, { backgroundColor: isDark ? "#1e293b" : "#ffffff" }]}
      onPress={() => handleUserPress(item)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={isDark ? ['#334155', '#475569'] : ['#f8fafc', '#ffffff']}
        style={styles.cardGradient}
      >
        <View style={styles.cardHeader}>
          <LinearGradient
            colors={['#3b82f6', '#8b5cf6']}
            style={styles.avatarGradient}
          >
            <Text style={styles.avatarText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
          
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.userName, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
                {item.name}
              </Text>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
                <Text style={styles.priorityText}>{item.priority}</Text>
              </View>
            </View>
            
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                Linking.openURL(`tel:${item.mobile_no.split(',')[0].trim()}`);
              }}
              style={styles.phoneRow}
            >
              <Ionicons name="call" size={16} color="#22c55e" />
              <Text style={[styles.phoneText, { color: "#22c55e" }]}>
                {item.mobile_no.split(',')[0].trim()}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.statusRow}>
              <Ionicons name="flag" size={14} color={getTabColor(activeSubTab)} />
              <Text style={[styles.statusText, { color: isDark ? "#94a3b8" : "#64748b" }]}>
                {item.status}
              </Text>
            </View>
            
            {item.feedback && (
              <View style={styles.feedbackRow}>
                <Ionicons name="chatbubble-ellipses" size={14} color={isDark ? "#94a3b8" : "#64748b"} />
                <Text style={[styles.feedbackText, { color: isDark ? "#94a3b8" : "#64748b" }]} numberOfLines={1}>
                  {item.feedback}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.cardActions}>
            <Ionicons name="chevron-forward" size={20} color={isDark ? "#60a5fa" : "#3b82f6"} />
          </View>
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.assignedRow}>
            <Ionicons name="person" size={12} color={isDark ? "#94a3b8" : "#64748b"} />
            <Text style={[styles.assignedText, { color: isDark ? "#94a3b8" : "#64748b" }]}>
              Assigned to {item.assigned_to}
            </Text>
          </View>
          <Text style={[styles.dateText, { color: isDark ? "#64748b" : "#94a3b8" }]}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

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
            colors={['#3b82f6', '#8b5cf6']}
            style={styles.titleIcon}
          >
            <Ionicons name="people" size={24} color="#ffffff" />
          </LinearGradient>
          <View>
            <Text style={[styles.title, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
              User Management
            </Text>
            <Text style={[styles.subtitle, { color: isDark ? "#94a3b8" : "#64748b" }]}>
              {getCurrentData().length} users in {activeSubTab}
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContainer}
        >
          {SUB_TABS.map((tab) => {
            const isActive = activeSubTab === tab.key;
            const tabColor = getTabColor(tab.key);

            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tab,
                  {
                    backgroundColor: isActive ? tabColor : (isDark ? "#334155" : "#f1f5f9"),
                    borderColor: isActive ? tabColor : "transparent",
                  },
                ]}
                onPress={() => setActiveSubTab(tab.key)}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name={getTabIcon(tab.key) as any} 
                  size={16} 
                  color={isActive ? "#ffffff" : (isDark ? "#94a3b8" : "#64748b")} 
                />
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: isActive ? "#ffffff" : (isDark ? "#94a3b8" : "#64748b"),
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={[styles.searchContainer, { backgroundColor: isDark ? "#334155" : "#f8fafc" }]}>
          <Ionicons name="search" size={20} color={isDark ? "#94a3b8" : "#64748b"} />
          <TextInput
            style={[styles.searchInput, { color: isDark ? "#f8fafc" : "#0f172a" }]}
            placeholder="Search by name, phone, or assigned to..."
            placeholderTextColor={isDark ? "#94a3b8" : "#64748b"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={isDark ? "#94a3b8" : "#64748b"} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <LinearGradient
              colors={[getTabColor(activeSubTab) + '20', getTabColor(activeSubTab) + '10']}
              style={styles.loadingCard}
            >
              <ActivityIndicator size="large" color={getTabColor(activeSubTab)} />
              <Text style={[styles.loadingText, { color: isDark ? "#94a3b8" : "#64748b" }]}>
                Loading {activeSubTab.toLowerCase()} users...
              </Text>
            </LinearGradient>
          </View>
        ) : getCurrentData().length > 0 ? (
          <FlatList
            data={getCurrentData()}
            renderItem={renderUserCard}
            keyExtractor={(item) => item.id.toString()}
            style={styles.userList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={[getTabColor(activeSubTab) + '20', getTabColor(activeSubTab) + '10']}
              style={styles.emptyCard}
            >
              <Ionicons name={getTabIcon(activeSubTab) as any} size={48} color={getTabColor(activeSubTab)} />
              <Text style={[styles.emptyTitle, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
                No Users Found
              </Text>
              <Text style={[styles.emptyText, { color: isDark ? "#94a3b8" : "#64748b" }]}>
                No {activeSubTab.toLowerCase()} users available at the moment
              </Text>
            </LinearGradient>
          </View>
        )}
      </View>

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />

      <UserDetailsModal
        visible={showUserDetails}
        onClose={() => setShowUserDetails(false)}
        user={selectedUser}
        isDark={isDark}
        onUserUpdate={handleUserUpdate}
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  tabScrollContainer: {
    paddingHorizontal: 4,
    gap: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 250,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  userList: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 20,
  },
  userCard: {
    marginBottom: 16,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardGradient: {
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatarGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  phoneText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  feedbackText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginLeft: 6,
    flex: 1,
  },
  cardActions: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.2)',
  },
  assignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assignedText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '400',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
});