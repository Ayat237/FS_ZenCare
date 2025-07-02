import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../theme/colors';
import { Medication } from '../../types/prescription';

interface MedicationInputRowProps {
  medication: Medication;
  index: number;
  onChange: (index: number, field: keyof Medication, value: string) => void;
  onRemove: (index: number) => void;
  isRemovable: boolean;
}

const MedicationInputRow: React.FC<MedicationInputRowProps> = ({
  medication,
  index,
  onChange,
  onRemove,
  isRemovable,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Medication {index + 1}</Text>
        {isRemovable && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => onRemove(index)}
          >
            <Icon name="close-circle" size={20} color="#c62828" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.inputRow}>
        <Text style={styles.label}>Name:</Text>
        <TextInput
          style={styles.input}
          value={medication.name}
          onChangeText={(value) => onChange(index, 'name', value)}
          placeholder="Medication name"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputRow}>
        <Text style={styles.label}>Dosage:</Text>
        <TextInput
          style={styles.input}
          value={medication.dosage}
          onChangeText={(value) => onChange(index, 'dosage', value)}
          placeholder="e.g., 500mg"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputRow}>
        <Text style={styles.label}>Frequency:</Text>
        <TextInput
          style={styles.input}
          value={medication.frequency}
          onChangeText={(value) => onChange(index, 'frequency', value)}
          placeholder="e.g., Twice daily"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputRow}>
        <Text style={styles.label}>Duration:</Text>
        <TextInput
          style={styles.input}
          value={medication.duration}
          onChangeText={(value) => onChange(index, 'duration', value)}
          placeholder="e.g., 7 days"
          placeholderTextColor="#999"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary600,
  },
  removeButton: {
    padding: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    width: 80,
    fontSize: 14,
    color: '#555',
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 10,
    color: '#333',
  },
});

export default MedicationInputRow;