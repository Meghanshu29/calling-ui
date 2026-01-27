import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SmartStatusSelectorProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  isDark: boolean;
}

const QUICK_STATUSES = [
  { key: 'Interested', icon: 'checkmark-circle', color: '#059669', label: 'Interested' }, // Emerald Teal
  { key: 'Not Interested', icon: 'close-circle', color: '#64748b', label: 'Not Interested' }, // Slate Grey
  { key: 'Busy Call Later', icon: 'time', color: '#d97706', label: 'Call Later' }, // Warm Amber
  { key: 'Declined', icon: 'ban', color: '#e11d48', label: 'Declined' }, // Rose Red
];

export const SmartStatusSelector: React.FC<SmartStatusSelectorProps> = ({
  selectedStatus,
  onStatusChange,
  isDark,
}) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
        Quick Status
      </Text>
      <View style={styles.statusGrid}>
        {QUICK_STATUSES.map((status) => {
          const isSelected = selectedStatus === status.key;
          return (
            <TouchableOpacity
              key={status.key}
              style={[
                styles.statusButton,
                {
                  backgroundColor: isSelected ? status.color : (isDark ? '#334155' : '#f8fafc'),
                  borderColor: status.color,
                  borderWidth: isSelected ? 0 : 1.5, // Slightly thicker border for unselected
                  elevation: isSelected ? 4 : 0, // Pop effect
                  shadowColor: status.color,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isSelected ? 0.3 : 0,
                  shadowRadius: 4,
                },
              ]}
              onPress={() => onStatusChange(status.key)}
            >
              <Ionicons
                name={status.icon as any}
                size={18}
                color={isSelected ? 'white' : status.color}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: isSelected ? 'white' : (isDark ? '#f8fafc' : '#0f172a') },
                ]}
              >
                {status.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    paddingHorizontal: 8,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
});