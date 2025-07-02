import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../theme/colors';
import StatusTag from './StatusTag';
import ActionButton from './ActionButton';
import { Appointment } from '../../types/appointment';

interface AppointmentCardProps {
  appointment: Appointment;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ 
  appointment, 
  onAccept, 
  onReject 
}) => {
  const { id, patientName, patientImage, date, time, status, reason, type } = appointment;
  
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.patientInfo}>
          <Image 
            source={{ uri: patientImage }} 
            style={styles.patientImage} 
            onError={(e) => {
              // Handle image loading error
              console.log('Error loading patient image:', e.nativeEvent.error);
            }}
          />
          <Text style={styles.patientName}>{patientName}</Text>
        </View>
        <StatusTag status={status} />
      </View>
      
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Icon name="calendar" size={16} color={Colors.primary600} />
          <Text style={styles.detailText}>{formatDate(date)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Icon name="clock-outline" size={16} color={Colors.primary600} />
          <Text style={styles.detailText}>{time}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Icon 
            name={type === 'telemedicine' ? "video-outline" : "hospital-building"} 
            size={16} 
            color={Colors.primary600} 
          />
          <Text style={styles.detailText}>
            {type === 'telemedicine' ? 'Telemedicine' : 'In-person'}
          </Text>
        </View>
      </View>
      
      <View style={styles.reasonContainer}>
        <Text style={styles.reasonLabel}>Reason:</Text>
        <Text style={styles.reasonText}>{reason}</Text>
      </View>
      
      {status === 'pending' && (
        <View style={styles.actionsContainer}>
          <ActionButton type="accept" onPress={() => onAccept(id)} />
          <ActionButton type="reject" onPress={() => onReject(id)} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary700 || '#1B4159',
  },
  details: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555',
  },
  reasonContainer: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    color: '#555',
  },
  reasonText: {
    fontSize: 14,
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
});

export default AppointmentCard;