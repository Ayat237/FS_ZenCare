import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Payment } from '../../types/payment';
import { formatPaymentDate } from '../../mockData/payments';
import StatusTag from './StatusTag';
import Colors from '../../theme/colors';

interface PaymentCardProps {
  payment: Payment;
  onPress?: (payment: Payment) => void;
}

const PaymentCard: React.FC<PaymentCardProps> = ({ payment, onPress }) => {
  const { patientName, date, amount, method, status } = payment;
  
  const getMethodIcon = () => {
    switch (method) {
      case 'Cash':
        return 'cash';
      case 'Visa':
        return 'credit-card';
      case 'Online':
        return 'bank-transfer';
      default:
        return 'cash';
    }
  };

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => onPress && onPress(payment)}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        <View style={styles.iconContainer}>
          <Icon name={getMethodIcon()} size={24} color={Colors.white} />
        </View>
        
        <View style={styles.detailsContainer}>
          <Text style={styles.patientName}>{patientName}</Text>
          <Text style={styles.date}>{formatPaymentDate(date)}</Text>
          <View style={styles.methodContainer}>
            <Text style={styles.methodText}>{method}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.rightSection}>
        <Text style={styles.amount}>${amount}</Text>
        <StatusTag status={status} type="payment" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leftSection: {
    flexDirection: 'row',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary500,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailsContainer: {
    justifyContent: 'center',
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 6,
  },
  methodContainer: {
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  methodText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary600,
    marginBottom: 8,
  },
});

export default PaymentCard;