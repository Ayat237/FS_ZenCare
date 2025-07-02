import React, { useState, useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  FlatList, 
  ScrollView,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Animated
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card } from '@components/ui';
import Colors from '@theme/colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E9F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary500,
  },
  addButton: {
    backgroundColor: Colors.primary300,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  categoryFilter: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E9F0',
  },
  categoryButton: {
    padding: 10,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#F0F4F8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary300,
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary600,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  categoryIcon: {
    marginRight: 4,
  },
  medicationList: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingTop: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8D95A9',
    textAlign: 'center',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    padding: 0,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardHeaderRight: {
    alignItems: 'flex-end',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statusContainer: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cardDetails: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E9F0',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#718096',
    width: 100,
  },
  detailValue: {
    fontSize: 14,
    color: '#2D3748',
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E9F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary500,
  },
  closeButton: {
    padding: 8,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#2D3748',
  },
  pickerContainer: {
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    marginBottom: 16,
  },
  datePickerButton: {
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#2D3748',
  },
  submitButton: {
    backgroundColor: Colors.primary300,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  medicineTypeTag: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  medicineTypeText: {
    color: Colors.primary400,
    fontSize: 12,
    fontWeight: '500',
  },
  drugIdContainer: {
    backgroundColor: '#F0FFF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  drugIdText: {
    color: '#38A169',
    fontSize: 12,
    fontWeight: '500',
  },
  timingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  timingText: {
    fontSize: 14,
    color: '#4A5568',
    marginLeft: 4,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
});

interface Medication {
  id: string;
  medicineName: string;
  medicineType: string;
  drugId: string;
  dose: number;
  frequency: string;
  timesPerDay: number;
  startHour: number;
  startDateTime: string;
  endDateTime: string;
  intakeInstructions: string;
  notes?: string;
  category?: string;
  status?: 'active' | 'completed' | 'expired';
}

const dummyMedications: Medication[] = [
  {
    id: "1",
    medicineName: "Vitamin D2",
    medicineType: "Pills",
    drugId: "1003-5789",
    dose: 2,
    frequency: "Daily",
    timesPerDay: 2,
    startHour: 8,
    startDateTime: "2024-01-01",
    endDateTime: "2024-12-31",
    intakeInstructions: "After eat",
    notes: "Take after breakfast",
    status: "active",
    category: "vitamin"
  },
  {
    id: "2",
    medicineName: "Lisinopril",
    medicineType: "Tablets",
    drugId: "2045-7823",
    dose: 10,
    frequency: "Daily",
    timesPerDay: 1,
    startHour: 20,
    startDateTime: "2024-01-15",
    endDateTime: "2024-07-15",
    intakeInstructions: "Before sleep",
    notes: "Take on empty stomach",
    status: "active",
    category: "heart"
  },
  {
    id: "3",
    medicineName: "Metformin",
    medicineType: "Tablets",
    drugId: "3078-9245",
    dose: 850,
    frequency: "Daily",
    timesPerDay: 2,
    startHour: 18,
    startDateTime: "2024-02-10",
    endDateTime: "2024-08-10",
    intakeInstructions: "With meal",
    notes: "Take with evening meal",
    status: "active",
    category: "diabetes"
  },
  {
    id: "4",
    medicineName: "Ibuprofen",
    medicineType: "Capsules",
    drugId: "4012-6357",
    dose: 400,
    frequency: "As needed",
    timesPerDay: 3,
    startHour: 8,
    startDateTime: "2024-03-05",
    endDateTime: "2024-03-15",
    intakeInstructions: "With food",
    notes: "Take with food if stomach upset occurs",
    status: "completed",
    category: "pain"
  },
  {
    id: "5",
    medicineName: "Atorvastatin",
    medicineType: "Tablets",
    drugId: "5089-3421",
    dose: 20,
    frequency: "Daily",
    timesPerDay: 1,
    startHour: 21,
    startDateTime: "2024-01-20",
    endDateTime: "2024-07-20",
    intakeInstructions: "Before sleep",
    notes: "Take at bedtime",
    status: "active",
    category: "heart"
  },
  {
    id: "6",
    medicineName: "Levothyroxine",
    medicineType: "Tablets",
    drugId: "6123-7890",
    dose: 75,
    frequency: "Daily",
    timesPerDay: 1,
    startHour: 7,
    startDateTime: "2023-12-15",
    endDateTime: "2024-06-15",
    intakeInstructions: "Empty stomach",
    notes: "Take on empty stomach, 30-60 minutes before breakfast",
    status: "active",
    category: "thyroid"
  },
  {
    id: "7",
    medicineName: "Omeprazole",
    medicineType: "Capsules",
    drugId: "7456-1230",
    dose: 20,
    frequency: "Daily",
    timesPerDay: 1,
    startHour: 7,
    startDateTime: "2024-02-01",
    endDateTime: "2024-05-01",
    intakeInstructions: "Before breakfast",
    notes: "Take 30 minutes before breakfast",
    status: "active",
    category: "digestive"
  },
  {
    id: "8",
    medicineName: "Amoxicillin",
    medicineType: "Capsules",
    drugId: "8234-5678",
    dose: 500,
    frequency: "Every 8 hours",
    timesPerDay: 3,
    startHour: 8,
    startDateTime: "2024-04-01",
    endDateTime: "2024-04-10",
    intakeInstructions: "With or without food",
    notes: "Complete the full course even if feeling better",
    status: "expired",
    category: "antibiotic"
  },
  {
    id: "9",
    medicineName: "Loratadine",
    medicineType: "Tablets",
    drugId: "9345-6789",
    dose: 10,
    frequency: "Daily",
    timesPerDay: 1,
    startHour: 10,
    startDateTime: "2024-03-15",
    endDateTime: "2024-09-15",
    intakeInstructions: "With or without food",
    notes: "Take for allergy symptoms",
    status: "active",
    category: "allergy"
  },
];

const MedicationItem = ({ item }: { item: Medication }) => {
  const [expanded, setExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;

  // Get status color and background
  const getStatusStyle = () => {
    switch (item.status) {
      case 'active':
        return { color: '#FFFFFF', backgroundColor: '#4CAF50' }; // Green
      case 'completed':
        return { color: '#FFFFFF', backgroundColor: '#9E9E9E' }; // Grey
      case 'expired':
        return { color: '#FFFFFF', backgroundColor: '#F44336' }; // Red
      default:
        return { color: '#FFFFFF', backgroundColor: '#9E9E9E' }; // Grey
    }
  };

  // Format time from hour
  const formatTime = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour} ${ampm}`;
  };

  // Toggle expanded state with animation
  const toggleExpand = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    
    Animated.timing(animatedHeight, {
      toValue: newExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <Card
      style={styles.card}
      onPress={toggleExpand}
      elevation={3}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardTitle}>{item.medicineName}</Text>
          <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 6}}>
            <View style={styles.medicineTypeTag}>
              <Text style={styles.medicineTypeText}>{item.medicineType}</Text>
            </View>
            <View style={styles.drugIdContainer}>
              <Text style={styles.drugIdText}>ID: {item.drugId}</Text>
            </View>
          </View>
          <View style={styles.timingContainer}>
            <Icon name="clock-outline" size={14} color="#718096" />
            <Text style={styles.timingText}>
              {formatTime(item.startHour)}, {item.timesPerDay}x {item.frequency}
            </Text>
          </View>
        </View>
        <View style={styles.cardHeaderRight}>
          <View style={[styles.statusContainer, { backgroundColor: getStatusStyle().backgroundColor }]}>
            <Text style={[styles.status, { color: getStatusStyle().color }]}>
              {item.status?.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {expanded && (
        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Dose:</Text>
            <Text style={styles.detailValue}>{item.dose} {item.medicineType}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Frequency:</Text>
            <Text style={styles.detailValue}>{item.frequency}, {item.timesPerDay} times per day</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Start time:</Text>
            <Text style={styles.detailValue}>{formatTime(item.startHour)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Instructions:</Text>
            <Text style={styles.detailValue}>{item.intakeInstructions}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Notes:</Text>
            <Text style={styles.detailValue}>{item.notes || 'No notes'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Period:</Text>
            <Text style={styles.detailValue}>
              {new Date(item.startDateTime).toLocaleDateString()} - 
              {new Date(item.endDateTime).toLocaleDateString()}
            </Text>
          </View>
        </View>
      )}
    </Card>
  );
};

// Define the form state interface
interface MedicationFormState {
  medicineName: string;
  medicineType: string;
  drugId: string;
  dose: string;
  frequency: string;
  timesPerDay: string;
  startHour: number;
  startDateTime: Date;
  endDateTime: Date;
  intakeInstructions: string;
  notes: string;
}

const MedicationsScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [medications, setMedications] = useState<Medication[]>(dummyMedications);
  const [formState, setFormState] = useState<MedicationFormState>({
    medicineName: '',
    medicineType: 'Pills',
    drugId: '',
    dose: '',
    frequency: 'Daily',
    timesPerDay: '1',
    startHour: 8,
    startDateTime: new Date(),
    endDateTime: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    intakeInstructions: '',
    notes: ''
  });

  // Define all available categories from medications
  const allCategories = ['all', ...Array.from(new Set(medications.map(med => med.category || 'other')))];

  // Get icon name based on category
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'all': return 'pill';
      case 'vitamin': return 'pill'; // Changed from 'vitamin' to 'pill-multiple'
      case 'heart': return 'heart';
      case 'diabetes': return 'diabetes';
      case 'pain': return 'bandage';
      case 'thyroid': return 'medical-bag';
      case 'digestive': return 'stomach';
      case 'antibiotic': return 'bacteria';
      case 'allergy': return 'weather-windy'; // Changed from 'weather-dust' to 'weather-windy'
      default: return 'pill';
    }
  };

  // Filter medications based on selected category
  const filteredMedications = useMemo(() => {
    if (selectedCategory === null) {
      return medications;
    }
    return medications.filter(med => med.category === selectedCategory);
  }, [selectedCategory, medications]);

  // Handle form input changes
  const handleInputChange = (name: keyof MedicationFormState, value: any) => {
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = () => {
    // Create new medication object
    const newMedication: Medication = {
      id: (medications.length + 1).toString(),
      medicineName: formState.medicineName,
      medicineType: formState.medicineType,
      drugId: formState.drugId || `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      dose: parseInt(formState.dose) || 0,
      frequency: formState.frequency,
      timesPerDay: parseInt(formState.timesPerDay) || 1,
      startHour: formState.startHour,
      startDateTime: formState.startDateTime.toISOString().split('T')[0],
      endDateTime: formState.endDateTime.toISOString().split('T')[0],
      intakeInstructions: formState.intakeInstructions,
      notes: formState.notes,
      status: 'active',
      category: formState.medicineName.toLowerCase().includes('vitamin') ? 'vitamin' : 'other'
    };

    // Add new medication to the list
    setMedications(prev => [newMedication, ...prev]);

    // Reset form and close modal
    setFormState({
      medicineName: '',
      medicineType: 'Pills',
      drugId: '',
      dose: '',
      frequency: 'Daily',
      timesPerDay: '1',
      startHour: 8,
      startDateTime: new Date(),
      endDateTime: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      intakeInstructions: '',
      notes: ''
    });
    setModalVisible(false);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Medications</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Icon name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.categoryFilter}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {allCategories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === (category === 'all' ? null : category) && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category === 'all' ? null : category)}
            >
              <Icon
                name={getCategoryIcon(category)}
                size={18}
                color={selectedCategory === (category === 'all' ? null : category) ? '#FFFFFF' : Colors.primary500}
              />
              <Text 
                style={[
                  styles.categoryText,
                  selectedCategory === (category === 'all' ? null : category) && styles.categoryTextActive
                ]}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredMedications}
        renderItem={({ item }) => <MedicationItem item={item} />}
        contentContainerStyle={styles.medicationList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="pill-off" size={60} color={Colors.primary300} />
            <Text style={styles.emptyText}>No medications found</Text>
          </View>
        }
      />

      {/* Add Medication Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Medication</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Icon name="close" size={24} color={Colors.primary500} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollViewContent}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Medicine Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter medicine name"
                  value={formState.medicineName}
                  onChangeText={(text) => handleInputChange('medicineName', text)}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Medicine Type</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formState.medicineType}
                      onValueChange={(value:any) => handleInputChange('medicineType', value)}
                    >
                      <Picker.Item label="Pills" value="Pills" />
                      <Picker.Item label="Tablets" value="Tablets" />
                      <Picker.Item label="Capsules" value="Capsules" />
                      <Picker.Item label="Liquid" value="Liquid" />
                      <Picker.Item label="Injection" value="Injection" />
                      <Picker.Item label="Drops" value="Drops" />
                      <Picker.Item label="Inhaler" value="Inhaler" />
                      <Picker.Item label="Patch" value="Patch" />
                    </Picker>
                  </View>
                </View>

                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Drug ID (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter drug ID"
                    value={formState.drugId}
                    onChangeText={(text) => handleInputChange('drugId', text)}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Dose</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter dose amount"
                    keyboardType="numeric"
                    value={formState.dose}
                    onChangeText={(text) => handleInputChange('dose', text)}
                  />
                </View>

                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Frequency</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formState.frequency}
                      onValueChange={(value:any) => handleInputChange('frequency', value)}
                    >
                      <Picker.Item label="Daily" value="Daily" />
                      <Picker.Item label="Weekly" value="Weekly" />
                      <Picker.Item label="Monthly" value="Monthly" />
                      <Picker.Item label="As needed" value="As needed" />
                      <Picker.Item label="Every 8 hours" value="Every 8 hours" />
                      <Picker.Item label="Every 12 hours" value="Every 12 hours" />
                    </Picker>
                  </View>
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Times Per Day</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formState.timesPerDay}
                      onValueChange={(value:any) => handleInputChange('timesPerDay', value)}
                    >
                      <Picker.Item label="1" value="1" />
                      <Picker.Item label="2" value="2" />
                      <Picker.Item label="3" value="3" />
                      <Picker.Item label="4" value="4" />
                    </Picker>
                  </View>
                </View>

                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Start Hour</Text>
                  <TouchableOpacity 
                    style={styles.datePickerButton}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Text style={styles.dateText}>
                      {formState.startHour % 12 || 12}:00 {formState.startHour >= 12 ? 'PM' : 'AM'}
                    </Text>
                    <Icon name="clock-outline" size={20} color="#718096" />
                  </TouchableOpacity>
                  {showTimePicker && (
                    <DateTimePicker
                      value={new Date(new Date().setHours(formState.startHour, 0, 0))}
                      mode="time"
                      is24Hour={false}
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowTimePicker(false);
                        if (selectedDate) {
                          handleInputChange('startHour', selectedDate.getHours());
                        }
                      }}
                    />
                  )}
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Start Date</Text>
                  <TouchableOpacity 
                    style={styles.datePickerButton}
                    onPress={() => setShowStartDatePicker(true)}
                  >
                    <Text style={styles.dateText}>{formatDate(formState.startDateTime)}</Text>
                    <Icon name="calendar" size={20} color="#718096" />
                  </TouchableOpacity>
                  {showStartDatePicker && (
                    <DateTimePicker
                      value={formState.startDateTime}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowStartDatePicker(false);
                        if (selectedDate) {
                          handleInputChange('startDateTime', selectedDate);
                        }
                      }}
                    />
                  )}
                </View>

                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={styles.label}>End Date</Text>
                  <TouchableOpacity 
                    style={styles.datePickerButton}
                    onPress={() => setShowEndDatePicker(true)}
                  >
                    <Text style={styles.dateText}>{formatDate(formState.endDateTime)}</Text>
                    <Icon name="calendar" size={20} color="#718096" />
                  </TouchableOpacity>
                  {showEndDatePicker && (
                    <DateTimePicker
                      value={formState.endDateTime}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowEndDatePicker(false);
                        if (selectedDate) {
                          handleInputChange('endDateTime', selectedDate);
                        }
                      }}
                    />
                  )}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Intake Instructions</Text>
                <TextInput
                  style={styles.input}
                  placeholder="E.g., After eat, Before sleep"
                  value={formState.intakeInstructions}
                  onChangeText={(text) => handleInputChange('intakeInstructions', text)}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                  placeholder="Add any additional notes"
                  multiline
                  numberOfLines={3}
                  value={formState.notes}
                  onChangeText={(text) => handleInputChange('notes', text)}
                />
              </View>

              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>Add Medication</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};


export default MedicationsScreen;
