import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Animated,
  FlatList,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MatchDetailsModal } from "./MatchDetailsModal";

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
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMatchDetails, setShowMatchDetails] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));
  const borderAnimation = new Animated.Value(0);

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
  }, []);

  const animateSlide = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      slideAnim.setValue(0);
    });

    if (
      selectedStatus === "Interested" ||
      selectedStatus === "Busy Call Later"||
      selectedStatus === "Declined"||
      selectedStatus === "Not Serious"
    ) {
      onSkip();
    } else {
      onSubmit();
    }

    if (onNext) {
      onNext();
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

  const handlePhonePress = () => {
    if (user?.mobile_no) {
      Linking.openURL(`tel:${user.mobile_no}`);
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
      <LinearGradient
        colors={
          isDark
            ? (["#1e293b", "#334155"] as const)
            : (["#ffffff", "#f8fafc"] as const)
        }
        style={styles.userCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
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
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
          <View style={styles.userInfo}>
            <Text
              style={[
                styles.userName,
                { color: isDark ? "#f8fafc" : "#0f172a" },
              ]}
            >
              {user.name}
            </Text>
            <View>
              {user.mobile_no ? (
                String(user.mobile_no)
                  .split(",")
                  .map((phone, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.phoneContainer}
                      onPress={() => Linking.openURL(`tel:${phone.trim()}`)}
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
                        {phone.trim()}
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
          <Text
            style={[
              styles.instructionText,
              { color: isDark ? "#e2e8f0" : "#374151" },
            ]}
          >
            {user.tag === "matched_users"
              ? "Click 'User Details' to view matches"
              : user.instruction}
          </Text>
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

        <View style={styles.dropdownSection}>
          <View style={styles.dropdownTitleRow}>
            <Ionicons
              name="list-outline"
              size={16}
              color={isDark ? "#ffffff" : "#0f172a"}
            />
            <Text
              style={[
                styles.dropdownLabel,
                { color: isDark ? "#f8fafc" : "#0f172a" },
              ]}
            >
              Call Status
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.dropdown,
              {
                backgroundColor: isDark ? "#475569" : "#ffffff",
                borderColor: isDark ? "#64748b" : "#e2e8f0",
              },
            ]}
            onPress={() => setShowDropdown(true)}
          >
            <Text
              style={[
                styles.dropdownText,
                { color: isDark ? "#f8fafc" : "#0f172a" },
              ]}
            >
              {selectedStatus && selectedStatus !== "pending"
                ? selectedStatus
                : "Select status..."}
            </Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={isDark ? "#94a3b8" : "#64748b"}
            />
          </TouchableOpacity>
        </View>

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
            style={[styles.buttonContainer, !isFirstUser && styles.nextButton]}
          >
            <LinearGradient
              colors={["#3b82f6", "#1d4ed8"] as const}
              style={styles.submitButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.submitButtonText}>
                {isLastUser ? "✅ Complete Review" : "Next Person"}
              </Text>
              <Ionicons
                name={isLastUser ? "checkmark-circle" : "arrow-forward"}
                size={20}
                color="white"
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>

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
              <FlatList
                data={statusOptions.sort((a, b) => a.localeCompare(b))}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.dropdownOption}
                    onPress={() => handleStatusSelect(item)}
                  >
                    <Text
                      style={[
                        styles.dropdownOptionText,
                        { color: isDark ? "#f8fafc" : "#0f172a" },
                      ]}
                    >
                      {item}
                    </Text>
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
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  userCard: {
    position: "relative",
    padding: 28,
    borderRadius: 24,
    marginHorizontal: 4,
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
  },
  userPhone: {
    fontSize: 16,
    fontWeight: "500",
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
  dropdownOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  dropdownOptionText: {
    fontSize: 16,
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
});
