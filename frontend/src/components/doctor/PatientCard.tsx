import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '@/theme/colors';
import { Patient } from '@/types/patient';

interface PatientCardProps {
  patient: Patient;
  onPress: (patient: Patient) => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.patientCard}
      onPress={() => onPress(patient)}
      activeOpacity={0.7}
    >
      <View style={styles.patientInfo}>
        <Image source={patient.image} style={styles.patientImage} />
        <View style={styles.patientDetails}>
          <Text style={styles.patientName}>{patient.name}</Text>
          <Text style={styles.patientAge}>{patient.age} years old</Text>
          
          {/* Summary of medical history */}
          <View style={styles.historySummary}>
            {patient.history.chronicDiseases.length > 0 && (
              <View style={styles.historyBadge}>
                <Text style={styles.historyBadgeText}>
                  {patient.history.chronicDiseases.length} Conditions
                </Text>
              </View>
            )}
            {patient.history.medications.length > 0 && (
              <View style={styles.historyBadge}>
                <Text style={styles.historyBadgeText}>
                  {patient.history.medications.length} Medications
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.viewButton}
        onPress={() => onPress(patient)}
      >
        <Text style={styles.viewButtonText}>View History</Text>
        <Icon name="chevron-right" size={20} color={Colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  patientCard: {
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
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  patientImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  patientAge: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 8,
  },
  historySummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  historyBadge: {
    backgroundColor: Colors.lightPrimary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  historyBadgeText: {
    fontSize: 12,
    color: Colors.primary,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginRight: 4,
  },
});

export default PatientCard;