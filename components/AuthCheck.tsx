import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface AuthCheckProps {
  children: React.ReactNode;
}

export const AuthCheck: React.FC<AuthCheckProps> = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuthToken();
  }, []);

  const checkAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userInfo = await AsyncStorage.getItem('userInfo');
      
      if (token && userInfo) {
        // Both token and user info exist, redirect to appropriate dashboard
        const parsedUser = JSON.parse(userInfo);
        if (parsedUser.role === 'SUPER_ADMIN') {
          router.replace('/super-admin');
        } else {
          router.replace('/(tabs)');
        }
      } else {
        // Missing auth data, stay on current screen
        setIsChecking(false);
      }
    } catch (error) {
      console.error('Error checking auth token:', error);
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});