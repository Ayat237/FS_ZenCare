import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, StatusBar, ImageBackground, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';

// Components
import StatCard from '../../components/doctor/StatCard';
import AgendaList from '../../components/doctor/AgendaList';

// Theme
import Colors from '../../theme/colors';

// Mock Data
import { mockAppointments, getUpcomingAppointments } from '../../mockData/appointments';
import { mockPatients } from '../../mockData/patients';
import { mockPrescriptions } from '../../mockData/prescriptions';
import { mockTelemedicineSessions, getUpcomingSessions } from '../../mockData/telemedicine';
import { getCurrentMonthPayments, getTotalEarnings } from '../../mockData/payments';

// Types
import { Appointment } from '../../types/appointment';
import { TelemedicineSession } from '../../types/telemedicine';

const DoctorDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Get today's date in ISO format for filtering
  const today = format(new Date(), 'yyyy-MM-dd');

  // Filter appointments and sessions for today
  const todayAppointments = mockAppointments.filter(
    appointment => appointment.date === today && 
    (appointment.status === 'pending' || appointment.status === 'accepted')
  );

  const todayTelemedicineSessions = mockTelemedicineSessions.filter(
    session => session.date === today && session.status === 'upcoming'
  );

  // Calculate stats
  const upcomingAppointmentsCount = getUpcomingAppointments().length;
  const patientsCount = mockPatients.length;
  const prescriptionsCount = mockPrescriptions.length;
  const upcomingTelemedicineCount = getUpcomingSessions().length;
  const currentMonthEarnings = getTotalEarnings(getCurrentMonthPayments());

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setLastUpdated(new Date());
      setRefreshing(false);
    }, 1000);
  };

  // Handle agenda item press
  const handleAgendaItemPress = (item: any) => {
    // Navigate to appropriate screen based on item type
    if (item.type === 'appointment') {
      navigation.navigate('DoctorAppointments' as never);
    } else {
      navigation.navigate('TelemedicineSessions' as never);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary600} />
      
      {/* Header background */}
      <View
        style={[styles.headerGradient, { backgroundColor: Colors.primary500 }]}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}, Dr. Sarah 👋</Text>
            <Text style={styles.subtitle}>Here's your dashboard overview</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => navigation.navigate('DoctorNotifications' as never)}
          >
            <Icon name="bell-outline" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <View style={styles.statsColumn}>
            <StatCard 
              title="Upcoming Appointments" 
              value={upcomingAppointmentsCount} 
              icon="calendar-clock"
              iconBackgroundColor={Colors.primary500}
              onPress={() => navigation.navigate('DoctorAppointments' as never)}
            />
          </View>
          <View style={styles.statsColumn}>
            <StatCard 
              title="Patients" 
              value={patientsCount} 
              icon="account-group"
              iconBackgroundColor={Colors.accent500}
              onPress={() => navigation.navigate('PatientList' as never)}
            />
          </View>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statsColumn}>
            <StatCard 
              title="Prescriptions" 
              value={prescriptionsCount} 
              icon="prescription"
              iconBackgroundColor={Colors.success500}
              onPress={() => navigation.navigate('DoctorPrescriptions' as never)}
            />
          </View>
          <View style={styles.statsColumn}>
            <StatCard 
              title="Telemedicine Sessions" 
              value={upcomingTelemedicineCount} 
              icon="video"
              iconBackgroundColor={Colors.info500}
              onPress={() => navigation.navigate('TelemedicineSessions' as never)}
            />
          </View>
        </View>

        <StatCard 
          title="Earnings This Month" 
          value={`$${currentMonthEarnings}`} 
          icon="cash-multiple"
          iconBackgroundColor={Colors.warning500}
          onPress={() => navigation.navigate('DoctorPayments' as never)}
        />
      </View>

      {/* Today's Agenda */}
      <View style={styles.agendaSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Agenda</Text>
          <Text style={styles.dateText}>{format(new Date(), 'EEEE, MMMM d')}</Text>
        </View>
        
        <AgendaList 
          appointments={todayAppointments}
          telemedicineSessions={todayTelemedicineSessions}
          onItemPress={handleAgendaItemPress}
        />
      </View>

      {/* Last updated timestamp */}
      <Text style={styles.lastUpdated}>
        Last updated: {format(lastUpdated, 'h:mm a')}
      </Text>
    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  scrollView: {
    flex: 1,
    marginTop: -20,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statsGrid: {
    marginBottom: 24,
    marginTop: 10,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statsColumn: {
    flex: 1,
    marginRight: 16,
  },
  statsColumn2: {
    flex: 1,
  },
  agendaSection: {
    marginBottom: 20,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 14,
    color: Colors.primary500,
    fontWeight: '500',
  },
  lastUpdated: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 12,
    fontStyle: 'italic',
  },
});

export default DoctorDashboardScreen;