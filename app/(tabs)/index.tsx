import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";
import { Toast } from "../../components/Toast";
import { UserCard } from "../../components/UserCard";
import { FilterState, UserFilter } from "../../components/UserFilter";
import { useAuth } from "../../contexts/AuthContext";
import {
    GetUnregisterdUsers,
    getUnregisteredUsers,
    sendWhatsAppMessage,
    updateFeedback,
} from "../../endpoints/users";
import { useToast } from "../../hooks/useToast";

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

type TabType = "unregister user" | "matched_users" | "incomplete user";
type UserRole = "ADMIN" | "SUPER_ADMIN" | "CALL_AGENT" | "CUSTOMER_SUPPORT";

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("unregister user");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const setSelectedStatus = (status: string) => {
    console.log("🔄 setSelectedStatus called with:", status);
    console.trace("📍 Stack trace for setSelectedStatus");
    setSelectedStatusState(status);
  };
  const [selectedStatusState, setSelectedStatusState] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<FilterState>({});
  const [loading, setLoading] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<string>("ADMIN");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showPhoneSelection, setShowPhoneSelection] = useState(false);
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<string>("");
  const [availablePhoneNumbers, setAvailablePhoneNumbers] = useState<string[]>([]);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { toast, showSuccess, showError, hideToast } = useToast();
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const userInfo = await AsyncStorage.getItem("userInfo");
      console.log("DEBUG: Raw userInfo from storage:", userInfo);
      if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
        const username = parsedUser.username || parsedUser.email;
        const role = parsedUser.role || "CALL_AGENT";
        console.log("DEBUG: Parsed username:", username, "role:", role);
        setLoggedInUser(username);
        setUserRole(role);
      } else {
        console.log("DEBUG: No userInfo found, redirecting to login");
        router.replace('/login');
      }
    } catch (error) {
      console.error("DEBUG: Error loading user info:", error);
      router.replace('/login');
    }
  };

  const dynamicTabs: { key: TabType; label: string }[] = [
    { key: "unregister user", label: "Unregistered" },
    { key: "matched_users", label: "Matched User" },
    { key: "incomplete user", label: "Incomplete User" },
  ];

  if (userRole?.toUpperCase() === "ADMIN" || userRole?.toUpperCase() === "SUPER_ADMIN") {
    // Statistics moved to global tab
  }

  const getTabIcon = (tab: TabType) => {
    switch (tab) {
      case "unregister user":
        return "person-add";
      case "matched_users":
        return "heart";
      case "incomplete user":
        return "hourglass";
      default:
        return "ellipse";
    }
  };

  const getTabColor = (tab: TabType) => {
    switch (tab) {
      case "unregister user":
        return "#2563eb"; // Royal Blue
      case "matched_users":
        return "#e11d48"; // Rose Red
      case "incomplete user":
        return "#d97706"; // Warm Amber
      default:
        return "#2563eb";
    }
  };
  const fetchUsersByTab = async (tab: TabType) => {
      setLoading(true);
      setUsers([]);
      setCurrentUser(null);
      setOffset(0);
      setHasMore(true);
      try {
        let response;
        const isSuperAdmin = userRole?.toUpperCase() === "SUPER_ADMIN";
        const limit = isSuperAdmin ? 50 : 1;
        const fetchForUser = isSuperAdmin ? undefined : loggedInUser;
        console.log("DEBUG: Fetching with limit:", limit, "for user:", fetchForUser);

        switch (tab) {
          case "unregister user":
            response = await getUnregisteredUsers(
              activeTab,
              "pending",
              fetchForUser,
              undefined,
              undefined,
              limit,
              !isSuperAdmin,
              loggedInUser,
              0
            );
            break;

          case "matched_users":
            response = await getUnregisteredUsers(
              activeTab,
              "pending",
              fetchForUser,
              undefined,
              undefined,
              limit,
              !isSuperAdmin,
              loggedInUser,
              0
            );
            break;

          case "incomplete user":
            response = await getUnregisteredUsers(
              activeTab,
              "pending",
              fetchForUser,
              undefined,
              undefined,
              limit,
              !isSuperAdmin,
              loggedInUser,
              0
            );

            break;

          default:
            return;
        }
        console.log("Response Users=>", response);
        if (response?.users?.length) {
          setUsers(response.users);
          if (userRole?.toUpperCase() !== "SUPER_ADMIN") {
            setCurrentUser(response.users[0]);
          }
          setOffset(response.users.length);
          setHasMore(response.users.length === limit);
        } else {
          setUsers([]);
          setCurrentUser(null);
          setHasMore(false);
        }

    } catch (error) {
      console.error("Error fetching user:", error);
      showError("Failed to load contact");
    } finally {
      setLoading(false);
    }
  };
  const loadMoreUsers = async () => {
    if (loadingMore || !hasMore || userRole?.toUpperCase() !== "SUPER_ADMIN") return;

    setLoadingMore(true);
    console.log("DEBUG: loadMoreUsers called, offset:", offset);
    try {
      const limit = 50;
      const response = await getUnregisteredUsers(
        activeTab,
        "pending",
        undefined,
        undefined,
        undefined,
        limit,
        false,
        loggedInUser,
        offset
      );

      if (response?.users?.length) {
        setUsers(prev => {
          const newUsers = response.users.filter(
            (newUser: User) => !prev.some(oldUser => oldUser.id === newUser.id)
          );
          return [...prev, ...newUsers];
        });
        setOffset(prev => prev + response.users.length);
        setHasMore(response.users.length === limit);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more users:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (loggedInUser && activeTab && userRole) {
      console.log("DEBUG: useEffect triggering fetchUsersByTab for role:", userRole);
      fetchUsersByTab(activeTab);
    }
  }, [loggedInUser, activeTab, userRole]);


  const handleSubmitFeedback = () => {
    console.log("🔍 handleSubmitFeedback called with selectedStatus:", selectedStatusState);
    
    if (!selectedStatusState) {
      console.log("❌ No status selected, showing error");
      showError("Please select a call status before proceeding");
      return;
    }
    
    console.log("✅ Status validated:", selectedStatusState);
    
    // Check if multiple phone numbers exist
    if (currentUser?.mobile_no) {
      const phoneNumbers = String(currentUser.mobile_no)
        .split(",")
        .map((phone) => phone.trim())
        .filter((phone) => phone);
      
      const uniquePhoneNumbers = Array.from(new Set(phoneNumbers));
      console.log("📞 Phone numbers found:", uniquePhoneNumbers);
      
      if (uniquePhoneNumbers.length > 1) {
        console.log("📱 Multiple numbers, showing phone selection");
        // Show phone selection modal
        setAvailablePhoneNumbers(uniquePhoneNumbers);
        setShowPhoneSelection(true);
        return;
      } else if (uniquePhoneNumbers.length === 1) {
        console.log("📱 Single number, auto-selecting:", uniquePhoneNumbers[0]);
        setSelectedPhoneNumber(uniquePhoneNumbers[0]);
      }
    }
    
    console.log("📝 Opening feedback modal with status:", selectedStatusState);
    setShowFeedbackModal(true);
  };
  const handleSkipFeedback = async () => {
    if (!selectedStatusState) {
      showError("Please select a call status before proceeding");
      return;
    }
    
    try {
      if (currentUser) {
        await updateFeedback(
          currentUser.id,
          selectedStatusState,
          "Auto-skipped for " + selectedStatusState,
        );
      }
      
      showSuccess("Status saved successfully!");
      setSelectedStatus("");
      setLoadingNext(true);
      
      const isSuperAdmin = userRole?.toUpperCase() === "SUPER_ADMIN";
      const response = await getUnregisteredUsers(
        activeTab,
        "pending",
        isSuperAdmin ? undefined : loggedInUser,
        undefined,
        undefined,
        isSuperAdmin ? 50 : 1,
        !isSuperAdmin,
        loggedInUser
      );
      if (response?.users?.length) {
        setUsers(response.users);
        if (userRole?.toUpperCase() !== "SUPER_ADMIN") {
          setCurrentUser(response.users[0]);
        } else {
          setCurrentUser(null);
        }
      } else {
        setUsers([]);
        setCurrentUser(null);
      }
      
      setLoadingNext(false);
    } catch (error) {
      console.error("Error updating feedback:", error);
      showError("Failed to save feedback. Please try again.");
    }
  };
  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) {
      showError("Please enter feedback before proceeding");
      return;
    }

    if (!currentUser) {
      showError("No user selected");
      return;
    }

    if (!selectedStatusState) {
      showError("No status selected");
      return;
    }

    setSubmittingFeedback(true);
    try {
      console.log("Submitting feedback with:", {
        userId: currentUser.id,
        status: selectedStatusState,
        feedback: feedback,
        priority: currentUser.priority,
        selectedPhone: selectedPhoneNumber,
      });

      // 1️⃣ Call Feedback API
      await updateFeedback(
        currentUser.id,
        selectedStatusState,
        feedback,
        currentUser.priority,
      );
      console.log("✅ Feedback API called successfully");

      // 2️⃣ Send WhatsApp message for Interested/Not Interested status
      if (
        selectedStatusState === "Interested" ||
        selectedStatusState === "Not Interested"
      ) {
        const isInterested = selectedStatusState === "Interested" ? 1 : 0;

        if (selectedPhoneNumber) {
          const messageData = {
            phone_number: selectedPhoneNumber,
            name: currentUser.name,
            is_interested: isInterested,
          };

          await sendWhatsAppMessage(messageData);
          console.log(
            `✅ WhatsApp sent to ${selectedPhoneNumber} for status: ${selectedStatusState}`,
          );
        }
      }

      setFeedback("");
      setSelectedPhoneNumber("");
      setShowFeedbackModal(false);
      showSuccess("Status saved successfully!");
      // Reset status only after successful completion
      setSelectedStatus("");
      setLoadingNext(true);
      
      const isSuperAdmin = userRole?.toUpperCase() === "SUPER_ADMIN";
      const nextResponse = await getUnregisteredUsers(
        activeTab,
        "pending",
        isSuperAdmin ? undefined : loggedInUser,
        undefined,
        undefined,
        isSuperAdmin ? 50 : 1,
        !isSuperAdmin,
        loggedInUser
      );
      if (nextResponse?.users?.length) {
        setUsers(nextResponse.users);
        if (!isSuperAdmin) {
          setCurrentUser(nextResponse.users[0]);
        } else {
          setCurrentUser(null);
        }
      } else {
        setUsers([]);
        setCurrentUser(null);
      }
      setLoadingNext(false);
    } catch (error) {
      console.log("Error updating feedback:", error);
      console.error("Error updating feedback:", error);
      showError("Failed to save feedback. Please try again.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleFetchAllUsers = async () => {
    setFetchingUsers(true);
    try {
      const isSuperAdmin = userRole?.toUpperCase() === "SUPER_ADMIN";
      const response = await GetUnregisterdUsers({
        tag: activeTab,
        status: "pending",
        state: filters.state || undefined,
        city: filters.city || undefined,
        assigned_to: isSuperAdmin ? undefined : loggedInUser,
        auto_assign: !isSuperAdmin,
        current_user: loggedInUser,
        limit: isSuperAdmin ? 50 : 1,
        offset: 0,
      });
      console.log("Fetched users:", response);
      if (response?.users?.length) {
        setUsers(response.users);
        if (userRole?.toUpperCase() !== "SUPER_ADMIN") {
          setCurrentUser(response.users[0]);
        } else {
          setCurrentUser(null);
        }
      } else {
        setUsers([]);
        setCurrentUser(null);
      }
      showSuccess(`Fetched ${response.users?.length || 0} users`);
    } catch (error: any) {
      showError(error.message || "Failed to fetch users");
    } finally {
      setFetchingUsers(false);
    }
  };

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    const hasFilters = newFilters.state || newFilters.city || newFilters.status;
    showSuccess(
      hasFilters ? "Filters applied" : "No filters - using default API call",
    );
  };
  console.log("DEBUG: Rendering HomeScreen", { 
    activeTab, 
    userRole, 
    usersCount: users.length, 
    loading, 
    currentUser: currentUser ? currentUser.name : 'NULL'
  });

  return (
    <LinearGradient
      colors={
        isDark
          ? (["#1e293b", "#334155", "#475569"] as const) // Lighter Slate/Gunmetal
          : (["#ffffff", "#f8fafc", "#f1f5f9"] as const) // Pure White/Snow
      }
      style={styles.container}
    >
      <View style={[
        styles.dashboardCard,
        { backgroundColor: isDark ? "#1e293b" : "#ffffff", shadowColor: isDark ? "#000" : "#cbd5e1" }
      ]}>
        <View style={styles.titleSection}>
          <LinearGradient
            colors={["#3b82f6", "#8b5cf6"]}
            style={styles.titleIcon}
          >
            <Ionicons name="call" size={20} color="#ffffff" />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text
              style={[styles.title, { color: isDark ? "#f8fafc" : "#0f172a" }]}
            >
              {userRole?.toUpperCase() === "SUPER_ADMIN" ? "Super Admin Dashboard" : "Calling Dashboard"}
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: isDark ? "#94a3b8" : "#64748b" },
              ]}
            >
              {currentUser
                ? `Current: ${activeTab.replace("_", " ")}`
                : "No active user"}
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

        <View style={[
          styles.buttonRow,
          { 
            backgroundColor: isDark ? "#0f172a" : "#f1f5f9",
            shadowColor: "transparent",
            borderWidth: 1,
            borderColor: isDark ? "#334155" : "#e2e8f0",
            marginTop: 12,
          }
        ]}>
          <TouchableOpacity
            style={styles.actionSegment}
            onPress={() => setShowFilter(true)}
          >
            <Ionicons name="filter" size={16} color={isDark ? "#94a3b8" : "#64748b"} />
            <Text style={[styles.actionText, { color: isDark ? "#f8fafc" : "#0f172a" }]}>Filter</Text>
          </TouchableOpacity>

          <View style={[styles.verticalDivider, { backgroundColor: isDark ? "#334155" : "#e2e8f0" }]} />

          <TouchableOpacity
            style={styles.actionSegment}
            onPress={handleFetchAllUsers}
            disabled={fetchingUsers}
          >
            {fetchingUsers ? (
              <ActivityIndicator size="small" color={getTabColor(activeTab)} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={16} color={getTabColor(activeTab)} />
                <Text style={[styles.actionText, { color: getTabColor(activeTab) }]}>Apply Filter</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ marginBottom: 12 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContainer}
        >
          {dynamicTabs.map((tab) => {
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
                        ? "#1e293b"
                        : "#ffffff",
                    borderColor: isActive ? tabColor : (isDark ? "#334155" : "#e2e8f0"),
                    borderWidth: 1,
                    shadowColor: isActive ? tabColor : "#64748b",
                    shadowOpacity: isActive ? 0.2 : 0.05,
                    shadowRadius: 4,
                    elevation: isActive ? 3 : 1,
                  },
                ]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={getTabIcon(tab.key) as any}
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
      </View>

        {loadingNext && (
          <View
            style={[
              styles.progressContainer,
              { backgroundColor: getTabColor(activeTab) + "20" },
            ]}
          >
            <ActivityIndicator size="small" color={getTabColor(activeTab)} />
            <Text style={[styles.progress, { color: getTabColor(activeTab) }]}>
              Loading next contact...
            </Text>
          </View>
        )}
        {loggedInUser && userRole?.toUpperCase() === "SUPER_ADMIN" && currentUser && (
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: getTabColor(activeTab) + '20' }]}
            onPress={() => setCurrentUser(null)}
          >
            <Ionicons name="arrow-back" size={20} color={getTabColor(activeTab)} />
            <Text style={{ color: getTabColor(activeTab), fontWeight: '600', marginLeft: 8 }}>Back to List</Text>
          </TouchableOpacity>
        )}

      {userRole?.toUpperCase() === "SUPER_ADMIN" && !currentUser ? (
        <FlatList
          data={users}
          keyExtractor={(item: User) => item.id.toString()}
          style={styles.listContainer}
          renderItem={({ item: user }: { item: User }) => (
            <TouchableOpacity 
              key={user.id} 
              style={[
                styles.userListItem, 
                { 
                  backgroundColor: isDark ? "#1e293b" : "#ffffff",
                  borderColor: isDark ? "#334155" : "#e2e8f0",
                  shadowColor: getTabColor(activeTab), // Colored shadow glow
                }
              ]}
              onPress={() => {
                setCurrentUser(user);
              }}
            >
              <View style={styles.userListInfo}>
                <Text style={[styles.listUserName, { color: isDark ? "#f8fafc" : "#0f172a" }]}>{user.name}</Text>
                <Text style={{ color: isDark ? "#94a3b8" : "#64748b", marginBottom: 6 }}>{user.mobile_no || 'No number'}</Text>
                <View style={styles.badgeRow}>
                  <View style={[styles.tagBadge, { backgroundColor: getTabColor(activeTab) + '20' }]}>
                    <Text style={{ color: getTabColor(activeTab), fontSize: 11, fontWeight: '700' }}>{user.status?.toUpperCase() || 'PENDING'}</Text>
                  </View>
                  {user.assigned_to && (
                    <View style={[styles.assignedBadge, { backgroundColor: isDark ? '#334155' : '#f1f5f9' }]}>
                      <Ionicons name="person" size={10} color={isDark ? '#94a3b8' : '#64748b'} />
                      <Text style={[styles.assignedBadgeText, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
                        {user.assigned_to}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={isDark ? "#475569" : "#cbd5e1"} />
            </TouchableOpacity>
          )}
          onEndReached={loadMoreUsers}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => (
            loadingMore ? (
              <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size="small" color={getTabColor(activeTab)} />
              </View>
            ) : null
          )}
          ListEmptyComponent={() => (
            !loading && (
              <View style={styles.emptyContainer}>
                <Text style={{ color: isDark ? "#94a3b8" : "#64748b" }}>No users to display</Text>
              </View>
            )
          )}
        />

      ) : (
        !loading && currentUser && (
          <UserCard
            user={currentUser}
            onSubmit={handleSubmitFeedback}
            onSkip={handleSkipFeedback}
            isDark={isDark}
            selectedStatus={selectedStatusState}
            onStatusChange={setSelectedStatus}
            isFirstUser={true}
            isLastUser={false}
            onFetchUsers={handleFetchAllUsers}
            onOpenFilters={() => setShowFilter(true)}
            isSuperAdmin={userRole?.toUpperCase() === "SUPER_ADMIN"}
          />
        )
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <LinearGradient
            colors={[
              getTabColor(activeTab) + "20",
              getTabColor(activeTab) + "10",
            ]}
            style={styles.loadingCard}
          >
            <ActivityIndicator size="large" color={getTabColor(activeTab)} />
            <Text
              style={[
                styles.loadingText,
                { color: isDark ? "#94a3b8" : "#64748b" },
              ]}
            >
              Loading contacts...
            </Text>
          </LinearGradient>
        </View>
      )}

      {!loading && !currentUser && userRole?.toUpperCase() !== "SUPER_ADMIN" && (
        <View style={styles.emptyContainer}>
          <LinearGradient
            colors={[
              getTabColor(activeTab) + "20",
              getTabColor(activeTab) + "10",
            ]}
            style={styles.emptyCard}
          >
            <Ionicons
              name={getTabIcon(activeTab) as any}
              size={48}
              color={getTabColor(activeTab)}
            />
            <Text
              style={[
                styles.emptyTitle,
                { color: isDark ? "#f8fafc" : "#0f172a" },
              ]}
            >
              No Contacts Found
            </Text>
            <Text
              style={[
                styles.emptyText,
                { color: isDark ? "#94a3b8" : "#64748b" },
              ]}
            >
              No {activeTab.replace("_", " ")} contacts available at the moment
            </Text>
          </LinearGradient>
        </View>
      )}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
      <Modal visible={showFeedbackModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={isDark ? ["#1e293b", "#334155"] : ["#ffffff", "#f8fafc"]}
            style={styles.feedbackModal}
          >
            <Text
              style={[
                styles.modalTitle,
                { color: isDark ? "#f8fafc" : "#0f172a" },
              ]}
            >
              📝 Add Feedback - {selectedStatusState}
            </Text>
            <TextInput
              style={[
                styles.feedbackInput,
                {
                  backgroundColor: isDark ? "#475569" : "#ffffff",
                  borderColor: isDark ? "#64748b" : "#e2e8f0",
                  color: isDark ? "#f8fafc" : "#0f172a",
                },
              ]}
              placeholder={`Enter feedback for ${selectedStatusState} status...`}
              placeholderTextColor={isDark ? "#94a3b8" : "#64748b"}
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
                  colors={["#3b82f6", "#1d4ed8"]}
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

      {/* Phone Selection Modal */}
      <Modal visible={showPhoneSelection} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={isDark ? ["#1e293b", "#334155"] : ["#ffffff", "#f8fafc"]}
            style={styles.phoneSelectionModal}
          >
            <Text
              style={[
                styles.modalTitle,
                { color: isDark ? "#f8fafc" : "#0f172a" },
              ]}
            >
              📞 Select Phone Number
            </Text>
            <Text
              style={[
                styles.phoneSelectionSubtitle,
                { color: isDark ? "#94a3b8" : "#64748b" },
              ]}
            >
              Which number did you call?
            </Text>
            
            {availablePhoneNumbers.map((phone, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.phoneOption,
                  {
                    backgroundColor: isDark ? "#475569" : "#f1f5f9",
                    borderColor: isDark ? "#64748b" : "#e2e8f0",
                  },
                ]}
                onPress={() => {
                  setSelectedPhoneNumber(phone);
                  setShowPhoneSelection(false);
                  setShowFeedbackModal(true);
                }}
              >
                <Ionicons name="call" size={20} color={getTabColor(activeTab)} />
                <Text
                  style={[
                    styles.phoneOptionText,
                    { color: isDark ? "#f8fafc" : "#0f172a" },
                  ]}
                >
                  {phone}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={isDark ? "#94a3b8" : "#64748b"} />
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowPhoneSelection(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>

      <UserFilter
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
        isDark={isDark}
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
    marginBottom: 12,
  },
  titleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 1,
  },
  dashboardCard: {
    margin: 12,
    borderRadius: 20,
    padding: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 16,
  },
  tabScrollContainer: {
    paddingHorizontal: 16, // Added padding since it's now full width
    gap: 8,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 12,
    marginHorizontal: 16, // Added margin to match card
    gap: 12,
  },
  progress: {
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingCard: {
    padding: 40,
    borderRadius: 20,
    alignItems: "center",
    minWidth: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyCard: {
    padding: 40,
    borderRadius: 20,
    alignItems: "center",
    minWidth: 250,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  feedbackModal: {
    width: "100%",
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
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
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#6b7280",
  },
  submitButton: {
    flexDirection: "row",
    gap: 8,
  },
  submitButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  phoneSelectionModal: {
    width: "100%",
    borderRadius: 16,
    padding: 24,
    maxHeight: "80%",
  },
  phoneSelectionSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  phoneOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  phoneOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  fetchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 100,
    flex: 1,
    gap: 6,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  fetchButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 0, // Removed margin inside the card
    marginTop: 12,
    borderRadius: 100,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  actionSegment: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 6,
    borderRadius: 100,
  },
  verticalDivider: {
    width: 1,
    height: "60%",
    marginHorizontal: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 100,
    gap: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  iconContainer: {
    borderRadius: 8,
    padding: 6,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    marginHorizontal: 16, // Added margin to match card
  },
  statisticsContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  statsCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statsTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  statsText: {
    fontSize: 16,
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userListInfo: {
    flex: 1,
  },
  listUserName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  tagBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  assignedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  assignedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
