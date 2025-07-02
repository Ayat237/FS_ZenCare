import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../theme/colors';
import { Appointment } from '../../types/appointment';
import { TelemedicineSession } from '../../types/telemedicine';

type AgendaItem = {
  id: string;
  patientName: string;
  time: string;
  type: 'appointment' | 'telemedicine';
  appointmentType?: string;
  sessionType?: 'video' | 'voice';
};

interface AgendaListProps {
  appointments: Appointment[];
  telemedicineSessions: TelemedicineSession[];
  onItemPress: (item: AgendaItem) => void;
}

const AgendaList: React.FC<AgendaListProps> = ({
  appointments,
  telemedicineSessions,
  onItemPress,
}) => {
  // Combine and format appointments and telemedicine sessions
  const agendaItems: AgendaItem[] = [
    ...appointments.map(appointment => ({
      id: appointment.id,
      patientName: appointment.patientName,
      time: appointment.time,
      type: 'appointment' as const,
      appointmentType: appointment.type,
    })),
    ...telemedicineSessions.map(session => ({
      id: session.id,
      patientName: session.patientName,
      time: session.time,
      type: 'telemedicine' as const,
      sessionType: session.type,
    })),
  ].sort((a, b) => {
    // Sort by time (assuming time is in format like "10:30 AM")
    return convertTimeToMinutes(a.time) - convertTimeToMinutes(b.time);
  });

  // Helper function to convert time string to minutes for sorting
  function convertTimeToMinutes(timeStr: string): number {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours < 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return hours * 60 + minutes;
  }

  // Render each agenda item
  const renderAgendaItem = ({ item }: { item: AgendaItem }) => {
    const isAppointment = item.type === 'appointment';
    const iconName = isAppointment 
      ? (item.appointmentType === 'in-person' ? 'account-clock' : 'video') 
      : (item.sessionType === 'video' ? 'video' : 'phone');

    return (
      <TouchableOpacity 
        style={styles.agendaItem} 
        onPress={() => onItemPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.timeContainer}>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.iconContainer}>
            <Icon name={iconName} size={20} color={Colors.white} />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.patientName}>{item.patientName}</Text>
            <Text style={styles.appointmentType}>
              {isAppointment 
                ? `${item.appointmentType === 'in-person' ? 'In-person' : 'Telemedicine'} Appointment` 
                : `${item.sessionType === 'video' ? 'Video' : 'Voice'} Session`}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {agendaItems.length > 0 ? (
        <FlatList
          data={agendaItems}
          keyExtractor={(item) => item.id}
          renderItem={renderAgendaItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="calendar-check" size={40} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No appointments scheduled for today</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  listContent: {
    paddingVertical: 12,
  },
  agendaItem: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    backgroundColor: Colors.white,
  },
  timeContainer: {
    width: 70,
    marginRight: 14,
    justifyContent: 'center',
  },
  time: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary600,
  },
  detailsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary500,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  textContainer: {
    flex: 1,
  },
  patientName: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  appointmentType: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default AgendaList;