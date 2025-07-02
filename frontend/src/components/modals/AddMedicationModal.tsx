import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '@theme/colors';
import InputField from '@components/ui/inputs/InputField';
import MedicationDatePickerModal from './MedicationDatePickerModal';
import { searchDrugs } from '../../services/api/drugService';
import { Drug } from '../../types';

// Types

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
  selectedDays?: string[];
}

// Enums for dropdown options
const IntakeInstruction = { 
  AFTER_EAT: "After eat", 
  WHILE_EATING: "While eating", 
  BEFORE_EAT: "Before eat", 
  AT_BEDTIME: "At Bedtime", 
  EMPTY_STOMACH: "Empty stomach", 
}; 

const DayOfWeek = { 
  SAT: "Sat", 
  SUN: "Sun", 
  MON: "Mon", 
  TUE: "Tue", 
  WED: "Wed", 
  THU: "Thu", 
  FRI: "Fri", 
};

interface AddMedicationModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (medication: Medication) => void;
}

// Medicine type options
const medicineTypes = [
  'Pills',
  'Capsules',
  'Liquid',
  'Injection',
  'Inhaler',
  'Topical',
  'Drops',
  'Patch',
  'Other',
];

// Frequency options
const frequencyOptions = [
  'Daily',
  'Weekly',
  'Monthly',
  'As Needed',
];

const AddMedicationModal: React.FC<AddMedicationModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  // State for the medication form
  const [medication, setMedication] = useState<Medication>({
    medicineName: '',
    drugId: '',
    medicineType: '',
    dose: 1,
    frequency: '',
    timesPerDay: 1,
    startHour: 8,
    startDateTime: new Date().toISOString().split('T')[0],
    endDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    intakeInstructions: '',
    notes: '',
    selectedDays: [],
  });

  // State for form validation
  const [errors, setErrors] = useState({
    medicineName: '',
    medicineType: '',
    frequency: '',
    selectedDays: '',
    timesPerDay: '',
  });

  // State for dropdown modals
  const [showMedicineTypeDropdown, setShowMedicineTypeDropdown] = useState(false);
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);
  const [showIntakeInstructionsDropdown, setShowIntakeInstructionsDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerType, setDatePickerType] = useState<'start' | 'end'>('start');

  // State for autocomplete
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Drug[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  // Function to fetch drugs from API
  const fetchDrugs = async (query: string) => {
    setIsSearching(true);
    try {
      const drugs = await searchDrugs(query);
      setSearchResults(drugs);
    } catch (error: any) {
      console.error('Error fetching drugs:', error);
      // Fallback to empty results
      setSearchResults([]);
      
      // Show a more detailed error message
      let errorMessage = 'Failed to fetch drug data. Please try again.';
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Authentication error. Please log out and log in again.';
        } else if (error.response.data?.message) {
          errorMessage = `Error: ${error.response.data.message}`;
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle medicine name change with autocomplete
  const handleMedicineNameChange = (text: string) => {
    setMedication(prev => ({ ...prev, medicineName: text }));
    setSearchQuery(text);
    
    if (text.trim()) {
      setErrors(prev => ({ ...prev, medicineName: '' }));
      setShowAutocomplete(true);
      fetchDrugs(text);
    } else {
      setShowAutocomplete(false);
      setSearchResults([]);
    }
  };

  // Handle selecting a drug from autocomplete
  const handleSelectDrug = (drug: Drug) => {
    setMedication(prev => ({
      ...prev,
      medicineName: drug.name,
      drugId: drug.drugId,
    }));
    setShowAutocomplete(false);
  };

  // Handle medicine type selection
  const handleMedicineTypeSelect = (type: string) => {
    setMedication(prev => ({ ...prev, medicineType: type }));
    setErrors(prev => ({ ...prev, medicineType: '' }));
    setShowMedicineTypeDropdown(false);
  };

  // Handle frequency selection
  const handleFrequencySelect = (frequency: string) => {
    setMedication(prev => ({
      ...prev,
      frequency,
      // Reset selectedDays when changing frequency
      selectedDays: frequency === 'Weekly' ? prev.selectedDays : [],
    }));
    setErrors(prev => ({ ...prev, frequency: '' }));
    setShowFrequencyDropdown(false);
  };
  
  // Handle day selection for weekly frequency
  const handleDaySelect = (day: string) => {
    setMedication(prev => {
      const selectedDays = [...(prev.selectedDays || [])];
      const dayIndex = selectedDays.indexOf(day);
      
      if (dayIndex >= 0) {
        // Remove day if already selected
        selectedDays.splice(dayIndex, 1);
      } else {
        // Add day if not selected
        selectedDays.push(day);
      }
      
      return { ...prev, selectedDays };
    });
  };
  
  // Handle intake instruction selection
  const handleIntakeInstructionSelect = (instruction: string) => {
    setMedication(prev => ({ ...prev, intakeInstructions: instruction }));
    setShowIntakeInstructionsDropdown(false);
  };

  // Handle dose change
  const handleDoseChange = (text: string) => {
    const dose = parseInt(text) || 1;
    setMedication(prev => ({ ...prev, dose }));
  };

  // Handle times per day change
  const handleTimesPerDayChange = (text: string) => {
    const timesPerDay = parseInt(text) || 1;
    setMedication(prev => ({ ...prev, timesPerDay }));
  };

  // Handle start hour change
  const handleStartHourChange = (text: string) => {
    const startHour = parseInt(text) || 8;
    setMedication(prev => ({ ...prev, startHour: Math.min(Math.max(startHour, 0), 23) }));
  };

  // Handle opening date picker
  const handleOpenDatePicker = (type: 'start' | 'end') => {
    setDatePickerType(type);
    setDatePickerVisible(true);
  };
  
  // Handle date selection from date picker modal
  const handleDateChange = (date: string) => {
    setMedication(prev => ({
      ...prev,
      [datePickerType === 'start' ? 'startDateTime' : 'endDateTime']: date,
    }));
    setDatePickerVisible(false);
  };

  // Handle form submission
  const handleSubmit = () => {
    // Validate form
    let valid = true;
    const newErrors = { ...errors };

    if (!medication.medicineName.trim()) {
      newErrors.medicineName = 'Medicine name is required';
      valid = false;
    }

    if (!medication.medicineType.trim()) {
      newErrors.medicineType = 'Medicine type is required';
      valid = false;
    }

    if (!medication.frequency.trim()) {
      newErrors.frequency = 'Frequency is required';
      valid = false;
    }
    
    // Validate selected days if frequency is weekly
    if (medication.frequency === 'Weekly' && (!medication.selectedDays || medication.selectedDays.length === 0)) {
      newErrors.selectedDays = 'Please select at least one day';
      valid = false;
    } else {
      newErrors.selectedDays = '';
    }
    
    // Validate times per day if frequency is daily
    if (medication.frequency === 'Daily') {
      if (!medication.timesPerDay || parseInt(medication.timesPerDay.toString()) <= 0) {
        newErrors.timesPerDay = 'Please enter a valid number of times per day';
        valid = false;
      } else {
        newErrors.timesPerDay = '';
      }
    } else {
      newErrors.timesPerDay = '';
    }

    setErrors(newErrors);

    if (valid) {
      onSave(medication);
      onClose();
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Medication</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Medicine Name</Text>
              <View style={styles.autocompleteContainer}>
                <InputField
                  placeholder="Search medicine name"
                  value={medication.medicineName}
                  onChangeText={handleMedicineNameChange}
                  error={errors.medicineName}
                  style={styles.input}
                  label='Medicine Name'
                />
                
                {showAutocomplete && (
                  <View style={styles.autocompleteResults}>
                    {isSearching ? (
                      <ActivityIndicator size="small" color={Colors.primary500} />
                    ) : searchResults.length > 0 ? (
                      <View style={styles.autocompleteList}>
                        {searchResults.map((item) => (
                          <TouchableOpacity
                            key={item.drugId}
                            style={styles.autocompleteItem}
                            onPress={() => handleSelectDrug(item)}
                          >
                            <Text style={styles.autocompleteItemText}>{item.name}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ) : searchQuery.length > 0 ? (
                      <Text style={styles.noResultsText}>No medicines found</Text>
                    ) : null}
                  </View>
                )}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Medicine Type</Text>
              <TouchableOpacity
                style={[styles.dropdownButton, errors.medicineType ? styles.inputError : null]}
                onPress={() => setShowMedicineTypeDropdown(true)}
              >
                <Text style={styles.dropdownButtonText}>
                  {medication.medicineType || 'Select medicine type'}
                </Text>
                <Icon name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              {errors.medicineType ? (
                <Text style={styles.errorText}>{errors.medicineType}</Text>
              ) : null}

              <Modal
                visible={showMedicineTypeDropdown}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowMedicineTypeDropdown(false)}
              >
                <TouchableOpacity
                  style={styles.dropdownOverlay}
                  activeOpacity={1}
                  onPress={() => setShowMedicineTypeDropdown(false)}
                >
                  <View style={styles.dropdownModal}>
                    <Text style={styles.dropdownTitle}>Select Medicine Type</Text>
                    <FlatList
                      data={medicineTypes}
                      keyExtractor={(item) => item}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={() => handleMedicineTypeSelect(item)}
                        >
                          <Text style={styles.dropdownItemText}>{item}</Text>
                        </TouchableOpacity>
                      )}
                      style={styles.dropdownList}
                    />
                  </View>
                </TouchableOpacity>
              </Modal>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                {/* <Text style={styles.label}>Dose</Text> */}
                <InputField
                  placeholder="1"
                  value={medication.dose.toString()}
                  onChangeText={handleDoseChange}
                  keyboardType="numeric"
                  style={styles.input}
                  label='Dose'
                />
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                {/* <Text style={styles.label}>Start Hour</Text> */}
                <InputField
                  placeholder="8"
                  value={medication.startHour.toString()}
                  onChangeText={handleStartHourChange}
                  keyboardType="numeric"
                  style={styles.input}
                  label='Start Hour'
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Frequency</Text>
              <TouchableOpacity
                style={[styles.dropdownButton, errors.frequency ? styles.inputError : null]}
                onPress={() => setShowFrequencyDropdown(true)}
              >
                <Text style={styles.dropdownButtonText}>
                  {medication.frequency || 'Select frequency'}
                </Text>
                <Icon name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              {errors.frequency ? (
                <Text style={styles.errorText}>{errors.frequency}</Text>
              ) : null}

              <Modal
                visible={showFrequencyDropdown}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowFrequencyDropdown(false)}
              >
                <TouchableOpacity
                  style={styles.dropdownOverlay}
                  activeOpacity={1}
                  onPress={() => setShowFrequencyDropdown(false)}
                >
                  <View style={styles.dropdownModal}>
                    <Text style={styles.dropdownTitle}>Select Frequency</Text>
                    <FlatList
                      data={frequencyOptions}
                      keyExtractor={(item) => item}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={() => handleFrequencySelect(item)}
                        >
                          <Text style={styles.dropdownItemText}>{item}</Text>
                        </TouchableOpacity>
                      )}
                      style={styles.dropdownList}
                    />
                  </View>
                </TouchableOpacity>
              </Modal>
            </View>

            {medication.frequency === 'Daily' && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Times Per Day</Text>
                <InputField
                  placeholder="e.g., 3"
                  value={medication.timesPerDay.toString()}
                  onChangeText={(text) =>
                    setMedication(prev => ({ ...prev, timesPerDay: Number(text) }))
                  }
                  keyboardType="numeric"
                  style={styles.input}
                  label='Times Per Day'
                />
                {errors.timesPerDay ? (
                  <Text style={styles.errorText}>{errors.timesPerDay}</Text>
                ) : null}
              </View>
            )}
            
            {medication.frequency === 'Weekly' && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Days of Week</Text>
                <View style={styles.daysContainer}>
                  {Object.entries(DayOfWeek).map(([key, day]) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.dayButton,
                        medication.selectedDays?.includes(day) && styles.selectedDayButton
                      ]}
                      onPress={() => handleDaySelect(day)}
                    >
                      <Text style={[
                        styles.dayButtonText,
                        medication.selectedDays?.includes(day) && styles.dayButtonTextSelected
                      ]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.selectedDays ? (
                  <Text style={styles.errorText}>{errors.selectedDays}</Text>
                ) : null}
              </View>
            )}

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Start Date</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => handleOpenDatePicker('start')}
                >
                  <Text style={styles.dateButtonText}>
                    {formatDate(medication.startDateTime)}
                  </Text>
                  <Icon name="calendar" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>End Date</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => handleOpenDatePicker('end')}
                >
                  <Text style={styles.dateButtonText}>
                    {formatDate(medication.endDateTime)}
                  </Text>
                  <Icon name="calendar" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Date Picker Modal */}
            <MedicationDatePickerModal
              visible={datePickerVisible}
              onClose={() => setDatePickerVisible(false)}
              onConfirm={handleDateChange}
              initialDate={datePickerType === 'start' ? medication.startDateTime : medication.endDateTime}
              minDate={datePickerType === 'end' ? medication.startDateTime : undefined}
            />

            <View style={styles.formGroup}>
              <Text style={styles.label}>Intake Instructions</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowIntakeInstructionsDropdown(true)}
              >
                <Text style={styles.dropdownButtonText}>
                  {medication.intakeInstructions || 'Select intake instructions'}
                </Text>
                <Icon name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              
              <Modal
                visible={showIntakeInstructionsDropdown}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowIntakeInstructionsDropdown(false)}
              >
                <TouchableOpacity
                  style={styles.dropdownOverlay}
                  activeOpacity={1}
                  onPress={() => setShowIntakeInstructionsDropdown(false)}
                >
                  <View style={styles.dropdownModal}>
                    <Text style={styles.dropdownTitle}>Select Intake Instructions</Text>
                    <FlatList
                      data={Object.values(IntakeInstruction)}
                      keyExtractor={(item) => item}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={() => handleIntakeInstructionSelect(item)}
                        >
                          <Text style={styles.dropdownItemText}>{item}</Text>
                        </TouchableOpacity>
                      )}
                      style={styles.dropdownList}
                    />
                  </View>
                </TouchableOpacity>
              </Modal>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <InputField
                placeholder="Additional notes"
                value={medication.notes}
                onChangeText={(text) =>
                  setMedication(prev => ({ ...prev, notes: text }))
                }
                style={styles.input}
                label='Notes'
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSubmit}
            >
              <Text style={styles.saveButtonText}>Add Medication</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dayButton: {
    width: '13%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
  },
  selectedDayButton: {
    backgroundColor: Colors.primary500,
    borderColor: Colors.primary500,
  },
  dayButtonText: {
    fontSize: 14,
    color: '#333',
  },
  dayButtonTextSelected: {
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary600,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    marginBottom: 0,
  },
  inputError: {
    borderColor: Colors.error500,
  },
  errorText: {
    color: Colors.error500,
    fontSize: 12,
    marginTop: 4,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F8F9FA',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    width: '80%',
    maxHeight: '60%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary600,
    marginBottom: 16,
    textAlign: 'center',
  },
  dropdownList: {
    maxHeight: 300,
  },
  dropdownItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F8F9FA',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  autocompleteContainer: {
    position: 'relative',
    zIndex: 1,
  },
  autocompleteResults: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 2,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  autocompleteList: {
    maxHeight: 200,
  },
  autocompleteItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  autocompleteItemText: {
    fontSize: 16,
    color: '#333',
  },
  noResultsText: {
    padding: 16,
    textAlign: 'center',
    color: '#666',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.primary500,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
  },
});

export default AddMedicationModal;