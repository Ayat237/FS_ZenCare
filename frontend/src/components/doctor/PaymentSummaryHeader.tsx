import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../theme/colors';

interface PaymentSummaryHeaderProps {
  totalEarnings: number;
  completedCount: number;
  pendingCount: number;
}

const PaymentSummaryHeader: React.FC<PaymentSummaryHeaderProps> = ({
  totalEarnings,
  completedCount,
  pendingCount,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>This Month</Text>
          <Icon name="calendar-month" size={20} color={Colors.primary500} />
        </View>
        
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <View style={[styles.iconContainer, styles.earningsIcon]}>
              <Icon name="cash-multiple" size={20} color={Colors.white} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.summaryLabel}>Total Earnings</Text>
              <Text style={styles.summaryValue}>${totalEarnings}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.summaryItem}>
            <View style={[styles.iconContainer, styles.completedIcon]}>
              <Icon name="check-circle" size={20} color={Colors.white} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.summaryLabel}>Completed</Text>
              <Text style={styles.summaryValue}>{completedCount}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.summaryItem}>
            <View style={[styles.iconContainer, styles.pendingIcon]}>
              <Icon name="clock-outline" size={20} color={Colors.white} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.summaryLabel}>Pending</Text>
              <Text style={styles.summaryValue}>{pendingCount}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 8,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary600,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    paddingHorizontal: 4,
  },
  textContainer: {
    flexDirection: 'column',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  earningsIcon: {
    backgroundColor: Colors.primary500,
  },
  completedIcon: {
    backgroundColor: Colors.success,
  },
  pendingIcon: {
    backgroundColor: Colors.warning,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  divider: {
    width: 1,
    height: 50,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },
});

export default PaymentSummaryHeader;