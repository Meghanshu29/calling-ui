import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { getStatesAndCities } from '../endpoints/location';

interface UserFilterProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
  currentFilters: FilterState;
  isDark: boolean;
}

export interface FilterState {
  state?: string;
  city?: string;
  status?: string;
}

export const UserFilter: React.FC<UserFilterProps> = ({
  visible,
  onClose,
  onApplyFilters,
  currentFilters,
  isDark,
}) => {
  const [filters, setFilters] = useState<FilterState>(currentFilters);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [showStateList, setShowStateList] = useState(false);
  const [showCityList, setShowCityList] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');

  const statusOptions = [
    'pending',
    'Interested',
    'Not Interested',
    'Escalate to Sonia',
    'Declined',
    'Busy Call Later',
    'Married/Engaged',
    'Complete Soon',
    'Need Help completing',
    'Not Serious',
  ];

  useEffect(() => {
    if (visible) {
      fetchLocationData();
    }
  }, [visible]);

  const fetchLocationData = async () => {
    try {
      console.log('🔄 States & Cities API Request:', {
        method: 'GET',
        url: 'admin/states_and_city',
        headers: 'Authorization Bearer token included'
      });
      
      const response = await getStatesAndCities();
      
      console.log('✅ States & Cities API Response:', {
        success: response.success,
        statesCount: response.data?.states?.length || 0,
        citiesCount: response.data?.cities?.length || 0,
        states: response.data?.states,
        cities: response.data?.cities
      });
      
      setStates(response.data?.states || []);
      setCities(response.data?.cities || []);
    } catch (error: any) {
      console.error('❌ States & Cities API Error:', {
        error: error.message,
        stack: error.stack
      });
    }
  };

  const filteredStates = (states || []).filter(state =>
    state.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const filteredCities = (cities || []).filter(city =>
    city.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClear = () => {
    setFilters({});
    setStateSearch('');
    setCitySearch('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: isDark ? '#1e293b' : '#ffffff' }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
              Filter Users
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={isDark ? '#94a3b8' : '#64748b'} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* State Filter */}
            <View style={styles.filterSection}>
              <Text style={[styles.label, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                State
              </Text>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: isDark ? '#334155' : '#f8fafc',
                    borderColor: isDark ? '#475569' : '#e2e8f0',
                  },
                ]}
                onPress={() => setShowStateList(true)}
              >
                <Text style={[styles.filterText, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
                  {filters.state || 'All States'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              </TouchableOpacity>
            </View>

            {/* City Filter */}
            <View style={styles.filterSection}>
              <Text style={[styles.label, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                City
              </Text>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: isDark ? '#334155' : '#f8fafc',
                    borderColor: isDark ? '#475569' : '#e2e8f0',
                  },
                ]}
                onPress={() => setShowCityList(true)}
              >
                <Text style={[styles.filterText, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
                  {filters.city || 'All Cities'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.clearButton]}
              onPress={handleClear}
            >
              <Text style={styles.clearButtonText}>No Filter</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.applyButton]}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>

          {/* State List Modal */}
          <Modal visible={showStateList} transparent>
            <View style={styles.listOverlay}>
              <View style={[styles.listContainer, { backgroundColor: isDark ? '#1e293b' : '#ffffff' }]}>
                <View style={styles.listHeader}>
                  <Text style={[styles.listTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
                    Select State
                  </Text>
                  <TouchableOpacity onPress={() => setShowStateList(false)}>
                    <Ionicons name="close" size={24} color={isDark ? '#94a3b8' : '#64748b'} />
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={[
                    styles.searchInput,
                    {
                      backgroundColor: isDark ? '#334155' : '#f8fafc',
                      color: isDark ? '#f8fafc' : '#0f172a',
                    },
                  ]}
                  placeholder="Search states..."
                  placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                  value={stateSearch}
                  onChangeText={setStateSearch}
                />
                <FlatList
                  data={[{ name: 'All States', value: undefined }, ...filteredStates.map(s => ({ name: s, value: s }))]}
                  keyExtractor={(item) => item.name}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.listItem}
                      onPress={() => {
                        setFilters(prev => ({ ...prev, state: item.value }));
                        setShowStateList(false);
                        setStateSearch('');
                      }}
                    >
                      <Text style={[styles.listItemText, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </Modal>

          {/* City List Modal */}
          <Modal visible={showCityList} transparent>
            <View style={styles.listOverlay}>
              <View style={[styles.listContainer, { backgroundColor: isDark ? '#1e293b' : '#ffffff' }]}>
                <View style={styles.listHeader}>
                  <Text style={[styles.listTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
                    Select City
                  </Text>
                  <TouchableOpacity onPress={() => setShowCityList(false)}>
                    <Ionicons name="close" size={24} color={isDark ? '#94a3b8' : '#64748b'} />
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={[
                    styles.searchInput,
                    {
                      backgroundColor: isDark ? '#334155' : '#f8fafc',
                      color: isDark ? '#f8fafc' : '#0f172a',
                    },
                  ]}
                  placeholder="Search cities..."
                  placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                  value={citySearch}
                  onChangeText={setCitySearch}
                />
                <FlatList
                  data={[{ name: 'All Cities', value: undefined }, ...filteredCities.map(c => ({ name: c, value: c }))]}
                  keyExtractor={(item) => item.name}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.listItem}
                      onPress={() => {
                        setFilters(prev => ({ ...prev, city: item.value }));
                        setShowCityList(false);
                        setCitySearch('');
                      }}
                    >
                      <Text style={[styles.listItemText, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </Modal>
        </View>
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
  container: {
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.2)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 16,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#6b7280',
  },
  applyButton: {
    backgroundColor: '#3b82f6',
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  listOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  listContainer: {
    maxHeight: '70%',
    borderRadius: 16,
    padding: 20,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  searchInput: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.2)',
  },
  listItemText: {
    fontSize: 16,
  },
});