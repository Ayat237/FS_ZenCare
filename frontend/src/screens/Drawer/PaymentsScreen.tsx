import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '@theme/colors';
import { DrawerScreenProps } from '@/types/navigation';

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'applepay' | 'googlepay';
  name: string;
  details: string;
  isDefault: boolean;
}

interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
  type: 'appointment' | 'medication' | 'subscription';
}

const dummyPaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'card',
    name: 'Visa ending in 4242',
    details: 'Expires 05/2025',
    isDefault: true,
  },
  {
    id: '2',
    type: 'card',
    name: 'Mastercard ending in 8353',
    details: 'Expires 12/2024',
    isDefault: false,
  },
  {
    id: '3',
    type: 'paypal',
    name: 'PayPal',
    details: 'example@email.com',
    isDefault: false,
  },
];

const dummyTransactions: Transaction[] = [
  {
    id: '1',
    title: 'Consultation with Dr. Sarah Johnson',
    amount: 50.00,
    date: 'May 15, 2023',
    status: 'completed',
    paymentMethod: 'Visa ending in 4242',
    type: 'appointment',
  },
  {
    id: '2',
    title: 'Prescription Refill - Amoxicillin',
    amount: 15.75,
    date: 'May 10, 2023',
    status: 'completed',
    paymentMethod: 'Visa ending in 4242',
    type: 'medication',
  },
  {
    id: '3',
    title: 'Premium Subscription - Monthly',
    amount: 9.99,
    date: 'May 1, 2023',
    status: 'completed',
    paymentMethod: 'PayPal',
    type: 'subscription',
  },
  {
    id: '4',
    title: 'Consultation with Dr. Michael Chen',
    amount: 45.00,
    date: 'April 28, 2023',
    status: 'completed',
    paymentMethod: 'Mastercard ending in 8353',
    type: 'appointment',
  },
  {
    id: '5',
    title: 'Prescription Refill - Lisinopril',
    amount: 12.50,
    date: 'April 20, 2023',
    status: 'failed',
    paymentMethod: 'Visa ending in 4242',
    type: 'medication',
  },
];

const PaymentMethodItem = ({
  item,
  onPress,
}: {
  item: PaymentMethod;
  onPress: (id: string) => void;
}) => {
  const getCardIcon = (type: string) => {
    switch (type) {
      case 'card':
        return 'credit-card-outline';
      case 'paypal':
        return 'credit-card-outline'; // Changed from 'paypal' to a valid icon name
      case 'applepay':
        return 'apple';
      case 'googlepay':
        return 'google';
      default:
        return 'credit-card-outline';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.paymentMethodCard, item.isDefault && styles.defaultPaymentMethod]}
      onPress={() => onPress(item.id)}
    >
      <View style={styles.paymentMethodIcon}>
        <Icon name={getCardIcon(item.type)} size={24} color={Colors.primary500} />
      </View>
      <View style={styles.paymentMethodInfo}>
        <Text style={styles.paymentMethodName}>{item.name}</Text>
        <Text style={styles.paymentMethodDetails}>{item.details}</Text>
      </View>
      {item.isDefault && (
        <View style={styles.defaultBadge}>
          <Text style={styles.defaultBadgeText}>Default</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const TransactionItem = ({ item }: { item: Transaction }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return Colors.success;
      case 'pending':
        return Colors.warning;
      case 'failed':
        return Colors.error;
      default:
        return Colors.success;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'calendar-clock';
      case 'medication':
        return 'pill';
      case 'subscription':
        return 'star-circle-outline';
      default:
        return 'cash';
    }
  };

  return (
    <TouchableOpacity style={styles.transactionCard}>
      <View
        style={[
          styles.transactionIconContainer,
          { backgroundColor: Colors.primary100 },
        ]}
      >
        <Icon name={getTypeIcon(item.type)} size={20} color={Colors.primary500} />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle}>{item.title}</Text>
        <Text style={styles.transactionDate}>{item.date}</Text>
        <Text style={styles.transactionMethod}>{item.paymentMethod}</Text>
      </View>
      <View style={styles.transactionAmount}>
        <Text style={styles.amountText}>${item.amount.toFixed(2)}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '20' },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const PaymentsScreen: React.FC<DrawerScreenProps<'Payments'>> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Transactions');
  const [paymentMethods, setPaymentMethods] = useState(dummyPaymentMethods);

  const setDefaultPaymentMethod = (id: string) => {
    setPaymentMethods(
      paymentMethods.map((method) => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.searchButton}>
          <Icon name="magnify" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payments</Text>
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={styles.menuButton}
        >
          <Icon name="menu" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Transactions" && styles.activeTab]}
          onPress={() => setActiveTab("Transactions")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Transactions" && styles.activeTabText,
            ]}
          >
            Transactions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "PaymentMethods" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("PaymentMethods")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "PaymentMethods" && styles.activeTabText,
            ]}
          >
            Payment Methods
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "Transactions" && (
        <FlatList
          data={dummyTransactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TransactionItem item={item} />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.balanceContainer}>
              <View style={styles.balanceCard}>
                <Text style={styles.balanceTitle}>Total Spent</Text>
                <Text style={styles.balanceAmount}>
                  $
                  {dummyTransactions
                    .filter((t) => t.status === "completed")
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toFixed(2)}
                </Text>
                <Text style={styles.balancePeriod}>Last 30 days</Text>
              </View>
            </View>
          }
        />
      )}

      {activeTab === "PaymentMethods" && (
        <ScrollView style={styles.contentContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Payment Methods</Text>
            <TouchableOpacity style={styles.addButton}>
              <Icon name="plus" size={20} color={Colors.primary500} />
              <Text style={styles.addButtonText}>Add New</Text>
            </TouchableOpacity>
          </View>

          {paymentMethods.map((method) => (
            <PaymentMethodItem
              key={method.id}
              item={method}
              onPress={setDefaultPaymentMethod}
            />
          ))}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Billing Information</Text>
            <TouchableOpacity style={styles.editButton}>
              <Icon name="pencil" size={16} color={Colors.primary500} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.billingInfoCard}>
            <View style={styles.billingInfoRow}>
              <Text style={styles.billingInfoLabel}>Name</Text>
              <Text style={styles.billingInfoValue}>John Doe</Text>
            </View>
            <View style={styles.billingInfoRow}>
              <Text style={styles.billingInfoLabel}>Email</Text>
              <Text style={styles.billingInfoValue}>john.doe@example.com</Text>
            </View>
            <View style={styles.billingInfoRow}>
              <Text style={styles.billingInfoLabel}>Address</Text>
              <Text style={styles.billingInfoValue}>
                123 Main St, Apt 4B, New York, NY 10001
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default PaymentsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  searchButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary500,
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: Colors.primary500,
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  listContainer: {
    padding: 16,
  },
  balanceContainer: {
    marginBottom: 16,
  },
  balanceCard: {
    backgroundColor: Colors.primary500,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  balanceTitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.8,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  balancePeriod: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.8,
  },
  transactionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  transactionMethod: {
    fontSize: 12,
    color: '#666',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 14,
    color: Colors.primary500,
    marginLeft: 4,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    color: Colors.primary500,
    marginLeft: 4,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  defaultPaymentMethod: {
    borderWidth: 1,
    borderColor: Colors.primary200,
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  paymentMethodDetails: {
    fontSize: 12,
    color: '#666',
  },
  defaultBadge: {
    backgroundColor: Colors.primary100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultBadgeText: {
    fontSize: 10,
    color: Colors.primary500,
    fontWeight: '500',
  },
  billingInfoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  billingInfoRow: {
    marginBottom: 12,
  },
  billingInfoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  billingInfoValue: {
    fontSize: 14,
    color: '#333',
  },
});