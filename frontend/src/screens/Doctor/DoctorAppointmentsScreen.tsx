import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, SectionList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Colors from '@theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Appointment } from '../../types/appointment';
import { AppointmentCard } from '../../components/doctor';
import { mockAppointments, getUpcomingAppointments, getPastAppointments } from '../../mockData/appointments';

// Define section data type
type SectionData = {
  title: string;
  data: Appointment[];
};

const DoctorAppointmentsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all');
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [sectionData, setSectionData] = useState<SectionData[]>([]);
  
  // Update appointment status
  const handleAcceptAppointment = (id: string) => {
    setAppointments(prevAppointments => 
      prevAppointments.map(appointment => 
        appointment.id === id 
          ? { ...appointment, status: 'accepted' } 
          : appointment
      )
    );
  };

  const handleRejectAppointment = (id: string) => {
    setAppointments(prevAppointments => 
      prevAppointments.map(appointment => 
        appointment.id === id 
          ? { ...appointment, status: 'rejected' } 
          : appointment
      )
    );
  };
  
  // Filter appointments based on active filter
  useEffect(() => {
    let filtered = appointments;
    
    if (activeFilter !== 'all') {
      filtered = appointments.filter(appointment => appointment.status === activeFilter);
    }
    
    // Create sections for upcoming and past appointments
    const upcoming = getUpcomingAppointments().filter(apt => 
      filtered.some(filteredApt => filteredApt.id === apt.id)
    );
    
    const past = getPastAppointments().filter(apt => 
      filtered.some(filteredApt => filteredApt.id === apt.id)
    );
    
    const sections: SectionData[] = [];
    
    if (upcoming.length > 0) {
      sections.push({
        title: 'Upcoming Appointments',
        data: upcoming,
      });
    }
    
    if (past.length > 0) {
      sections.push({
        title: 'Past Appointments',
        data: past,
      });
    }
    
    setSectionData(sections);
  }, [activeFilter, appointments]);

  // Render section header
  const renderSectionHeader = ({ section }: { section: SectionData }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );
  
  // Render appointment item
  const renderAppointmentItem = ({ item }: { item: Appointment }) => (
    <AppointmentCard 
      appointment={item} 
      onAccept={handleAcceptAppointment}
      onReject={handleRejectAppointment}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={Colors.primary600} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Appointments</Text>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Icon name="menu" size={24} color={Colors.primary600} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, activeFilter === 'all' && styles.activeFilter]}
          onPress={() => setActiveFilter('all')}
        >
          <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, activeFilter === 'pending' && styles.activeFilter]}
          onPress={() => setActiveFilter('pending')}
        >
          <Text style={[styles.filterText, activeFilter === 'pending' && styles.activeFilterText]}>Pending</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, activeFilter === 'accepted' && styles.activeFilter]}
          onPress={() => setActiveFilter('accepted')}
        >
          <Text style={[styles.filterText, activeFilter === 'accepted' && styles.activeFilterText]}>Accepted</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, activeFilter === 'completed' && styles.activeFilter]}
          onPress={() => setActiveFilter('completed')}
        >
          <Text style={[styles.filterText, activeFilter === 'completed' && styles.activeFilterText]}>Completed</Text>
        </TouchableOpacity>
      </View>
      
      <SectionList
        sections={sectionData}
        renderItem={renderAppointmentItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary700,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
  },
  activeFilter: {
    backgroundColor: Colors.primary100,
  },
  filterText: {
    color: '#666',
    fontWeight: '500',
  },
  activeFilterText: {
    color: Colors.primary700,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  sectionHeader: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary700,
  },
});

export default DoctorAppointmentsScreen;