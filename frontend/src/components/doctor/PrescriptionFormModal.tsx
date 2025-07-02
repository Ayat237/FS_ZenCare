import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Colors from '../../theme/colors';
import MedicationInputRow from './MedicationInputRow';
import { Prescription, FormMode } from '../../types/prescription';

interface PrescriptionFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (prescription: Prescription) => void;
  prescription?: Prescription;
  mode: FormMode;
}

const PrescriptionFormModal: React.FC<PrescriptionFormModalProps> = ({
  visible,
  onClose,
  onSave,
  prescription,
  mode,
}) => {
  const [patientName, setPatientName] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [medications, setMedications] = useState<Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>>([{ name: '', dosage: '', frequency: '', duration: '' }]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (prescription && mode === 'edit') {
      setPatientName(prescription.patientName);
      setDate(new Date(prescription.date));
      setMedications(prescription.medications);
      setNotes(prescription.notes || '');
    } else {
      // Reset form for new prescription
      setPatientName('');
      setDate(new Date());
      setMedications([{ name: '', dosage: '', frequency: '', duration: '' }]);
      setNotes('');
    }
  }, [prescription, mode, visible]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleMedicationChange = (
    index: number,
    field: keyof typeof medications[0],
    value: string
  ) => {
    const updatedMedications = [...medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value,
    };
    setMedications(updatedMedications);
  };

  const handleAddMedication = () => {
    setMedications([
      ...medications,
      { name: '', dosage: '', frequency: '', duration: '' },
    ]);
  };

  const handleRemoveMedication = (index: number) => {
    const updatedMedications = [...medications];
    updatedMedications.splice(index, 1);
    setMedications(updatedMedications);
  };

  const handleSave = () => {
    // Validate form
    if (!patientName.trim()) {
      Alert.alert('Validation Error', 'Please enter patient name');
      return;
    }

    if (medications.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one medication');
      return;
    }

    // Check if all medications have required fields
    const isValid = medications.every(
      (med) =>
        med.name.trim() &&
        med.dosage.trim() &&
        med.frequency.trim() &&
        med.duration.trim()
    );

    if (!isValid) {
      Alert.alert('Validation Error', 'Please fill in all medication fields');
      return;
    }

    // Create prescription object
    const formattedDate = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    const newPrescription: Prescription = {
      id: prescription?.id || `presc${Date.now()}`, // Use existing ID or generate new one
      patientName,
      date: formattedDate,
      medications,
      notes: notes.trim() || undefined,
    };

    onSave(newPrescription);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {mode === 'add' ? 'Add New Prescription' : 'Edit Prescription'}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={24} color="#555" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Patient Name</Text>
              <TextInput
                style={styles.input}
                value={patientName}
                onChangeText={setPatientName}
                placeholder="Enter patient name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {date.toLocaleDateString()}
                </Text>
                <Icon name="calendar" size={20} color={Colors.primary500} />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
            </View>

            <View style={styles.medicationsSection}>
              <Text style={styles.sectionTitle}>Medications</Text>
              {medications.map((medication, index) => (
                <MedicationInputRow
                  key={index}
                  medication={medication}
                  index={index}
                  onChange={handleMedicationChange}
                  onRemove={handleRemoveMedication}
                  isRemovable={medications.length > 1}
                />
              ))}
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddMedication}
              >
                <Icon name="plus" size={16} color="#fff" />
                <Text style={styles.addButtonText}>Add Medication</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Enter any additional notes"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 6,
  },
  input: {
    height: 40,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    color: '#333',
  },
  dateInput: {
    height: 40,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    color: '#333',
  },
  notesInput: {
    height: 100,
    paddingTop: 12,
  },
  medicationsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary600,
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary500,
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: Colors.primary500,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});

export default PrescriptionFormModal;