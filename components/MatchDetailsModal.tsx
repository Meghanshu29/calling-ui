import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Match {
  name: string;
  score: number;
  gunn: number;
}

interface MatchDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  instruction: string;
  isDark: boolean;
}

const parseMatches = (instruction: string): { matches: Match[]; userId: string } => {
  const matches: Match[] = [];
  let userId = '';

  if (!instruction) return { matches, userId };

  const userIdMatch = instruction.match(/ID:\s*([^\s]+)/);
  if (userIdMatch) userId = userIdMatch[1];

  const matchPattern = /([^(,]+)\s*\(Score:(\d+),\s*Gunn:(\d+)\)/g;
  let match;
  while ((match = matchPattern.exec(instruction)) !== null) {
    matches.push({
      name: match[1].trim(),
      score: parseInt(match[2]),
      gunn: parseInt(match[3])
    });
  }

  return { matches, userId };
};

export const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({ visible, onClose, instruction, isDark }) => {
  const { matches, userId } = parseMatches(instruction);
  
  const sortedMatches = [...matches].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.gunn - a.gunn;
  });

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <LinearGradient
          colors={isDark ? ['#1e293b', '#334155'] : ['#ffffff', '#f8fafc']}
          style={styles.modal}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
              Match Details
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={isDark ? '#f8fafc' : '#0f172a'} />
            </TouchableOpacity>
          </View>

          {userId && (
            <View style={[styles.userIdCard, { backgroundColor: isDark ? '#475569' : '#e0f2fe' }]}>
              <Text style={[styles.userIdLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>User ID</Text>
              <Text style={[styles.userId, { color: isDark ? '#f8fafc' : '#0f172a' }]}>{userId}</Text>
            </View>
          )}

          <ScrollView style={styles.matchList}>
            {sortedMatches.map((match, index) => (
              <View key={index} style={[styles.matchCard, { backgroundColor: isDark ? '#334155' : '#f0f9ff' }]}>
                <Text style={[styles.matchName, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
                  {match.name}
                </Text>
                <View style={styles.scoreRow}>
                  <View style={styles.scoreItem}>
                    <Text style={[styles.scoreLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Score</Text>
                    <Text style={[styles.scoreValue, { color: '#3b82f6' }]}>{match.score}</Text>
                  </View>
                  <View style={styles.scoreItem}>
                    <Text style={[styles.scoreLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Gunn</Text>
                    <Text style={[styles.scoreValue, { color: '#8b5cf6' }]}>{match.gunn}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  userIdCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  userIdLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  userId: {
    fontSize: 16,
    fontWeight: '700',
  },
  matchList: {
    flex: 1,
  },
  matchCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  matchName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 24,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '700',
  },
});
