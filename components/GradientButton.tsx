import React from 'react';
import { TouchableOpacity, Text, StyleSheet, useColorScheme, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

export const GradientButton = ({ onPress, children, disabled = false, loading = false }: GradientButtonProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getGradientColors = (): [string, string, string] => {
    if (disabled || loading) {
      return isDark ? ['#4b5563', '#374151', '#1f2937'] : ['#9ca3af', '#6b7280', '#4b5563'];
    }
    return isDark ? ['#4f46e5', '#7c3aed', '#a855f7'] : ['#3b82f6', '#1d4ed8', '#1e40af'];
  };

  const getShadowColor = () => {
    if (disabled || loading) return '#000000';
    return isDark ? '#4f46e5' : '#3b82f6';
  };

  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[
        styles.buttonContainer, 
        { shadowColor: getShadowColor() },
        (disabled || loading) && styles.buttonDisabled
      ]}
      disabled={disabled || loading}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1.5, y: 1.5 }}
        style={styles.gradientButton}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={[styles.buttonText, (disabled || loading) && styles.buttonTextDisabled]}>
            {children}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    shadowOpacity: 0.1,
  },
  gradientButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buttonTextDisabled: {
    color: '#d1d5db',
  },
});