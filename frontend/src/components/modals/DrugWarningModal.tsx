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
import Colors from '@theme/colors';

// Types for the warning data
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

interface DrugWarningModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  warningType: 'interaction' | 'duplicate' | null;
  interactions?: DrugInteraction[];
  duplicates?: DrugDuplicate[];
  alternativeDrugs?: string[];
}

const DrugWarningModal: React.FC<DrugWarningModalProps> = ({
  visible,
  onClose,
  onConfirm,
  warningType,
  interactions = [],
  duplicates = [],
  alternativeDrugs = [],
}) => {
  // Get severity icon and color
  const getSeverityIcon = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return { name: 'alert-circle', color: Colors.error500 };
      case 'medium':
        return { name: 'alert', color: '#FFA500' }; // Orange
      case 'low':
        return { name: 'information', color: '#FFD700' }; // Gold
      default:
        return { name: 'information', color: Colors.primary500 };
    }
  };

  // Render interaction item
  const renderInteractionItem = ({ item }: { item: DrugInteraction }) => {
    const { name, color } = getSeverityIcon(item.severity);
    
    return (
      <View style={styles.warningItem}>
        <View style={styles.warningHeader}>
          <View style={styles.severityContainer}>
            <Icon name={name} size={20} color={color} style={styles.severityIcon} />
            <Text style={[styles.severityText, { color }]}>
              {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)} Severity
            </Text>
          </View>
        </View>
        <Text style={styles.warningTitle}>
          {item.drugA} + {item.drugB}
        </Text>
        <Text style={styles.warningDescription}>{item.description}</Text>
      </View>
    );
  };

  // Render duplicate item
  const renderDuplicateItem = ({ item }: { item: DrugDuplicate }) => (
    <View style={styles.warningItem}>
      <View style={styles.warningHeader}>
        <View style={styles.severityContainer}>
          <Icon name="content-duplicate" size={20} color={Colors.error500} style={styles.severityIcon} />
          <Text style={[styles.severityText, { color: Colors.error500 }]}>Duplicate Medication</Text>
        </View>
      </View>
      <Text style={styles.warningTitle}>{item.drugName}</Text>
      <Text style={styles.warningDescription}>
        Already prescribed in {item.existingPrescription} on {new Date(item.prescribedDate).toLocaleDateString()}
      </Text>
    </View>
  );

  // Render alternative drug item
  const renderAlternativeDrugItem = ({ item }: { item: string }) => (
    <View style={styles.alternativeItem}>
      <Icon name="pill" size={16} color={Colors.primary500} style={styles.alternativeIcon} />
      <Text style={styles.alternativeText}>{item}</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {warningType === 'interaction' ? 'Drug Interaction Warning' : 'Duplicate Medication Warning'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.warningContainer}>
              <Icon 
                name={warningType === 'interaction' ? 'pill-off' : 'content-duplicate'} 
                size={40} 
                color={Colors.error500} 
                style={styles.warningIcon} 
              />
              <Text style={styles.warningHeading}>
                {warningType === 'interaction' 
                  ? 'Potential Drug Interactions Found' 
                  : 'Duplicate Medications Found'}
              </Text>
              <Text style={styles.warningSubheading}>
                {warningType === 'interaction'
                  ? 'The following drug interactions were detected:'
                  : 'The following medications are already prescribed:'}
              </Text>
            </View>

            {warningType === 'interaction' ? (
              <FlatList
                data={interactions}
                keyExtractor={(_, index) => `warning-${index}`}
                renderItem={renderInteractionItem}
                scrollEnabled={false}
                style={styles.warningList}
              />
            ) : (
              <FlatList
                data={duplicates}
                keyExtractor={(_, index) => `warning-${index}`}
                renderItem={renderDuplicateItem}
                scrollEnabled={false}
                style={styles.warningList}
              />
            )}

            {alternativeDrugs.length > 0 && (
              <View style={styles.alternativesContainer}>
                <Text style={styles.alternativesTitle}>Suggested Alternatives</Text>
                <FlatList
                  data={alternativeDrugs}
                  keyExtractor={(item, index) => `alternative-${index}`}
                  renderItem={renderAlternativeDrugItem}
                  scrollEnabled={false}
                  style={styles.alternativesList}
                />
              </View>
            )}

            <View style={styles.confirmationContainer}>
              <Text style={styles.confirmationText}>
                Do you want to proceed with this prescription anyway?
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
              <Text style={styles.confirmButtonText}>Proceed Anyway</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
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
    borderBottomColor: '#E0E0E0',
    backgroundColor: Colors.error100,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.error700,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
  },
  warningContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  warningIcon: {
    marginBottom: 12,
  },
  warningHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.error700,
    textAlign: 'center',
    marginBottom: 8,
  },
  warningSubheading: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  warningList: {
    marginBottom: 24,
  },
  warningItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  warningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  severityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  severityIcon: {
    marginRight: 6,
  },
  severityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  warningDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  alternativesContainer: {
    marginBottom: 24,
  },
  alternativesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary600,
    marginBottom: 12,
  },
  alternativesList: {
    marginBottom: 8,
  },
  alternativeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  alternativeIcon: {
    marginRight: 8,
  },
  alternativeText: {
    fontSize: 16,
    color: '#333',
  },
  confirmationContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  confirmationText: {
    fontSize: 16,
    color: '#996500',
    textAlign: 'center',
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderRightWidth: 0.5,
    borderRightColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderLeftWidth: 0.5,
    borderLeftColor: '#E0E0E0',
    backgroundColor: Colors.error100,
  },
  confirmButtonText: {
    fontSize: 16,
    color: Colors.error700,
    fontWeight: '600',
  },
});

export default DrugWarningModal;