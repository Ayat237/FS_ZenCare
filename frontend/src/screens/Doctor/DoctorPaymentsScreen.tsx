import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '@theme/colors';
import { Payment } from '../../types/payment';
import { PaymentCard, PaymentSummaryHeader } from '../../components/doctor';
import {
  mockPayments,
  getPaymentsByStatus,
  getCurrentMonthPayments,
  getTotalEarnings,
  getPendingPaymentsCount,
  getCompletedPaymentsCount
} from '../../mockData/payments';

type FilterType = 'all' | 'paid' | 'pending' | 'refunded';

const DoctorPaymentsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'highest'>('newest');
  
  // Apply filters when activeFilter changes
  useEffect(() => {
    let filteredPayments = [...mockPayments];
    
    // Apply status filter
    if (activeFilter !== 'all') {
      filteredPayments = getPaymentsByStatus(activeFilter);
    }
    
    // Apply sort order
    if (sortOrder === 'newest') {
      filteredPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortOrder === 'highest') {
      filteredPayments.sort((a, b) => b.amount - a.amount);
    }
    
    setPayments(filteredPayments);
  }, [activeFilter, sortOrder]);

  // Handle payment press
  const handlePaymentPress = (payment: Payment) => {
    Alert.alert(
      'Payment Details',
      `Patient: ${payment.patientName}\nAmount: $${payment.amount}\nMethod: ${payment.method}\nStatus: ${payment.status}`,
      [{ text: 'OK' }]
    );
  };

  // Filter button component
  const FilterButton = ({ title, filter }: { title: string; filter: FilterType }) => (
    <TouchableOpacity
      style={[styles.filterButton, activeFilter === filter && styles.activeFilterButton]}
      onPress={() => setActiveFilter(filter)}
    >
      <Text 
        style={[styles.filterButtonText, activeFilter === filter && styles.activeFilterText]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  // Sort button component
  const SortButton = ({ title, order }: { title: string; order: 'newest' | 'highest' }) => (
    <TouchableOpacity
      style={[styles.sortButton, sortOrder === order && styles.activeSortButton]}
      onPress={() => setSortOrder(order)}
    >
      <Text 
        style={[styles.sortButtonText, sortOrder === order && styles.activeSortText]}
      >
        {title}
      </Text>
      <Icon 
        name={order === 'newest' ? 'sort-calendar-descending' : 'sort-numeric-descending'} 
        size={16} 
        color={sortOrder === order ? Colors.primary600 : Colors.textLight} 
      />
    </TouchableOpacity>
  );

  // Get current month statistics
  const currentMonthPayments = getCurrentMonthPayments();
  const totalEarnings = getTotalEarnings(currentMonthPayments);
  const completedCount = getCompletedPaymentsCount();
  const pendingCount = getPendingPaymentsCount();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
          <Icon name="menu" size={24} color={Colors.primary600} />
        </TouchableOpacity>
        <Text style={styles.title}>Payments</Text>
      </View>
      
      <PaymentSummaryHeader 
        totalEarnings={totalEarnings}
        completedCount={completedCount}
        pendingCount={pendingCount}
      />
      
      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          <FilterButton title="All" filter="all" />
          <FilterButton title="Paid" filter="paid" />
          <FilterButton title="Pending" filter="pending" />
          <FilterButton title="Refunded" filter="refunded" />
        </View>
        
        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <SortButton title="Newest" order="newest" />
          <SortButton title="Highest" order="highest" />
        </View>
      </View>
      
      <FlatList
        data={payments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PaymentCard 
            payment={item} 
            onPress={handlePaymentPress} 
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="cash-remove" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No payments found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary600,
    marginLeft: 16,
  },
  filtersContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: Colors.background,
  },
  activeFilterButton: {
    backgroundColor: Colors.primary100,
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  activeFilterText: {
    color: Colors.primary600,
    fontWeight: '500',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginRight: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: Colors.background,
  },
  activeSortButton: {
    backgroundColor: Colors.primary100,
  },
  sortButtonText: {
    fontSize: 12,
    color: Colors.textLight,
    marginRight: 4,
  },
  activeSortText: {
    color: Colors.primary600,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textMuted,
    marginTop: 16,
  },
});

export default DoctorPaymentsScreen;