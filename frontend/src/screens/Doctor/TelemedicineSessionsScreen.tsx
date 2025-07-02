import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '@theme/colors';
import { TelemedicineSession } from '../../types/telemedicine';
import TelemedicineCard from '../../components/doctor/TelemedicineCard';
import { 
  mockTelemedicineSessions, 
  getUpcomingSessions, 
  getCompletedSessions, 
  getMissedSessions 
} from '../../mockData/telemedicine';

type FilterType = 'all' | 'upcoming' | 'completed' | 'missed';

const TelemedicineSessionsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sessions, setSessions] = useState<TelemedicineSession[]>(mockTelemedicineSessions);
  
  // Filter sessions based on active filter
  useEffect(() => {
    switch (activeFilter) {
      case 'upcoming':
        setSessions(getUpcomingSessions());
        break;
      case 'completed':
        setSessions(getCompletedSessions());
        break;
      case 'missed':
        setSessions(getMissedSessions());
        break;
      default:
        setSessions(mockTelemedicineSessions);
        break;
    }
  }, [activeFilter]);

  // Filter button component
  const FilterButton = ({ title, filter }: { title: string; filter: FilterType }) => (
    <TouchableOpacity
      style={[styles.filterButton, activeFilter === filter && styles.activeFilterButton]}
      onPress={() => setActiveFilter(filter)}
    >
      <Text 
        style={[styles.filterButtonText, activeFilter === filter && styles.activeFilterText]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
          <Icon name="menu" size={24} color={Colors.primary600} />
        </TouchableOpacity>
        <Text style={styles.title}>Telemedicine Sessions</Text>
        <TouchableOpacity 
          style={styles.testButton} 
          onPress={() => navigation.navigate('TelemedicineTest')}
        >
          <Icon name="video-check" size={20} color={Colors.white} />
          <Text style={styles.testButtonText}>Test Call</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.filterContainer}>
        <FilterButton title="All" filter="all" />
        <FilterButton title="Upcoming" filter="upcoming" />
        <FilterButton title="Completed" filter="completed" />
        <FilterButton title="Missed" filter="missed" />
      </View>
      
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TelemedicineCard session={item} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="video-off" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No sessions found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary600,
    marginLeft: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: Colors.background,
  },
  activeFilterButton: {
    backgroundColor: Colors.primary100,
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  activeFilterText: {
    color: Colors.primary600,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textMuted,
    marginTop: 16,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary500,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 'auto',
  },
  testButtonText: {
    color: Colors.white,
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 4,
  },
});

export default TelemedicineSessionsScreen;