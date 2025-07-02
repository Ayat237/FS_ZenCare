import React, { useState, useReducer } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../theme/colors';
import {
  PrescriptionCard,
  PrescriptionFormModal,
  PrescriptionDetailsModal,
  DeleteConfirmationModal,
} from '../../components/doctor';
import { mockPrescriptions } from '../../mockData/prescriptions';
import { Prescription, PrescriptionAction, PrescriptionState, FormMode } from '../../types/prescription';

// Reducer function for managing prescriptions
const prescriptionReducer = (state: PrescriptionState, action: PrescriptionAction): PrescriptionState => {
  switch (action.type) {
    case 'ADD_PRESCRIPTION':
      return {
        ...state,
        prescriptions: [...state.prescriptions, action.prescription],
      };
    case 'UPDATE_PRESCRIPTION':
      return {
        ...state,
        prescriptions: state.prescriptions.map((prescription) =>
          prescription.id === action.prescription.id ? action.prescription : prescription
        ),
      };
    case 'DELETE_PRESCRIPTION':
      return {
        ...state,
        prescriptions: state.prescriptions.filter(
          (prescription) => prescription.id !== action.id
        ),
      };
    default:
      return state;
  }
};

const DoctorPrescriptionScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // State for prescriptions using reducer
  const [state, dispatch] = useReducer(prescriptionReducer, {
    prescriptions: [...mockPrescriptions],
  });
  
  // State for modals
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [formMode, setFormMode] = useState<FormMode>('add');
  
  // Handlers for prescription actions
  const handleAddPrescription = () => {
    setSelectedPrescription(null);
    setFormMode('add');
    setFormModalVisible(true);
  };
  
  const handleViewPrescription = (id: string) => {
    const prescription = state.prescriptions.find((p) => p.id === id) || null;
    setSelectedPrescription(prescription);
    setDetailsModalVisible(true);
  };
  
  const handleEditPrescription = (id: string) => {
    const prescription = state.prescriptions.find((p) => p.id === id) || null;
    setSelectedPrescription(prescription);
    setFormMode('edit');
    setFormModalVisible(true);
  };
  
  const handleDeletePrescription = (id: string) => {
    const prescription = state.prescriptions.find((p) => p.id === id) || null;
    setSelectedPrescription(prescription);
    setDeleteModalVisible(true);
  };
  
  const confirmDeletePrescription = () => {
    if (selectedPrescription) {
      dispatch({
        type: 'DELETE_PRESCRIPTION',
        id: selectedPrescription.id,
      });
      setDeleteModalVisible(false);
    }
  };
  
  const handleSavePrescription = (prescription: Prescription) => {
    if (formMode === 'add') {
      dispatch({
        type: 'ADD_PRESCRIPTION',
        prescription: prescription,
      });
    } else {
      dispatch({
        type: 'UPDATE_PRESCRIPTION',
        prescription: prescription,
      });
    }
  };
  
  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Icon name="file-document-outline" size={64} color={Colors.primary300} />
      <Text style={styles.emptyStateText}>No prescriptions found</Text>
      <Text style={styles.emptyStateSubText}>
        Tap the + button to create a new prescription
      </Text>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={Colors.primary700} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prescriptions</Text>
      </View>
      
      <FlatList
        data={state.prescriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PrescriptionCard
            prescription={item}
            onView={handleViewPrescription}
            onEdit={handleEditPrescription}
            onDelete={handleDeletePrescription}
          />
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
      />
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddPrescription}
      >
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>
      
      {/* Prescription Form Modal */}
      <PrescriptionFormModal
        visible={formModalVisible}
        onClose={() => setFormModalVisible(false)}
        onSave={handleSavePrescription}
        prescription={selectedPrescription || undefined}
        mode={formMode}
      />
      
      {/* Prescription Details Modal */}
      <PrescriptionDetailsModal
        visible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
        prescription={selectedPrescription}
      />
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={confirmDeletePrescription}
        itemName={selectedPrescription?.patientName || ''}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary700,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80, // Extra padding for FAB
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 64,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary600,
    marginTop: 16,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary500,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});

export default DoctorPrescriptionScreen;