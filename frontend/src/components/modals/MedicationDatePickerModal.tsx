import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import Colors from '@theme/colors';

interface MedicationDatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: string) => void;
  initialDate?: string;
  minDate?: string;
  maxDate?: string;
}

const MedicationDatePickerModal: React.FC<MedicationDatePickerModalProps> = ({
  visible,
  onClose,
  onConfirm,
  initialDate,
  minDate,
  maxDate,
}) => {
  // Get current date if initialDate is not provided
  const today = new Date();
  const initialDateObj = initialDate ? new Date(initialDate) : today;
  
  // Parse min and max dates
  const minDateObj = minDate ? new Date(minDate) : new Date(today.getFullYear() - 1, 0, 1);
  const maxDateObj = maxDate ? new Date(maxDate) : new Date(today.getFullYear() + 5, 11, 31);

  // State for selected date
  const [selectedDate, setSelectedDate] = useState({
    year: initialDateObj.getFullYear(),
    month: initialDateObj.getMonth(),
    day: initialDateObj.getDate(),
  });

  // Reset selected date when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedDate({
        year: initialDateObj.getFullYear(),
        month: initialDateObj.getMonth(),
        day: initialDateObj.getDate(),
      });
    }
  }, [visible, initialDateObj]);

  // Generate years array
  const years = [];
  for (let year = minDateObj.getFullYear(); year <= maxDateObj.getFullYear(); year++) {
    years.push(year);
  }

  // Generate months array
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Generate days array based on selected month and year
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const days = [];
  const daysInMonth = getDaysInMonth(selectedDate.year, selectedDate.month);
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  // Handle date selection
  const handleYearSelect = (year: number) => {
    setSelectedDate(prev => ({ ...prev, year }));
  };

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedDate(prev => {
      const newState = { ...prev, month: monthIndex };
      // Adjust day if it exceeds the days in the new month
      const daysInNewMonth = getDaysInMonth(newState.year, newState.month);
      if (newState.day > daysInNewMonth) {
        newState.day = daysInNewMonth;
      }
      return newState;
    });
  };

  const handleDaySelect = (day: number) => {
    setSelectedDate(prev => ({ ...prev, day }));
  };

  // Handle confirm button press
  const handleConfirm = () => {
    const date = new Date(selectedDate.year, selectedDate.month, selectedDate.day);
    const formattedDate = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    onConfirm(formattedDate);
    onClose();
  };

  // Render item for FlatList
  const renderYearItem = ({ item }: { item: number }) => (
    <TouchableOpacity
      style={[styles.datePickerItem, selectedDate.year === item && styles.selectedItem]}
      onPress={() => handleYearSelect(item)}
    >
      <Text style={[styles.datePickerItemText, selectedDate.year === item && styles.selectedItemText]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderMonthItem = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity
      style={[styles.datePickerItem, selectedDate.month === index && styles.selectedItem]}
      onPress={() => handleMonthSelect(index)}
    >
      <Text style={[styles.datePickerItemText, selectedDate.month === index && styles.selectedItemText]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderDayItem = ({ item }: { item: number }) => (
    <TouchableOpacity
      style={[styles.datePickerItem, selectedDate.day === item && styles.selectedItem]}
      onPress={() => handleDaySelect(item)}
    >
      <Text style={[styles.datePickerItemText, selectedDate.day === item && styles.selectedItemText]}>
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
            <Text style={styles.modalTitle}>Select Date</Text>
          </View>

          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerColumn}>
              <Text style={styles.datePickerLabel}>Month</Text>
              <FlatList
                data={months}
                keyExtractor={(item, index) => `month-${index}`}
                renderItem={renderMonthItem}
                showsVerticalScrollIndicator={false}
                style={styles.datePickerScroll}
                initialScrollIndex={selectedDate.month}
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
                initialScrollIndex={selectedDate.day - 1}
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
                initialScrollIndex={years.indexOf(selectedDate.year)}
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
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
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
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary600,
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
    color: '#666',
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
    color: '#333',
  },
  selectedItemText: {
    color: Colors.primary600,
    fontWeight: '600',
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
  },
  confirmButtonText: {
    fontSize: 16,
    color: Colors.primary500,
    fontWeight: '600',
  },
});

export default MedicationDatePickerModal;