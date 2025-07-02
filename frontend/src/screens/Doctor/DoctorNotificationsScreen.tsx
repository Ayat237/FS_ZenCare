import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '@theme/colors';
import { Notification } from '../../types/notification';
import { NotificationCard } from '../../components/doctor';
import { mockNotifications, getUnreadNotifications, getNotificationsByType } from '../../mockData/notifications';

type FilterType = 'all' | 'unread' | 'system';

const DoctorNotificationsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  
  // Apply filters when activeFilter changes
  useEffect(() => {
    switch (activeFilter) {
      case 'unread':
        setNotifications(getUnreadNotifications());
        break;
      case 'system':
        setNotifications(getNotificationsByType('system'));
        break;
      default:
        setNotifications(mockNotifications);
        break;
    }
  }, [activeFilter]);

  // Handle notification press
  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      const updatedNotifications = notifications.map(item => 
        item.id === notification.id ? { ...item, read: true } : item
      );
      setNotifications(updatedNotifications);
      
      // Also update in the original array
      const index = mockNotifications.findIndex(item => item.id === notification.id);
      if (index !== -1) {
        mockNotifications[index].read = true;
      }
    }
    
    // Handle navigation based on notification type
    switch (notification.type) {
      case 'appointment':
        Alert.alert('Navigate to Appointment', 'This would navigate to the appointment details');
        break;
      case 'prescription':
        Alert.alert('Navigate to Prescription', 'This would navigate to the prescription details');
        break;
      default:
        // Just show details for system and reminder notifications
        Alert.alert(notification.title, notification.message);
        break;
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = () => {
    const updatedNotifications = notifications.map(item => ({ ...item, read: true }));
    setNotifications(updatedNotifications);
    
    // Update all notifications in the original array
    mockNotifications.forEach(item => {
      item.read = true;
    });
    
    Alert.alert('Success', 'All notifications marked as read');
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

  // Count unread notifications
  const unreadCount = mockNotifications.filter(item => !item.read).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
          <Icon name="menu" size={24} color={Colors.primary600} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.filterContainer}>
        <FilterButton title="All" filter="all" />
        <FilterButton title={`Unread (${unreadCount})`} filter="unread" />
        <FilterButton title="System" filter="system" />
      </View>
      
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationCard 
            notification={item} 
            onPress={handleNotificationPress} 
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="bell-off-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No notifications found</Text>
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
    flex: 1,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.primary100,
  },
  markAllText: {
    fontSize: 12,
    color: Colors.primary600,
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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

export default DoctorNotificationsScreen;