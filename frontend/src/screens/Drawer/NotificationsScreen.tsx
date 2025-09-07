import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '@theme/colors';
import { DrawerScreenProps } from '@/types/navigation';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  date: string;
  type: 'appointment' | 'medication' | 'system' | 'payment';
  read: boolean;
}

const dummyNotifications: Notification[] = [
  {
    id: '1',
    title: 'Appointment Reminder',
    message: 'You have an appointment with Dr. Sarah Johnson tomorrow at 10:30 AM.',
    time: '10:15 AM',
    date: 'Today',
    type: 'appointment',
    read: false,
  },
  {
    id: '2',
    title: 'Medication Reminder',
    message: 'Time to take your Amoxicillin medication (500mg).',
    time: '8:00 AM',
    date: 'Today',
    type: 'medication',
    read: false,
  },
  {
    id: '3',
    title: 'Payment Confirmation',
    message: 'Your payment of $50 for the consultation with Dr. Michael Chen has been processed.',
    time: '2:45 PM',
    date: 'Yesterday',
    type: 'payment',
    read: true,
  },
  {
    id: '4',
    title: 'System Update',
    message: 'ZenCare app has been updated to version 2.1.0 with new features.',
    time: '11:30 AM',
    date: 'Yesterday',
    type: 'system',
    read: true,
  },
  {
    id: '5',
    title: 'Appointment Cancelled',
    message: 'Your appointment with Dr. Emily Rodriguez on May 10 has been cancelled.',
    time: '4:20 PM',
    date: '2 days ago',
    type: 'appointment',
    read: true,
  },
];

const NotificationItem = ({
  item,
  onPress,
}: {
  item: Notification;
  onPress: (id: string) => void;
}) => {
  const getIconName = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'calendar-clock';
      case 'medication':
        return 'pill';
      case 'system':
        return 'information-outline';
      case 'payment':
        return 'credit-card-outline';
      default:
        return 'bell-outline';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return Colors.primary500;
      case 'medication':
        return Colors.success;
      case 'system':
        return Colors.info;
      case 'payment':
        return Colors.warning;
      default:
        return Colors.primary500;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadNotification]}
      onPress={() => onPress(item.id)}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: getIconColor(item.type) + '20' },
        ]}
      >
        <Icon name={getIconName(item.type)} size={24} color={getIconColor(item.type)} />
      </View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <View style={styles.notificationFooter}>
          <Text style={styles.notificationTime}>
            {item.time} • {item.date}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const NotificationsScreen: React.FC<DrawerScreenProps<'Notifications'>> = ({ navigation }) => {
  const [notifications, setNotifications] = useState(dummyNotifications);
  const [activeFilter, setActiveFilter] = useState('All');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const filters = ['All', 'Unread', 'Appointments', 'Medications', 'System'];

  const getFilteredNotifications = () => {
    if (activeFilter === 'All') return notifications;
    if (activeFilter === 'Unread') return notifications.filter((n) => !n.read);
    if (activeFilter === 'Appointments')
      return notifications.filter((n) => n.type === 'appointment');
    if (activeFilter === 'Medications')
      return notifications.filter((n) => n.type === 'medication');
    if (activeFilter === 'System') return notifications.filter((n) => n.type === 'system');
    return notifications;
  };

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true }))
    );
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
          <Icon name="check-all" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={styles.menuButton}
        >
          <Icon name="menu" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.settingsContainer}>
        <View style={styles.settingsRow}>
          <Text style={styles.settingsText}>Enable Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: "#D1D1D6", true: Colors.primary200 }}
            thumbColor={notificationsEnabled ? Colors.primary500 : "#F4F3F4"}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterChip,
              activeFilter === filter && styles.activeFilterChip,
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter && styles.activeFilterText,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={getFilteredNotifications()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem item={item} onPress={markAsRead} />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="bell-off-outline" size={64} color={Colors.primary200} />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyText}>
              You don't have any notifications at the moment.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default NotificationsScreen;

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
  markAllButton: {
    padding: 8,
  },
  settingsContainer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsText: {
    fontSize: 16,
    color: '#333',
  },
  filtersContainer: {
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#F0F0F0',
  },
  activeFilterChip: {
    backgroundColor: Colors.primary100,
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterText: {
    color: Colors.primary600,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  notificationItem: {
    flexDirection: 'row',
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
  unreadNotification: {
    backgroundColor: '#F8F9FF',
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary500,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary500,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});