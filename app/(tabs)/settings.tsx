import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { CustomPopup } from '../../components/CustomPopup';
import { StatsCard } from '../../components/StatsCard';

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
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <LinearGradient
            colors={['#3b82f6', '#8b5cf6']}
            style={styles.headerIcon}
          >
            <Ionicons name="settings" size={28} color="white" />
          </LinearGradient>
          <Text style={[styles.title, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Settings</Text>
          <Text style={[styles.headerSubtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>Manage your account & preferences</Text>
        </View>

        <View style={styles.content}>
          {/* Profile Section */}
          {userInfo && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>PROFILE</Text>
              <View style={[
                styles.profileCard,
                { backgroundColor: isDark ? '#1e293b' : '#ffffff' }
              ]}>
                <LinearGradient
                  colors={['#3b82f6', '#8b5cf6']}
                  style={styles.profileAvatar}
                >
                  <Text style={styles.avatarText}>{userInfo.username?.charAt(0).toUpperCase()}</Text>
                </LinearGradient>
                <View style={styles.profileInfo}>
                  <Text style={[styles.profileName, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
                    {userInfo.username}
                  </Text>
                  <Text style={[styles.profileEmail, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                    {userInfo.email}
                  </Text>
                  <View style={[styles.roleBadge, { backgroundColor: isDark ? '#374151' : '#f3f4f6' }]}>
                    <Ionicons name="shield-checkmark" size={14} color={isDark ? '#60a5fa' : '#3b82f6'} />
                    <Text style={[styles.roleText, { color: isDark ? '#60a5fa' : '#3b82f6' }]}>
                      {userInfo.role || 'User'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.editButton, { backgroundColor: isDark ? '#374151' : '#f3f4f6' }]}
                  onPress={() => setShowUserDetails(true)}
                >
                  <Ionicons name="pencil" size={16} color={isDark ? '#94a3b8' : '#64748b'} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>ACCOUNT</Text>
            <View style={[styles.settingsGroup, { backgroundColor: isDark ? '#1e293b' : '#ffffff' }]}>
              <TouchableOpacity
                style={styles.settingRow}
                onPress={handleLogout}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIconContainer, { backgroundColor: '#ef4444' + '20' }]}>
                    <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                  </View>
                  <View>
                    <Text style={[styles.settingTitle, { color: '#ef4444' }]}>Sign Out</Text>
                    <Text style={[styles.settingSubtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>Sign out of your account</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={isDark ? '#64748b' : '#94a3b8'} />
              </TouchableOpacity>
            </View>
          </View>

          {userInfo?.role?.toUpperCase() === 'CUSTOMER_SUPPORT' && (
            <StatsCard isDark={isDark} />
          )}
        </View>
      </ScrollView>

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
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileAvatar: {
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
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsGroup: {
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
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