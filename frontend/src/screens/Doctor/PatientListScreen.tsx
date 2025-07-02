import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { DoctorDrawerParamList } from '@/types/navigation';
import Colors from '@/theme/colors';
import { mockPatients } from '@/mockData/patients';
import { Patient } from '@/types/patient';
import PatientCard from '@/components/doctor/PatientCard';

const PatientListScreen: React.FC = () => {
  const navigation = useNavigation<DrawerNavigationProp<DoctorDrawerParamList>>();
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter patients based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setPatients(mockPatients);
    } else {
      const filtered = mockPatients.filter(patient =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setPatients(filtered);
    }
  }, [searchQuery]);

  const handleViewPatientHistory = (patient: Patient) => {
    navigation.navigate('PatientMedicalHistory', { patientId: patient.id });
  };

  const renderPatientItem = ({ item }: { item: Patient }) => (
    <PatientCard patient={item} onPress={handleViewPatientHistory} />
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="account-search-outline" size={60} color={Colors.gray} />
      <Text style={styles.emptyText}>No patients found</Text>
      <Text style={styles.emptySubtext}>Try a different search term</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Patient List</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={Colors.gray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search patients by name"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.gray}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={16} color={Colors.gray} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={patients}
        renderItem={renderPatientItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyList}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: Colors.text,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 8,
  },
});

export default PatientListScreen;