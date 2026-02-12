import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Animated,
  FlatList,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { sendWhatsAppMessage, updateUserInstructionAndAssignment } from "../endpoints/users";
import { MatchDetailsModal } from "./MatchDetailsModal";
import { QuickActions } from "./QuickActions";
import { SmartStatusSelector } from "./SmartStatusSelector";

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
  priority?: string;
}

interface UserCardProps {
  user: User | null;
  onSubmit: () => void;
  onSkip: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  isDark: boolean;
  isLastUser: boolean;
  isFirstUser: boolean;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  onFetchUsers?: () => void;
  onOpenFilters?: () => void;
  isSuperAdmin?: boolean;
}

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

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onSubmit,
  onSkip,
  onNext,
  onPrevious,
  isDark,
  isLastUser,
  isFirstUser,
  selectedStatus,
  onStatusChange,
  onFetchUsers,
  onOpenFilters,
  isSuperAdmin = false,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMatchDetails, setShowMatchDetails] = useState(false);
  const [showPhoneSelection, setShowPhoneSelection] = useState(false);
  const [pendingWhatsAppData, setPendingWhatsAppData] = useState<{
    isInterested: number;
  } | null>(null);
  const [slideAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  const borderAnimation = new Animated.Value(0);
  const [editableInstruction, setEditableInstruction] = useState('');
  const [updatingInstruction, setUpdatingInstruction] = useState(false);

  useEffect(() => {
    if (user) {
      setEditableInstruction(user.instruction || '');
    }
  }, [user]);

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(borderAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(borderAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ]).start(() => animate());
    };
    animate();

    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, []);

  const animateSlide = async () => {
    console.log("🔍 UserCard animateSlide called with selectedStatus:", selectedStatus);

    // Validate that status is selected
    if (!selectedStatus) {
      console.warn("❌ UserCard: Status not selected, cannot proceed");
      // Don't return early - let the parent component handle the validation
      // return;
    } else {
      console.log("✅ UserCard: Status validated:", selectedStatus);
    }

    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      slideAnim.setValue(0);
    });

    // For all statuses, show feedback modal to get customer support feedback
    console.log(`📝 UserCard: Calling onSubmit with status: ${selectedStatus}`);
    onSubmit();

    if (onNext) {
      onNext();
    }
  };

  const sendWhatsAppToNumber = async (
    phoneNumber: string,
    isInterested: number,
  ) => {
    try {
      const messageData = {
        phone_number: phoneNumber,
        name: user?.name || 'Unknown User',
        is_interested: isInterested,
        feedback: user?.feedback || '',
      };

      await sendWhatsAppMessage(messageData);
      console.log(`WhatsApp message sent to ${phoneNumber}`);
    } catch (error) {
      console.error(
        `Failed to send WhatsApp message to ${phoneNumber}:`,
        error,
      );
    }
  };

  const handlePhoneSelection = async (selectedPhone: string) => {
    if (pendingWhatsAppData) {
      await sendWhatsAppToNumber(
        selectedPhone,
        pendingWhatsAppData.isInterested,
      );
      setPendingWhatsAppData(null);
    }
  };

  const handleUpdateInstruction = async () => {
    if (!user) return;

    if (!editableInstruction.trim()) {
      alert('Please enter an instruction');
      return;
    }

    const payload = {
      user_id: user.id,
      instruction: editableInstruction,
      assigned_to: user.assigned_to
    };

    console.log('🔵 Update Instruction Payload:', JSON.stringify(payload, null, 2));

    setUpdatingInstruction(true);
    try {
      await updateUserInstructionAndAssignment(
        user.id,
        editableInstruction,
        user.assigned_to
      );
      console.log('✅ Instruction updated successfully!');
      alert('Instruction updated successfully!');
    } catch (error) {
      console.error('❌ Error updating instruction:', error);
      alert('Failed to update instruction');
    } finally {
      setUpdatingInstruction(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return { background: "#dbeafe", border: "#3b82f6", text: "#1e40af" };
      case "registered":
        return { background: "#dcfce7", border: "#22c55e", text: "#15803d" };
      case "called":
        return { background: "#fef3c7", border: "#f59e0b", text: "#92400e" };
      case "not registered":
        return { background: "#fee2e2", border: "#ef4444", text: "#dc2626" };
      case "matchmaking":
        return { background: "#fdf4ff", border: "#c084fc", text: "#7c3aed" };
      default:
        return { background: "#f1f5f9", border: "#64748b", text: "#475569" };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return "New";
      case "registered":
        return "Registered";
      case "called":
        return "Called";
      case "not registered":
        return "Not Registered";
      case "matchmaking":
        return "Matchmaking";
      default:
        return status;
    }
  };

  const handleStatusSelect = (status: string) => {
    onStatusChange(status);
    setShowDropdown(false);
  };

  if (!user) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      {/* Quick Actions */}
      <QuickActions
        isDark={isDark}
        currentUser={user}
        onFetchUsers={onFetchUsers || (() => { })}
        onOpenFilters={onOpenFilters || (() => { })}
      />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View
          style={[
            styles.userCard,
            {
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              borderColor: isDark ? "#334155" : "#e2e8f0",
              borderWidth: 1,
            }
          ]}
        >
          <Animated.View
            style={[
              styles.statusChip,
              {
                backgroundColor: getStatusColor(user.tag || "matchmaking")
                  .background,
                borderColor: borderAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [
                    getStatusColor(user.tag || "matchmaking").border,
                    "#8c24fbff",
                  ],
                }),
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(user.tag || "matchmaking").text },
              ]}
            >
              {getStatusLabel(user.tag || "matchmaking")}
            </Text>
          </Animated.View>

          <View style={styles.userHeader}>
            <LinearGradient
              colors={["#3b82f6", "#8b5cf6"] as const}
              style={styles.avatarContainer}
            >
              <Text style={styles.avatarText}>
                {user.name?.charAt(0).toUpperCase() || '?'}
              </Text>
            </LinearGradient>
            <View style={styles.userInfo}>
              <Text
                style={[
                  styles.userName,
                  { color: isDark ? "#f8fafc" : "#0f172a" },
                ]}
              >
                {user.name || 'Unknown User'}
              </Text>
              <View>
                {user.mobile_no ? (
                  Array.from(
                    new Set(
                      String(user.mobile_no)
                        .split(",")
                        .map((phone) => phone.trim())
                        .filter((phone) => phone),
                    ),
                  ).map((phone, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.phoneContainer}
                      onPress={() => Linking.openURL(`tel:${phone}`)}
                    >
                      <Ionicons
                        name="call"
                        size={16}
                        color={isDark ? "#60a5fa" : "#3b82f6"}
                      />
                      <Text
                        style={[
                          styles.userPhone,
                          { color: isDark ? "#94a3b8" : "#64748b" },
                        ]}
                      >
                        {phone}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text
                    style={[
                      styles.userPhone,
                      { color: isDark ? "#94a3b8" : "#64748b" },
                    ]}
                  >
                    No phone number
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View
            style={[
              styles.instructionCard,
              {
                backgroundColor: isDark ? "#334155" : "#f0f9ff",
                borderColor: isDark ? "#475569" : "#dbeafe",
              },
            ]}
          >
            <View style={styles.instructionTitleRow}>
              <Ionicons
                name="clipboard-outline"
                size={16}
                color={isDark ? "#ffffff" : "#3b82f6"}
              />
              <Text
                style={[
                  styles.instructionTitle,
                  { color: isDark ? "#60a5fa" : "#3b82f6" },
                ]}
              >
                Call Instructions
              </Text>
            </View>

            {user.tag === "matched_users" ? (
              <Text
                style={[
                  styles.instructionText,
                  { color: isDark ? "#e2e8f0" : "#374151" },
                ]}
              >
                Click 'User Details' to view matches
              </Text>
            ) : isSuperAdmin ? (
              <>
                <TextInput
                  style={[
                    styles.instructionInput,
                    {
                      backgroundColor: isDark ? "#1e293b" : "#ffffff",
                      borderColor: isDark ? "#64748b" : "#bfdbfe",
                      color: isDark ? "#f8fafc" : "#0f172a",
                    }
                  ]}
                  placeholder="Enter call instructions..."
                  placeholderTextColor={isDark ? "#94a3b8" : "#64748b"}
                  value={editableInstruction}
                  onChangeText={setEditableInstruction}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
                <TouchableOpacity
                  style={[
                    styles.updateInstructionBtn,
                    {
                      backgroundColor: isDark ? "#3b82f6" : "#2563eb",
                      opacity: updatingInstruction ? 0.6 : 1,
                    }
                  ]}
                  onPress={handleUpdateInstruction}
                  disabled={updatingInstruction}
                >
                  <Ionicons name="checkmark-circle" size={16} color="#ffffff" />
                  <Text style={styles.updateInstructionText}>
                    {updatingInstruction ? "Updating..." : "Update Instruction"}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text
                style={[
                  styles.instructionText,
                  { color: isDark ? "#e2e8f0" : "#374151" },
                ]}
              >
                {user.instruction || "No specific instructions provided for this user."}
              </Text>
            )}
          </View>

          {user.tag === "matched_users" && (
            <TouchableOpacity
              style={[
                styles.detailsBtn,
                { backgroundColor: isDark ? "#475569" : "#e0f2fe" },
              ]}
              onPress={() => setShowMatchDetails(true)}
            >
              <Ionicons
                name="information-circle"
                size={20}
                color={isDark ? "#60a5fa" : "#3b82f6"}
              />
              <Text
                style={[
                  styles.detailsBtnText,
                  { color: isDark ? "#60a5fa" : "#3b82f6" },
                ]}
              >
                User Details
              </Text>
            </TouchableOpacity>
          )}

          {/* Smart Status Selector - Hidden for Super Admin */}
          {!isSuperAdmin && (
            <>
              <SmartStatusSelector
                selectedStatus={selectedStatus}
                onStatusChange={onStatusChange}
                isDark={isDark}
              />

              {/* More Options Button */}
              <TouchableOpacity
                style={[
                  styles.moreOptionsButton,
                  { backgroundColor: isDark ? "#475569" : "#f1f5f9" },
                ]}
                onPress={() => setShowDropdown(true)}
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={20}
                  color={isDark ? "#94a3b8" : "#64748b"}
                />
                <Text
                  style={[
                    styles.moreOptionsText,
                    { color: isDark ? "#94a3b8" : "#64748b" },
                  ]}
                >
                  All Options
                </Text>
              </TouchableOpacity>

              <View style={styles.navigationButtons}>
                {!isFirstUser && (
                  <TouchableOpacity
                    onPress={onPrevious}
                    style={styles.prevButtonContainer}
                  >
                    <LinearGradient
                      colors={["#6b7280", "#4b5563"] as const}
                      style={styles.prevButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Ionicons name="arrow-back" size={20} color="white" />
                      <Text style={styles.prevButtonText}>Previous</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={animateSlide}
                  style={[
                    styles.buttonContainer,
                    !isFirstUser && styles.nextButton,
                  ]}
                  disabled={!selectedStatus}
                >
                  <LinearGradient
                    colors={
                      selectedStatus
                        ? ["#3b82f6", "#1d4ed8"]
                        : isDark
                          ? ["#334155", "#1e293b"]
                          : ["#f1f5f9", "#e2e8f0"]
                    }
                    style={[
                      styles.submitButton,
                      !selectedStatus && { borderWidth: 1, borderColor: isDark ? "#475569" : "#cbd5e1" }
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Animated.Text style={[
                      styles.submitButtonText,
                      !selectedStatus && {
                        color: isDark ? "#94a3b8" : "#64748b",
                        opacity: pulseAnim
                      }
                    ]}>
                      {!selectedStatus
                        ? "🎯 Select Status First"
                        : isLastUser
                          ? "✅ Complete"
                          : "Next Person"}
                    </Animated.Text>
                    <Ionicons
                      name={isLastUser ? "checkmark-circle" : "arrow-forward"}
                      size={20}
                      color={selectedStatus ? "white" : (isDark ? "#94a3b8" : "#64748b")}
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <Modal visible={showDropdown} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowDropdown(false)}
        >
          <View
            style={[
              styles.dropdownModal,
              { backgroundColor: isDark ? "#1e293b" : "#ffffff" },
            ]}
          >
            <Text
              style={[
                styles.dropdownTitle,
                { color: isDark ? "#f8fafc" : "#0f172a" },
              ]}
            >
              All Status Options
            </Text>
            <FlatList
              data={statusOptions.sort((a, b) => a.localeCompare(b))}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.dropdownOption,
                    selectedStatus === item && {
                      backgroundColor: "#3b82f6" + "20",
                    },
                  ]}
                  onPress={() => handleStatusSelect(item)}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      { color: isDark ? "#f8fafc" : "#0f172a" },
                      selectedStatus === item && { fontWeight: "600" },
                    ]}
                  >
                    {item}
                  </Text>
                  {selectedStatus === item && (
                    <Ionicons name="checkmark" size={16} color="#3b82f6" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <MatchDetailsModal
        visible={showMatchDetails}
        onClose={() => setShowMatchDetails(false)}
        instruction={user.instruction}
        isDark={isDark}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  userCard: {
    position: "relative",
    padding: 24,
    borderRadius: 16,
    marginHorizontal: 4,
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
  },
  userInfo: {
    marginLeft: 20,
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: -0.5,
    marginTop: 10,
  },
  statusChip: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2.5,
    zIndex: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(59, 130, 246, 0.1)", // Light blue tint
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  userPhone: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },
  instructionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  instructionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  dropdownSection: {
    marginBottom: 24,
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  dropdownTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  dropdownText: {
    fontSize: 16,
  },
  navigationButtons: {
    flexDirection: "row",
    gap: 12,
  },
  prevButtonContainer: {
    flex: 1,
    shadowColor: "#6b7280",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  prevButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
  },
  prevButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  buttonContainer: {
    flex: 1,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButton: {
    flex: 1,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownModal: {
    width: "80%",
    borderRadius: 12,
    padding: 8,
    maxHeight: 300,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: "700",
    padding: 16,
    textAlign: "center",
  },
  dropdownOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  dropdownOptionText: {
    fontSize: 16,
  },
  moreOptionsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  moreOptionsText: {
    fontSize: 14,
    fontWeight: "500",
  },
  detailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  detailsBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },
  instructionInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    marginBottom: 12,
  },
  updateInstructionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  updateInstructionText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});
