import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Theme
import Colors from '../../theme/colors';

// Types
import { TimeSlot } from '../../types/availability';

interface TimeSlotItemProps {
  slot: TimeSlot;
  onEdit: () => void;
  onDelete: () => void;
}

const TimeSlotItem: React.FC<TimeSlotItemProps> = ({ slot, onEdit, onDelete }) => {
  // Format time from 24-hour to 12-hour format
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${period}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.timeContainer}>
        <View style={styles.timeBlock}>
          <Icon 
            name="clock-outline" 
            size={18} 
            color={Colors.primary500} 
            style={styles.icon} 
          />
          <Text style={styles.timeText}>
            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
          </Text>
        </View>
        
        <View style={styles.durationBlock}>
          <Text style={styles.durationText}>{slot.duration} min</Text>
        </View>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.typeContainer}>
          <Icon 
            name={slot.type === 'telemedicine' ? 'video' : 'hospital-building'} 
            size={16} 
            color={slot.type === 'telemedicine' ? Colors.info : Colors.accent500} 
            style={styles.typeIcon} 
          />
          <Text style={styles.typeText}>
            {slot.type === 'telemedicine' ? 'Telemedicine' : 'In-Person'}
          </Text>
        </View>
        
        {slot.isRecurring && (
          <View style={styles.recurringContainer}>
            <Icon name="repeat" size={16} color={Colors.success} style={styles.recurringIcon} />
            <Text style={styles.recurringText}>Weekly</Text>
          </View>
        )}
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Icon name="pencil" size={18} color={Colors.primary500} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Icon name="delete" size={18} color={Colors.error500} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginBottom: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 6,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  durationBlock: {
    backgroundColor: Colors.primary100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.primary600,
  },
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  typeIcon: {
    marginRight: 4,
  },
  typeText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  recurringContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recurringIcon: {
    marginRight: 4,
  },
  recurringText: {
    fontSize: 14,
    color: Colors.success,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
  },
});

export default TimeSlotItem;