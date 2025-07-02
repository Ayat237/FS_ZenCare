import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../theme/colors';
import { TelemedicineSession } from '../../types/telemedicine';

interface TelemedicineCardProps {
  session: TelemedicineSession;
}

const TelemedicineCard: React.FC<TelemedicineCardProps> = ({ session }) => {
  const navigation = useNavigation<any>();
  const { patientName, patientImage, date, time, type, status, notes } = session;
  
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle join session button press
  const handleJoinSession = () => {
    navigation.navigate('DoctorTelemedicine', { session });
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.patientInfo}>
          <Image 
            source={typeof patientImage === 'string' ? { uri: patientImage } : patientImage} 
            style={styles.patientImage} 
            onError={(e) => {
              // Handle image loading error
              console.log('Error loading patient image:', e.nativeEvent.error);
            }}
          />
          <Text style={styles.patientName}>{patientName}</Text>
        </View>
        <View style={[styles.statusTag, getStatusStyle(status).container]}>
          <Text style={[styles.statusText, getStatusStyle(status).text]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </View>
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
            name={type === 'video' ? 'video' : 'phone'} 
            size={16} 
            color={Colors.primary600} 
          />
          <Text style={styles.detailText}>
            {type === 'video' ? 'Video Call' : 'Voice Call'}
          </Text>
        </View>

        {notes && (
          <View style={styles.notesContainer}>
            <Icon name="note-text-outline" size={16} color={Colors.primary600} />
            <Text style={styles.notesText}>{notes}</Text>
          </View>
        )}
      </View>
      
      {status === 'upcoming' && (
        <TouchableOpacity 
          style={styles.joinButton}
          onPress={handleJoinSession}
        >
          <Icon 
            name={type === 'video' ? 'video' : 'phone'} 
            size={18} 
            color={Colors.white} 
          />
          <Text style={styles.joinButtonText}>Join Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Helper function to get status-specific styles
const getStatusStyle = (status: string) => {
  switch (status) {
    case 'upcoming':
      return {
        container: { backgroundColor: Colors.primary100 },
        text: { color: Colors.primary600 }
      };
    case 'completed':
      return {
        container: { backgroundColor: '#e6f7e6' }, // Light green
        text: { color: '#2e7d32' } // Dark green
      };
    case 'missed':
      return {
        container: { backgroundColor: '#ffebee' }, // Light red
        text: { color: '#c62828' } // Dark red
      };
    default:
      return {
        container: { backgroundColor: Colors.primary100 },
        text: { color: Colors.primary600 }
      };
  }
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontWeight: '600',
    color: Colors.text,
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
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
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 8,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  notesText: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 8,
    flex: 1,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary500,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  joinButtonText: {
    color: Colors.white,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default TelemedicineCard;