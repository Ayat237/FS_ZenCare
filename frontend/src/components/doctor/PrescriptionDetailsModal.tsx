import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../theme/colors';
import { Prescription } from '../../types/prescription';
import { formatDate } from '../../mockData/prescriptions';

interface PrescriptionDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  prescription: Prescription | null;
}

const PrescriptionDetailsModal: React.FC<PrescriptionDetailsModalProps> = ({
  visible,
  onClose,
  prescription,
}) => {
  if (!prescription) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Prescription Details</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={24} color="#555" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.detailsContainer}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Patient Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name:</Text>
                <Text style={styles.infoValue}>{prescription.patientName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date:</Text>
                <Text style={styles.infoValue}>{formatDate(prescription.date)}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Medications</Text>
              <FlatList
                data={prescription.medications}
                keyExtractor={(_, index) => `medication-${index}`}
                renderItem={({ item, index }) => (
                  <View style={styles.medicationCard}>
                    <View style={styles.medicationHeader}>
                      <Icon name="pill" size={18} color={Colors.primary600} />
                      <Text style={styles.medicationName}>{item.name}</Text>
                    </View>
                    <View style={styles.medicationDetails}>
                      <View style={styles.medicationInfo}>
                        <Text style={styles.medicationInfoLabel}>Dosage:</Text>
                        <Text style={styles.medicationInfoValue}>{item.dosage}</Text>
                      </View>
                      <View style={styles.medicationInfo}>
                        <Text style={styles.medicationInfoLabel}>Frequency:</Text>
                        <Text style={styles.medicationInfoValue}>{item.frequency}</Text>
                      </View>
                      <View style={styles.medicationInfo}>
                        <Text style={styles.medicationInfoLabel}>Duration:</Text>
                        <Text style={styles.medicationInfoValue}>{item.duration}</Text>
                      </View>
                    </View>
                  </View>
                )}
                scrollEnabled={false}
              />
            </View>

            {prescription.notes && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <View style={styles.notesContainer}>
                  <Text style={styles.notesText}>{prescription.notes}</Text>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.closeFullButton}
              onPress={onClose}
            >
              <Text style={styles.closeFullButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary700,
  },
  closeButton: {
    padding: 4,
  },
  detailsContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary600,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 80,
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  medicationCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicationName: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary700,
  },
  medicationDetails: {
    marginLeft: 26,
  },
  medicationInfo: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  medicationInfoLabel: {
    width: 80,
    fontSize: 14,
    color: '#555',
  },
  medicationInfoValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  notesContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  closeFullButton: {
    backgroundColor: Colors.primary500,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  closeFullButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
});

export default PrescriptionDetailsModal;