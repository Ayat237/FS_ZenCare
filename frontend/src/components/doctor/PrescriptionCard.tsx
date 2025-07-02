import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../theme/colors';
import { Prescription } from '../../types/prescription';
import { formatDate } from '../../mockData/prescriptions';

interface PrescriptionCardProps {
  prescription: Prescription;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const PrescriptionCard: React.FC<PrescriptionCardProps> = ({ 
  prescription, 
  onView, 
  onEdit, 
  onDelete 
}) => {
  const { id, patientName, date, medications } = prescription;
  
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.patientName}>{patientName}</Text>
        <Text style={styles.date}>{formatDate(date)}</Text>
      </View>
      
      <View style={styles.medicationInfo}>
        <Icon name="pill" size={16} color={Colors.primary600} />
        <Text style={styles.medicationCount}>
          {medications.length} {medications.length === 1 ? 'Medication' : 'Medications'}
        </Text>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => onView(id)}
        >
          <Icon name="eye-outline" size={16} color={Colors.primary600} />
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => onEdit(id)}
        >
          <Icon name="pencil-outline" size={16} color="#2e7d32" />
          <Text style={[styles.actionButtonText, { color: '#2e7d32' }]}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => onDelete(id)}
        >
          <Icon name="delete-outline" size={16} color="#c62828" />
          <Text style={[styles.actionButtonText, { color: '#c62828' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 12,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary700 || '#1B4159',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  medicationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  medicationCount: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  viewButton: {
    backgroundColor: Colors.primary100,
  },
  editButton: {
    backgroundColor: '#e6f7e6', // Light green
  },
  deleteButton: {
    backgroundColor: '#ffebee', // Light red
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    color: Colors.primary600,
  },
});

export default PrescriptionCard;