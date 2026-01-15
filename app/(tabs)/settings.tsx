import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CustomPopup } from '../../components/CustomPopup';

export default function SettingsScreen() {
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const storedUserInfo = await AsyncStorage.getItem('userInfo');
      if (storedUserInfo) {
        setUserInfo(JSON.parse(storedUserInfo));
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const handleLogout = () => {
    setShowLogoutPopup(true);
  };

  const confirmLogout = async () => {
    try {
      // Clear all AsyncStorage data
      await AsyncStorage.clear();
      console.log('All data cleared from AsyncStorage');
      setShowLogoutPopup(false);
      router.replace('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <LinearGradient
      colors={isDark ? ['#0f172a', '#1e293b', '#334155'] as const : ['#f0f9ff', '#e0f2fe', '#f8fafc'] as const}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Settings</Text>
      </View>

      <View style={styles.content}>
        {userInfo && (
          <View style={[
            styles.userInfoCard,
            { backgroundColor: isDark ? '#1e293b' : '#ffffff' }
          ]}>
            <View style={styles.userInfoHeader}>
              <Ionicons name="person-circle" size={40} color={isDark ? '#60a5fa' : '#3b82f6'} />
              <View style={styles.userDetails}>
                <Text style={[styles.userName, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
                  {userInfo.username}
                </Text>
                <Text style={[styles.userEmail, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                  {userInfo.email}
                </Text>
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.settingItem,
            { backgroundColor: isDark ? '#1e293b' : '#ffffff' }
          ]}
          onPress={() => setShowUserDetails(true)}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="person-outline" size={24} color={isDark ? '#60a5fa' : '#3b82f6'} />
            <Text style={[styles.settingText, { color: isDark ? '#f8fafc' : '#0f172a' }]}>User Details</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={isDark ? '#94a3b8' : '#64748b'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.settingItem,
            { backgroundColor: isDark ? '#1e293b' : '#ffffff' }
          ]}
          onPress={handleLogout}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
            <Text style={[styles.settingText, { color: '#ef4444' }]}>Logout</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={isDark ? '#94a3b8' : '#64748b'} />
        </TouchableOpacity>
      </View>

      <CustomPopup
        visible={showLogoutPopup}
        title="Logout"
        message="Are you sure you want to logout?"
        type="warning"
        buttons={[
          {
            text: 'Cancel',
            onPress: () => setShowLogoutPopup(false),
            style: 'cancel'
          },
          {
            text: 'Logout',
            onPress: confirmLogout,
            style: 'destructive'
          }
        ]}
        onClose={() => setShowLogoutPopup(false)}
      />

      <CustomPopup
        visible={showUserDetails}
        title="My Details"
        message=""
        type="info"
        buttons={[
          {
            text: 'Close',
            onPress: () => setShowUserDetails(false),
            style: 'cancel'
          }
        ]}
        onClose={() => setShowUserDetails(false)}
      >
        {userInfo && (
          <View style={styles.detailsContainer}>
            <LinearGradient
              colors={isDark ? ['#334155', '#475569'] : ['#dbeafe', '#bfdbfe']}
              style={styles.avatarCircle}
            >
              <Text style={styles.avatarLetter}>{userInfo.username?.charAt(0).toUpperCase()}</Text>
            </LinearGradient>
            
            <View style={[styles.infoRow, { borderBottomColor: isDark ? '#475569' : '#e5e7eb' }]}>
              <View style={styles.iconWrapper}>
                <Ionicons name="person" size={20} color={isDark ? '#60a5fa' : '#3b82f6'} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: isDark ? '#94a3b8' : '#6b7280' }]}>Username</Text>
                <Text style={[styles.infoValue, { color: isDark ? '#f8fafc' : '#0f172a' }]}>{userInfo.username}</Text>
              </View>
            </View>

            <View style={[styles.infoRow, { borderBottomColor: isDark ? '#475569' : '#e5e7eb' }]}>
              <View style={styles.iconWrapper}>
                <Ionicons name="mail" size={20} color={isDark ? '#60a5fa' : '#3b82f6'} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: isDark ? '#94a3b8' : '#6b7280' }]}>Email</Text>
                <Text style={[styles.infoValue, { color: isDark ? '#f8fafc' : '#0f172a' }]}>{userInfo.email}</Text>
              </View>
            </View>

            <View style={[styles.infoRow, { borderBottomColor: isDark ? '#475569' : '#e5e7eb' }]}>
              <View style={styles.iconWrapper}>
                <Ionicons name="id-card" size={20} color={isDark ? '#60a5fa' : '#3b82f6'} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: isDark ? '#94a3b8' : '#6b7280' }]}>Admin ID</Text>
                <Text style={[styles.infoValue, { color: isDark ? '#f8fafc' : '#0f172a' }]}>{userInfo.admin_id}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.iconWrapper}>
                <Ionicons name="shield-checkmark" size={20} color={isDark ? '#60a5fa' : '#3b82f6'} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: isDark ? '#94a3b8' : '#6b7280' }]}>Role</Text>
                <Text style={[styles.infoValue, { color: isDark ? '#f8fafc' : '#0f172a' }]}>{userInfo.role}</Text>
              </View>
            </View>
          </View>
        )}
      </CustomPopup>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  content: {
    paddingHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  userInfoCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarLetter: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  iconWrapper: {
    width: 40,
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
});