import React from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { GENDER_OPTIONS } from '../constants';
import Colors from '@theme/colors';

interface GenderSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (gender: string) => void;
}

const GenderSelectionModal: React.FC<GenderSelectionModalProps> = ({
  visible,
  onClose,
  onSelect,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Gender</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.fontSize20}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={GENDER_OPTIONS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.genderItem}
                onPress={() => {
                  onSelect(item.label);
                  onClose();
                }}
              >
                <Text style={styles.genderLabel}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  fontSize20: {
    fontSize: 20,
  },
  genderItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  genderLabel: {
    fontSize: 16,
    color: '#333',
  },
});

export default GenderSelectionModal;