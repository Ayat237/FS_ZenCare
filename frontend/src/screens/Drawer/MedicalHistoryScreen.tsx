import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '@theme/colors';
import { DrawerScreenProps } from '@/types/navigation';

interface MedicalRecord {
  id: string;
  title: string;
  date: string;
  doctor: string;
  description: string;
  type: 'Diagnosis' | 'Test' | 'Surgery' | 'Vaccination';
}

const dummyMedicalRecords: MedicalRecord[] = [
  {
    id: '1',
    title: 'Annual Physical Examination',
    date: 'March 15, 2023',
    doctor: 'Dr. Sarah Johnson',
    description: 'Complete physical examination with blood work. All results normal.',
    type: 'Diagnosis',
  },
  {
    id: '2',
    title: 'COVID-19 Vaccination',
    date: 'January 10, 2023',
    doctor: 'Dr. Michael Chen',
    description: 'Received second dose of Pfizer-BioNTech COVID-19 vaccine.',
    type: 'Vaccination',
  },
  {
    id: '3',
    title: 'Blood Test',
    date: 'November 5, 2022',
    doctor: 'Dr. Emily Rodriguez',
    description: 'Complete blood count and metabolic panel. Vitamin D levels slightly low.',
    type: 'Test',
  },
  {
    id: '4',
    title: 'Appendectomy',
    date: 'August 20, 2022',
    doctor: 'Dr. James Wilson',
    description: 'Laparoscopic appendectomy procedure. Recovery normal with no complications.',
    type: 'Surgery',
  },
  {
    id: '5',
    title: 'Influenza Vaccination',
    date: 'October 12, 2022',
    doctor: 'Dr. Lisa Thompson',
    description: 'Annual flu shot administered.',
    type: 'Vaccination',
  },
];

const MedicalRecordItem = ({ item }: { item: MedicalRecord }) => {
  const [expanded, setExpanded] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Diagnosis':
        return 'stethoscope';
      case 'Test':
        return 'test-tube';
      case 'Surgery':
        return 'medical-bag';
      case 'Vaccination':
        return 'needle';
      default:
        return 'file-document-outline';
    }
  };

  return (
    <TouchableOpacity
      style={styles.recordCard}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
    >
      <View style={styles.recordHeader}>
        <View style={styles.iconContainer}>
          <Icon name={getTypeIcon(item.type)} size={24} color={Colors.primary500} />
        </View>
        <View style={styles.recordInfo}>
          <Text style={styles.recordTitle}>{item.title}</Text>
          <Text style={styles.recordDate}>{item.date}</Text>
          <Text style={styles.recordDoctor}>{item.doctor}</Text>
        </View>
        <Icon
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color="#666"
        />
      </View>
      {expanded && (
        <View style={styles.recordDetails}>
          <Text style={styles.recordType}>{item.type}</Text>
          <Text style={styles.recordDescription}>{item.description}</Text>
          <TouchableOpacity style={styles.viewMoreButton}>
            <Text style={styles.viewMoreText}>View Full Record</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const MedicalHistoryScreen: React.FC<DrawerScreenProps<'MedicalHistory'>> = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Diagnosis', 'Test', 'Surgery', 'Vaccination'];

  const filteredRecords = activeFilter === 'All'
    ? dummyMedicalRecords
    : dummyMedicalRecords.filter(record => record.type === activeFilter);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.searchButton}>
          <Icon name="magnify" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medical History</Text>
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={styles.menuButton}
        >
          <Icon name="menu" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterChip,
              activeFilter === filter && styles.activeFilterChip,
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter && styles.activeFilterText,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredRecords}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MedicalRecordItem item={item} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default MedicalHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  searchButton: {
    padding: 8,
  },
  filtersContainer: {
    backgroundColor: '#FFF',
    paddingVertical: 8, // Reduced height
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6, // Reduced height
    borderRadius: 16,
    marginHorizontal: 4,
    backgroundColor: '#F0F0F0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  activeFilterChip: {
    backgroundColor: Colors.primary500, // Changed to primary500 for better contrast
  },
  filterText: {
    fontSize: 13, // Slightly smaller text
    color: '#666',
  },
  activeFilterText: {
    color: '#FFFFFF', // White text for better contrast
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  recordCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary500,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  recordDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  recordDoctor: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  recordDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FAFBFC',
    borderRadius: 8,
    padding: 12,
  },
  recordType: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary500,
    marginBottom: 8,
    backgroundColor: Colors.primary100,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recordDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  viewMoreButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    backgroundColor: Colors.primary500,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewMoreText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});