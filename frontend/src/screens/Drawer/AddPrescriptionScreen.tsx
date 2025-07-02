import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '@theme/colors';
import { DrawerScreenProps } from '@/types/navigation';
import InputField from '@components/ui/inputs/InputField';
import AddMedicationModal from '@components/modals/AddMedicationModal';
import MedicationDatePickerModal from '@components/modals/MedicationDatePickerModal';
import DrugWarningModal from '@components/modals/DrugWarningModal';

// Import types from DrugWarningModal
interface DrugInteraction {
  drugA: string;
  drugB: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
}

interface DrugDuplicate {
  drugName: string;
  existingPrescription: string;
  prescribedDate: string;
}

// Types for the prescription data
interface Medication {
  medicineName: string;
  drugId: string;
  medicineType: string;
  dose: number;
  frequency: string;
  timesPerDay: number;
  startHour: number;
  startDateTime: string;
  endDateTime: string;
  intakeInstructions: string;
  notes: string;
  hasInteractions?: boolean;
}

interface Prescription {
  diseaseName: string;
  diseaseType: string;
  medications: Medication[];
}

const AddPrescriptionScreen: React.FC<DrawerScreenProps<'AddPrescription'>> = ({ navigation }) => {
  // State for the prescription form
  const [prescription, setPrescription] = useState<Prescription>({
    diseaseName: '',
    diseaseType: '',
    medications: [],
  });

  // State for form validation
  const [errors, setErrors] = useState({
    diseaseName: '',
    diseaseType: '',
  });

  // Handle disease name change
  const handleDiseaseNameChange = (text: string) => {
    setPrescription(prev => ({ ...prev, diseaseName: text }));
    if (text.trim()) {
      setErrors(prev => ({ ...prev, diseaseName: '' }));
    }
  };

  // Handle disease type change
  const handleDiseaseTypeChange = (text: string) => {
    setPrescription(prev => ({ ...prev, diseaseType: text }));
    if (text.trim()) {
      setErrors(prev => ({ ...prev, diseaseType: '' }));
    }
  };

  // State for modals
  const [showAddMedicationModal, setShowAddMedicationModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<{ type: 'start' | 'end', index: number } | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningType, setWarningType] = useState<'interaction' | 'duplicate' | null>(null);
  
  // State for API responses
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [duplicates, setDuplicates] = useState<DrugDuplicate[]>([]);
  const [alternativeDrugs, setAlternativeDrugs] = useState<string[]>([]);
  
  // State for loading
  const [isLoading, setIsLoading] = useState(false);
  const [hasAcknowledgedWarnings, setHasAcknowledgedWarnings] = useState(false);

  // Handle add medication button press
  const handleAddMedication = () => {
    setShowAddMedicationModal(true);
  };
  
  // Handle save medication from modal
  const handleSaveMedication = (medication: Medication) => {
    setPrescription(prev => ({
      ...prev,
      medications: [...prev.medications, medication],
    }));
  };
  
  // Handle remove medication
  const handleRemoveMedication = (index: number) => {
    setPrescription(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  };
  
  // Handle date selection for a medication
  const handleDateSelect = (date: string) => {
    if (!showDatePicker) return;
    
    const { type, index } = showDatePicker;
    const updatedMedications = [...prescription.medications];
    
    if (type === 'start') {
      updatedMedications[index].startDateTime = date;
    } else {
      updatedMedications[index].endDateTime = date;
    }
    
    setPrescription(prev => ({
      ...prev,
      medications: updatedMedications,
    }));
    
    setShowDatePicker(null);
  };
  
  // Handle warning modal confirm
  const handleWarningConfirm = () => {
    // Mark medications as acknowledged
    const updatedMedications = prescription.medications.map(med => ({
      ...med,
      hasInteractions: true,
    }));
    
    setPrescription(prev => ({
      ...prev,
      medications: updatedMedications,
    }));
    
    setHasAcknowledgedWarnings(true);
    setShowWarningModal(false);
    
    // Submit the prescription again with acknowledgement
    createPrescription(true);
  };

  // Create prescription API call
  const createPrescription = async (hasAcknowledged = false) => {
    // Validate form
    let valid = true;
    const newErrors = { ...errors };

    if (!prescription.diseaseName.trim()) {
      newErrors.diseaseName = 'Disease name is required';
      valid = false;
    }

    if (!prescription.diseaseType.trim()) {
      newErrors.diseaseType = 'Disease type is required';
      valid = false;
    }

    if (prescription.medications.length === 0) {
      Alert.alert('Error', 'Please add at least one medication');
      valid = false;
    }

    setErrors(newErrors);

    if (!valid) return;
    
    setIsLoading(true);
    
    try {
      // Mock API call for now
      // In a real implementation, this would be a fetch or axios call to the backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate different responses based on the prescription data
      if (!hasAcknowledged && prescription.medications.some(med => med.medicineName.toLowerCase().includes('lisinopril'))) {
        // Simulate interaction warning
        const mockInteractions: DrugInteraction[] = [
          {
            drugA: 'Lisinopril',
            drugB: 'Potassium supplements',
            severity: 'high' as 'high' | 'medium' | 'low',
            description: 'May increase risk of hyperkalemia (high potassium levels in the blood).',
          },
        ];
        
        setInteractions(mockInteractions);
        setAlternativeDrugs(['Losartan', 'Valsartan', 'Amlodipine'] as string[]);
        setWarningType('interaction');
        setShowWarningModal(true);
      } else if (!hasAcknowledged && prescription.medications.some(med => med.medicineName.toLowerCase().includes('lipitor'))) {
        // Simulate duplicate warning
        const mockDuplicates: DrugDuplicate[] = [
          {
            drugName: 'Lipitor',
            existingPrescription: 'Cholesterol Management',
            prescribedDate: '2023-05-15',
          },
        ];
        
        setDuplicates(mockDuplicates);
        setWarningType('duplicate');
        setShowWarningModal(true);
      } else {
        // Success case
        Alert.alert(
          'Success',
          'Prescription created successfully',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create prescription. Please try again.');
      console.error('Error creating prescription:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = () => {
    setHasAcknowledgedWarnings(false);
    createPrescription(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Prescription</Text>
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={styles.menuButton}
        >
          <Icon name="menu" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Disease Information</Text>
          
          <InputField
            label="Disease Name"
            placeholder="Enter disease name"
            value={prescription.diseaseName}
            onChangeText={handleDiseaseNameChange}
            error={errors.diseaseName}
            style={styles.input}
          />

          <InputField
            label="Disease Type"
            placeholder="e.g., chronic, acute, etc."
            value={prescription.diseaseType}
            onChangeText={handleDiseaseTypeChange}
            error={errors.diseaseType}
            style={styles.input}
          />

          <Text style={[styles.sectionTitle, styles.medicationTitle]}>Medications</Text>
          
          {prescription.medications.length > 0 ? (
            <View style={styles.medicationsList}>
              {prescription.medications.map((medication, index) => (
                <View key={index} style={styles.medicationItem}>
                  <View style={styles.medicationHeader}>
                    <Text style={styles.medicationName}>{medication.medicineName}</Text>
                    <TouchableOpacity onPress={() => handleRemoveMedication(index)}>
                      <Icon name="close" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.medicationDetails}>
                    {medication.dose} {medication.medicineType} • {medication.frequency}
                  </Text>
                  <View style={styles.medicationTimingContainer}>
                    <TouchableOpacity 
                      style={styles.dateButton}
                      onPress={() => setShowDatePicker({ type: 'start', index })}
                    >
                      <Text style={styles.dateButtonText}>
                        {new Date(medication.startDateTime).toLocaleDateString()}
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.dateSeperator}>-</Text>
                    <TouchableOpacity 
                      style={styles.dateButton}
                      onPress={() => setShowDatePicker({ type: 'end', index })}
                    >
                      <Text style={styles.dateButtonText}>
                        {new Date(medication.endDateTime).toLocaleDateString()}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {medication.intakeInstructions && (
                    <Text style={styles.medicationInstructions}>
                      <Text style={styles.instructionsLabel}>Instructions: </Text>
                      {medication.intakeInstructions}
                    </Text>
                  )}
                  {medication.notes && (
                    <Text style={styles.medicationNotes}>
                      <Text style={styles.notesLabel}>Notes: </Text>
                      {medication.notes}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyMedications}>
              <Text style={styles.emptyMedicationsText}>No medications added yet</Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.addMedicationButton}
            onPress={handleAddMedication}
          >
            <Icon name="plus" size={20} color="#FFF" />
            <Text style={styles.addMedicationButtonText}>Add Medication</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitButton, isLoading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>Create Prescription</Text>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Modals */}
      <AddMedicationModal
        visible={showAddMedicationModal}
        onClose={() => setShowAddMedicationModal(false)}
        onSave={handleSaveMedication}
      />
      
      {showDatePicker && (
        <MedicationDatePickerModal
          visible={!!showDatePicker}
          onClose={() => setShowDatePicker(null)}
          onConfirm={handleDateSelect}
          initialDate={showDatePicker.type === 'start' 
            ? prescription.medications[showDatePicker.index].startDateTime 
            : prescription.medications[showDatePicker.index].endDateTime
          }
          minDate={new Date().toISOString().split('T')[0]}
        />
      )}
      
      <DrugWarningModal
        visible={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        onConfirm={handleWarningConfirm}
        warningType={warningType}
        interactions={interactions}
        duplicates={duplicates}
        alternativeDrugs={alternativeDrugs}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    padding: 8,
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  formContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary600,
    marginBottom: 16,
  },
  medicationTitle: {
    marginTop: 24,
  },
  input: {
    marginBottom: 16,
  },
  medicationsList: {
    marginBottom: 16,
  },
  medicationItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  medicationDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  medicationTimingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 6,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 12,
    color: '#666',
  },
  dateSeperator: {
    marginHorizontal: 8,
    color: '#888',
    fontSize: 12,
  },
  medicationInstructions: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  instructionsLabel: {
    fontWeight: '600',
    color: '#555',
  },
  medicationNotes: {
    fontSize: 12,
    color: '#888',
  },
  notesLabel: {
    fontWeight: '600',
    color: '#777',
  },
  emptyMedications: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E0E0E0',
    marginBottom: 16,
  },
  emptyMedicationsText: {
    fontSize: 14,
    color: '#888',
  },
  addMedicationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary500,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  addMedicationButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
    marginLeft: 8,
  },
  footer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  submitButton: {
    backgroundColor: Colors.primary500,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: Colors.primary300,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default AddPrescriptionScreen;