import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '@theme/colors';
import { DrawerScreenProps } from '@/types/navigation';
import { Prescription, Medication, MedicationFormData } from '@/types/prescription';

const dummyPrescriptions: Prescription[] = [
  {
    id: '1',
    diseaseName: 'Bacterial Infection',
    diseaseType: 'Respiratory',
    doctor: 'Dr. Sarah Johnson',
    date: 'May 1, 2023',
    status: 'active',
    medications: [
      {
        id: '1-1',
        name: 'Amoxicillin',
        dosage: '500mg',
        frequency: 'Three times daily',
        startDate: 'May 1, 2023',
        endDate: 'May 10, 2023',
        refillsLeft: 2,
        instructions: 'Take with food. Complete the full course even if you feel better.',
        image: require('@/assets/images/drugs2.png'),
        category: 'Antibiotic',
        status: 'active',
        nextRefillDate: 'May 8, 2023',
      },
      {
        id: '1-2',
        name: 'Acetaminophen',
        dosage: '500mg',
        frequency: 'As needed for fever',
        startDate: 'May 1, 2023',
        endDate: 'May 10, 2023',
        refillsLeft: 1,
        instructions: 'Take if fever develops. Do not exceed 4000mg in 24 hours.',
        image: require('@/assets/images/drugs.png'),
        category: 'Pain Relief',
        status: 'active',
        nextRefillDate: 'May 8, 2023',
      }
    ],
  },
  {
    id: '2',
    diseaseName: 'Hypertension',
    diseaseType: 'Cardiovascular',
    doctor: 'Dr. Michael Chen',
    date: 'April 15, 2023',
    status: 'active',
    medications: [
      {
        id: '2-1',
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        startDate: 'April 15, 2023',
        endDate: 'Ongoing',
        refillsLeft: 5,
        instructions: 'Take in the morning. Monitor blood pressure regularly.',
        image: require('@/assets/images/drugs.png'),
        category: 'Blood Pressure',
        status: 'active',
        nextRefillDate: 'May 15, 2023',
      }
    ],
  },
  {
    id: '3',
    diseaseName: 'Lower Back Pain',
    diseaseType: 'Musculoskeletal',
    doctor: 'Dr. Emily Rodriguez',
    date: 'April 20, 2023',
    status: 'active',
    medications: [
      {
        id: '3-1',
        name: 'Ibuprofen',
        dosage: '400mg',
        frequency: 'As needed for pain',
        startDate: 'April 20, 2023',
        endDate: 'May 20, 2023',
        refillsLeft: 1,
        instructions: 'Take with food or milk to prevent stomach upset. Do not exceed 1200mg in 24 hours.',
        image: require('@/assets/images/drugs.png'),
        category: 'Pain Relief',
        status: 'active',
        nextRefillDate: 'May 10, 2023',
      },
      {
        id: '3-2',
        name: 'Cyclobenzaprine',
        dosage: '5mg',
        frequency: 'Three times daily',
        startDate: 'April 20, 2023',
        endDate: 'May 5, 2023',
        refillsLeft: 0,
        instructions: 'May cause drowsiness. Do not drive or operate machinery.',
        image: require('@/assets/images/drugs2.png'),
        category: 'Muscle Relaxant',
        status: 'completed',
        nextRefillDate: '',
      }
    ],
  },
  {
    id: '4',
    diseaseName: 'Hypercholesterolemia',
    diseaseType: 'Metabolic',
    doctor: 'Dr. Michael Chen',
    date: 'March 10, 2023',
    status: 'expired',
    medications: [
      {
        id: '4-1',
        name: 'Atorvastatin',
        dosage: '20mg',
        frequency: 'Once daily at bedtime',
        startDate: 'March 10, 2023',
        endDate: 'Ongoing',
        refillsLeft: 0,
        instructions: 'Take at the same time each day. Avoid grapefruit juice while taking this medication.',
        image: require('@/assets/images/drugs2.png'),
        category: 'Cholesterol',
        status: 'expired',
        nextRefillDate: 'April 10, 2023',
      }
    ],
  },
];

const PrescriptionsScreen: React.FC<DrawerScreenProps<'Prescriptions'>> = ({ navigation }) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(dummyPrescriptions);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPrescription, setCurrentPrescription] = useState<Prescription | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  
  // Form state for prescription
  const [diseaseName, setDiseaseName] = useState('');
  const [diseaseType, setDiseaseType] = useState('');
  const [doctor, setDoctor] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState<'active' | 'completed' | 'expired'>('active');
  
  // State for medications
  const [medications, setMedications] = useState<MedicationFormData[]>([]);
  
  // State for current medication being edited
  const [currentMedicationIndex, setCurrentMedicationIndex] = useState<number | null>(null);
  const [medicationModalVisible, setMedicationModalVisible] = useState(false);
  
  // Form state for medication
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [refillsLeft, setRefillsLeft] = useState('');
  const [instructions, setInstructions] = useState('');
  const [category, setCategory] = useState('');
  const [medicationStatus, setMedicationStatus] = useState<'active' | 'completed' | 'expired'>('active');
  const [nextRefillDate, setNextRefillDate] = useState('');

  const resetForm = () => {
    // Reset prescription form
    setDiseaseName('');
    setDiseaseType('');
    setDoctor('');
    setDate('');
    setStatus('active');
    setMedications([]);
    setCurrentPrescription(null);
    setEditMode(false);
  };
  
  const resetMedicationForm = () => {
    // Reset medication form
    setMedicationName('');
    setDosage('');
    setFrequency('');
    setStartDate('');
    setEndDate('');
    setRefillsLeft('');
    setInstructions('');
    setCategory('');
    setMedicationStatus('active');
    setNextRefillDate('');
    setCurrentMedicationIndex(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (prescription: Prescription) => {
    setCurrentPrescription(prescription);
    setDiseaseName(prescription.diseaseName);
    setDiseaseType(prescription.diseaseType || '');
    setDoctor(prescription.doctor);
    setDate(prescription.date);
    setStatus(prescription.status || 'active');
    
    // Copy medications to form state
    const medicationForms = prescription.medications.map(med => ({
      id: med.id,
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      startDate: med.startDate,
      endDate: med.endDate,
      refillsLeft: med.refillsLeft,
      instructions: med.instructions,
      category: med.category || '',
      status: med.status || 'active',
      nextRefillDate: med.nextRefillDate || ''
    }));
    
    setMedications(medicationForms);
    setEditMode(true);
    setModalVisible(true);
  };
  
  const openAddMedicationModal = () => {
    resetMedicationForm();
    setMedicationModalVisible(true);
  };
  
  const openEditMedicationModal = (index: number) => {
    const medication = medications[index];
    setCurrentMedicationIndex(index);
    setMedicationName(medication.name);
    setDosage(medication.dosage);
    setFrequency(medication.frequency);
    setStartDate(medication.startDate);
    setEndDate(medication.endDate);
    setRefillsLeft(medication.refillsLeft.toString());
    setInstructions(medication.instructions);
    setCategory(medication.category || '');
    setMedicationStatus(medication.status || 'active');
    setNextRefillDate(medication.nextRefillDate || '');
    setMedicationModalVisible(true);
  };

  const handleSaveMedication = () => {
    // Validate medication form
    if (!medicationName || !dosage || !frequency || !startDate) {
      Alert.alert('Error', 'Please fill in all required medication fields');
      return;
    }

    const medicationData: MedicationFormData = {
      id: currentMedicationIndex !== null && medications[currentMedicationIndex]?.id 
        ? medications[currentMedicationIndex].id 
        : Date.now().toString(),
      name: medicationName,
      dosage,
      frequency,
      startDate,
      endDate,
      refillsLeft: parseInt(refillsLeft) || 0,
      instructions,
      category,
      status: medicationStatus,
      nextRefillDate,
    };

    if (currentMedicationIndex !== null) {
      // Update existing medication
      const updatedMedications = [...medications];
      updatedMedications[currentMedicationIndex] = medicationData;
      setMedications(updatedMedications);
    } else {
      // Add new medication
      setMedications([...medications, medicationData]);
    }

    setMedicationModalVisible(false);
    resetMedicationForm();
  };

  const handleSave = () => {
    // Validate prescription form
    if (!diseaseName || !doctor || !date) {
      Alert.alert('Error', 'Please fill in all required prescription fields');
      return;
    }

    if (medications.length === 0) {
      Alert.alert('Error', 'Please add at least one medication');
      return;
    }

    if (editMode && currentPrescription) {
      // Update existing prescription
      const updatedPrescriptions = prescriptions.map(p => 
        p.id === currentPrescription.id 
          ? {
              ...p,
              diseaseName,
              diseaseType,
              doctor,
              date,
              status,
              medications: medications.map(med => ({
                id: med.id || Date.now().toString(),
                name: med.name,
                dosage: med.dosage,
                frequency: med.frequency,
                startDate: med.startDate,
                endDate: med.endDate,
                refillsLeft: typeof med.refillsLeft === 'string' ? parseInt(med.refillsLeft) : med.refillsLeft,
                instructions: med.instructions,
                category: med.category,
                status: med.status,
                nextRefillDate: med.nextRefillDate,
                image: med.image || require('@/assets/images/drugs.png'), // Keep existing image or use default
              })),
            }
          : p
      );
      setPrescriptions(updatedPrescriptions);
    } else {
      // Add new prescription
      const newPrescription: Prescription = {
        id: Date.now().toString(),
        diseaseName,
        diseaseType,
        doctor,
        date,
        status,
        medications: medications.map(med => ({
          id: med.id || Date.now().toString(),
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          startDate: med.startDate,
          endDate: med.endDate,
          refillsLeft: typeof med.refillsLeft === 'string' ? parseInt(med.refillsLeft) : med.refillsLeft,
          instructions: med.instructions,
          category: med.category,
          status: med.status,
          nextRefillDate: med.nextRefillDate,
          image: require('@/assets/images/drugs.png'), // Default image
        })),
      };
      setPrescriptions([...prescriptions, newPrescription]);
    }

    setModalVisible(false);
    resetForm();
  };
  
  const handleRemoveMedication = (index: number) => {
    Alert.alert(
      'Confirm Remove',
      'Are you sure you want to remove this medication?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          onPress: () => {
            const updatedMedications = [...medications];
            updatedMedications.splice(index, 1);
            setMedications(updatedMedications);
          },
          style: 'destructive',
        },
      ],
    );
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this prescription?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            const updatedPrescriptions = prescriptions.filter(p => p.id !== id);
            setPrescriptions(updatedPrescriptions);
          },
          style: 'destructive',
        },
      ],
    );
  };

  const renderMedicationItem = (medication: Medication, index: number) => (
    <View key={medication.id} style={styles.medicationItem}>
      <View style={styles.medicationItemHeader}>
        <Text style={styles.medicationItemName}>{medication.name}</Text>
        {medication.category && (
          <Text style={styles.medicationItemCategory}>{medication.category}</Text>
        )}
      </View>
      <Text style={styles.medicationItemDetail}><Text style={{fontWeight: '600'}}>Dosage:</Text> {medication.dosage}</Text>
      <Text style={styles.medicationItemDetail}><Text style={{fontWeight: '600'}}>Period:</Text> {medication.startDate} {medication.endDate ? `- ${medication.endDate}` : '(ongoing)'}</Text>
      <Text style={styles.medicationItemDetail}><Text style={{fontWeight: '600'}}>Frequency:</Text> {medication.frequency}</Text>
      {medication.refillsLeft !== undefined && (
        <Text style={styles.medicationItemDetail}><Text style={{fontWeight: '600'}}>Refills left:</Text> {medication.refillsLeft}</Text>
      )}
      {medication.nextRefillDate && (
        <Text style={styles.medicationItemDetail}><Text style={{fontWeight: '600'}}>Next refill:</Text> {medication.nextRefillDate}</Text>
      )}
      {medication.instructions ? (
        <Text style={styles.medicationItemInstructions}>{medication.instructions}</Text>
      ) : null}
    </View>
  );

  const renderPrescriptionItem = ({ item }: { item: Prescription }) => (
    <View style={styles.prescriptionCard}>
      <View style={styles.prescriptionHeader}>
        <View style={styles.prescriptionTitleContainer}>
          <Text style={styles.prescriptionName}>{item.diseaseName}</Text>
          {item.diseaseType && (
            <Text style={styles.diseaseTypeTag}>{item.diseaseType}</Text>
          )}
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => openEditModal(item)}
          >
            <Icon name="pencil" size={16} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item.id)}
          >
            <Icon name="delete" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.prescriptionDate}>
        <Icon name="calendar" size={14} color={Colors.primary400} /> {item.date}
      </Text>
      
      <Text style={styles.prescriptionDoctor}>
        <Icon name="doctor" size={14} color={Colors.primary400} /> Prescribed by: {item.doctor}
      </Text>
      
      {item.status && (
        <View style={[styles.statusButton, 
          item.status === 'active' ? { backgroundColor: Colors.success100, borderColor: Colors.success500 } :
          item.status === 'completed' ? { backgroundColor: Colors.primary100, borderColor: Colors.primary500 } :
          { backgroundColor: Colors.error100, borderColor: Colors.error500 }
        ]}>
          <Text style={[styles.statusText, 
            item.status === 'active' ? { color: Colors.success500 } :
            item.status === 'completed' ? { color: Colors.primary500 } :
            { color: Colors.error500 }
          ]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      )}
      
      <Text style={styles.medicationsHeader}>Medications</Text>
      {item.medications.map((medication, index) => 
        renderMedicationItem(medication, index)
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color={Colors.primary600} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Prescriptions</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={openAddModal}
        >
          <Icon name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {prescriptions.length > 0 ? (
        <FlatList
          data={prescriptions}
          keyExtractor={(item) => item.id}
          renderItem={renderPrescriptionItem}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="pill" size={60} color={Colors.primary300} />
          <Text style={styles.emptyText}>No prescriptions found</Text>
          <Text style={styles.emptySubtext}>Tap the + button to add a prescription</Text>
        </View>
      )}

      {/* Add/Edit Prescription Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editMode ? 'Edit Prescription' : 'Add New Prescription'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Icon name="close" size={24} color={Colors.primary600} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Disease Name *</Text>
                <TextInput
                  style={styles.formInput}
                  value={diseaseName}
                  onChangeText={setDiseaseName}
                  placeholder="Enter disease name"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Disease Type</Text>
                <TextInput
                  style={styles.formInput}
                  value={diseaseType}
                  onChangeText={setDiseaseType}
                  placeholder="e.g., Respiratory, Cardiovascular"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Prescribed By *</Text>
                <TextInput
                  style={styles.formInput}
                  value={doctor}
                  onChangeText={setDoctor}
                  placeholder="Doctor's name"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Date *</Text>
                <TextInput
                  style={styles.formInput}
                  value={date}
                  onChangeText={setDate}
                  placeholder="e.g., May 1, 2023"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Status</Text>
                <View style={styles.statusContainer}>
                  <TouchableOpacity
                    style={[styles.statusButton, status === 'active' && styles.activeStatusButton]}
                    onPress={() => setStatus('active')}
                  >
                    <Text style={[styles.statusText, status === 'active' && styles.activeStatusText]}>Active</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.statusButton, status === 'completed' && styles.activeStatusButton]}
                    onPress={() => setStatus('completed')}
                  >
                    <Text style={[styles.statusText, status === 'completed' && styles.activeStatusText]}>Completed</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.statusButton, status === 'expired' && styles.activeStatusButton]}
                    onPress={() => setStatus('expired')}
                  >
                    <Text style={[styles.statusText, status === 'expired' && styles.activeStatusText]}>Expired</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.medicationsSection}>
                <View style={styles.medicationsSectionHeader}>
                  <Text style={styles.medicationsSectionTitle}>Medications</Text>
                  <TouchableOpacity 
                    style={styles.addMedicationButton}
                    onPress={openAddMedicationModal}
                  >
                    <Icon name="plus" size={16} color="#FFF" />
                    <Text style={styles.addMedicationButtonText}>Add Medication</Text>
                  </TouchableOpacity>
                </View>
                
                {medications.length > 0 ? (
                  <View style={styles.medicationsList}>
                    {medications.map((medication, index) => (
                      <View key={medication.id || index} style={styles.medicationListItem}>
                        <View style={styles.medicationListItemContent}>
                          <Text style={styles.medicationListItemName}>{medication.name}</Text>
                          <Text style={styles.medicationListItemDosage}>{medication.dosage}</Text>
                        </View>
                        <View style={styles.medicationListItemActions}>
                          <TouchableOpacity 
                            style={[styles.medicationActionButton, styles.editButton]}
                            onPress={() => openEditMedicationModal(index)}
                          >
                            <Icon name="pencil" size={14} color="#FFF" />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.medicationActionButton, styles.deleteButton]}
                            onPress={() => handleRemoveMedication(index)}
                          >
                            <Icon name="delete" size={14} color="#FFF" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.noMedicationsContainer}>
                    <Text style={styles.noMedicationsText}>No medications added yet</Text>
                    <Text style={styles.noMedicationsSubtext}>Tap the button above to add medications</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Save Prescription</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add/Edit Medication Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={medicationModalVisible}
        onRequestClose={() => {
          setMedicationModalVisible(false);
          resetMedicationForm();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {currentMedicationIndex !== null ? 'Edit Medication' : 'Add New Medication'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setMedicationModalVisible(false);
                  resetMedicationForm();
                }}
              >
                <Icon name="close" size={24} color={Colors.primary600} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Medication Name *</Text>
                <TextInput
                  style={styles.formInput}
                  value={medicationName}
                  onChangeText={setMedicationName}
                  placeholder="Enter medication name"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Dosage *</Text>
                <TextInput
                  style={styles.formInput}
                  value={dosage}
                  onChangeText={setDosage}
                  placeholder="e.g., 500mg"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Frequency *</Text>
                <TextInput
                  style={styles.formInput}
                  value={frequency}
                  onChangeText={setFrequency}
                  placeholder="e.g., Twice daily"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Start Date *</Text>
                <TextInput
                  style={styles.formInput}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="e.g., May 1, 2023"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>End Date</Text>
                <TextInput
                  style={styles.formInput}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="e.g., May 10, 2023 or Ongoing"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Category</Text>
                <TextInput
                  style={styles.formInput}
                  value={category}
                  onChangeText={setCategory}
                  placeholder="e.g., Antibiotic, Pain Relief"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Refills Left</Text>
                <TextInput
                  style={styles.formInput}
                  value={refillsLeft}
                  onChangeText={setRefillsLeft}
                  placeholder="e.g., 3"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Next Refill Date</Text>
                <TextInput
                  style={styles.formInput}
                  value={nextRefillDate}
                  onChangeText={setNextRefillDate}
                  placeholder="e.g., May 15, 2023"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Instructions</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  value={instructions}
                  onChangeText={setInstructions}
                  placeholder="Special instructions for taking this medication"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveMedication}
              >
                <Text style={styles.saveButtonText}>Save Medication</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary600,
  },
  addButton: {
    backgroundColor: Colors.primary500,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  prescriptionCard: {
    marginBottom: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  prescriptionTitleContainer: {
    flex: 1,
  },
  prescriptionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary600,
    marginBottom: 4,
  },
  prescriptionDosage: {
    fontSize: 16,
    color: Colors.primary400,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: Colors.primary300,
  },
  deleteButton: {
    backgroundColor: Colors.error500,
  },
  prescriptionDetails: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
  detailLabel: {
    fontWeight: '600',
    color: '#374151',
  },
  instructionsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  instructionsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary600,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
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
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary600,
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: Colors.primary500,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Status styles
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 4,
  },
  statusButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  activeStatusButton: {
    backgroundColor: Colors.primary500,
    borderColor: Colors.primary500,
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
  },
  activeStatusText: {
    color: '#FFF',
    fontWeight: '600',
  },
  // Medications section styles
  medicationsSection: {
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
  },
  medicationsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicationsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary600,
  },
  addMedicationButton: {
    backgroundColor: Colors.primary500,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addMedicationButtonText: {
    color: '#FFF',
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  medicationsList: {
    marginTop: 8,
  },
  medicationListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    marginBottom: 8,
  },
  medicationListItemContent: {
    flex: 1,
  },
  medicationListItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  medicationListItemDosage: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  medicationListItemActions: {
    flexDirection: 'row',
  },
  medicationActionButton: {
    borderRadius: 4,
    padding: 4,
    marginLeft: 6,
  },
  noMedicationsContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noMedicationsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  noMedicationsSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
  // Medication item in prescription card
  medicationItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  medicationItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  medicationItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  medicationItemCategory: {
    fontSize: 12,
    color: '#FFF',
    backgroundColor: Colors.primary400,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  medicationItemDetail: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  medicationItemInstructions: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  diseaseTypeTag: {
    fontSize: 12,
    color: '#FFF',
    backgroundColor: Colors.secondary500,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  prescriptionDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  prescriptionDoctor: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 16,
  },
  medicationsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary600,
    marginBottom: 8,
    marginTop: 8,
  },
});

export default PrescriptionsScreen;