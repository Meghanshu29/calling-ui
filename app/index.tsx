import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState<string>('/login');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userInfo = await AsyncStorage.getItem('userInfo');
      
      if (token && userInfo) {
        const parsedUser = JSON.parse(userInfo);
        if (parsedUser.role === 'SUPER_ADMIN') {
          setTarget('/super-admin');
        } else {
          setTarget('/(tabs)');
        }
      } else {
        setTarget('/login');
      }
    } catch (error) {
      setTarget('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return <Redirect href={target as any} />;
}
