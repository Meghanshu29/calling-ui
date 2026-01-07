import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.clear();
            router.replace('/login');
          }
        }
      ]
    );
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
});