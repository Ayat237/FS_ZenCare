import React, { useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, FlatList, Dimensions } from 'react-native';
import { MONTHS } from '../constants';
import Colors from '@theme/colors';

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  datePickerState: {
    day: number;
    month: number;
    year: number;
  };
  setDatePickerState: React.Dispatch<
    React.SetStateAction<{
      day: number;
      month: number;
      year: number;
    }>
  >;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  onClose,
  onConfirm,
  datePickerState,
  setDatePickerState,
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const days = Array.from(
    { length: new Date(datePickerState.year, datePickerState.month + 1, 0).getDate() },
    (_, i) => i + 1
  );
  
  // Render item functions for FlatList components
  const renderYearItem = ({ item }: { item: number }) => (
    <TouchableOpacity
      style={[styles.datePickerItem, datePickerState.year === item && styles.selectedItem]}
      onPress={() => setDatePickerState((prev) => ({ ...prev, year: item }))}
    >
      <Text style={[styles.datePickerItemText, datePickerState.year === item && styles.selectedItemText]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderMonthItem = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity
      style={[styles.datePickerItem, datePickerState.month === index && styles.selectedItem]}
      onPress={() => setDatePickerState((prev) => ({ ...prev, month: index }))}
    >
      <Text style={[styles.datePickerItemText, datePickerState.month === index && styles.selectedItemText]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderDayItem = ({ item }: { item: number }) => (
    <TouchableOpacity
      style={[styles.datePickerItem, datePickerState.day === item && styles.selectedItem]}
      onPress={() => setDatePickerState((prev) => ({ ...prev, day: item }))}
    >
      <Text style={[styles.datePickerItemText, datePickerState.day === item && styles.selectedItemText]}>
        {item}
      </Text>
    </TouchableOpacity>
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
            <Text style={styles.modalTitle}>Select Birth Date</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerColumn}>
              <Text style={styles.datePickerLabel}>Month</Text>
              <FlatList
                data={MONTHS}
                keyExtractor={(item, index) => `month-${index}`}
                renderItem={renderMonthItem}
                showsVerticalScrollIndicator={false}
                style={styles.datePickerScroll}
                initialScrollIndex={datePickerState.month}
                getItemLayout={(data, index) => ({
                  length: 50,
                  offset: 50 * index,
                  index,
                })}
              />
            </View>

            <View style={styles.datePickerColumn}>
              <Text style={styles.datePickerLabel}>Day</Text>
              <FlatList
                data={days}
                keyExtractor={(item) => `day-${item}`}
                renderItem={renderDayItem}
                showsVerticalScrollIndicator={false}
                style={styles.datePickerScroll}
                initialScrollIndex={datePickerState.day - 1}
                getItemLayout={(data, index) => ({
                  length: 50,
                  offset: 50 * index,
                  index,
                })}
              />
            </View>

            <View style={styles.datePickerColumn}>
              <Text style={styles.datePickerLabel}>Year</Text>
              <FlatList
                data={years}
                keyExtractor={(item) => `year-${item}`}
                renderItem={renderYearItem}
                showsVerticalScrollIndicator={false}
                style={styles.datePickerScroll}
                initialScrollIndex={years.indexOf(datePickerState.year)}
                getItemLayout={(data, index) => ({
                  length: 50,
                  offset: 50 * index,
                  index,
                })}
              />
            </View>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.primary100,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary600,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  closeButtonText: {
    fontSize: 16,
    color: Colors.primary600,
    fontWeight: 'bold',
  },
  datePickerContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  datePickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  datePickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textLight,
    marginBottom: 8,
  },
  datePickerScroll: {
    height: 200,
    width: '100%',
  },
  datePickerItem: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  selectedItem: {
    backgroundColor: Colors.primary100,
    borderRadius: 8,
  },
  datePickerItemText: {
    fontSize: 16,
    color: Colors.text,
  },
  selectedItemText: {
    color: Colors.primary600,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderRightWidth: 0.5,
    borderRightColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    color: Colors.textLight,
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderLeftWidth: 0.5,
    borderLeftColor: Colors.border,
    backgroundColor: Colors.primary100,
  },
  confirmButtonText: {
    fontSize: 16,
    color: Colors.primary500,
    fontWeight: '600',
  },
});

export default DatePickerModal;