import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Notification } from '../../types/notification';
import NotificationIcon from './NotificationIcon';
import Colors from '../../theme/colors';
import { formatNotificationDate } from '../../mockData/notifications';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface NotificationCardProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onPress }) => {
  const { title, message, date, type, read } = notification;
  
  return (
    <TouchableOpacity 
      style={[styles.card, !read && styles.unreadCard]} 
      onPress={() => onPress(notification)}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        <NotificationIcon type={type} size={20} />
        
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={[styles.title, !read && styles.unreadText]}>{title}</Text>
            <View style={styles.dateContainer}>
              <Icon name="clock-outline" size={12} color={Colors.textMuted} style={styles.dateIcon} />
              <Text style={styles.date}>{formatNotificationDate(date)}</Text>
            </View>
          </View>
          
          <Text 
            style={[styles.message, !read && styles.unreadText]} 
            numberOfLines={2}
          >
            {message}
          </Text>
        </View>
      </View>
      
      {!read && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadBadgeText}>New</Text>
        </View>
      )}
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
    borderLeftWidth: 0,
  },
  unreadCard: {
    backgroundColor: Colors.white,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary500,
  },
  leftSection: {
    flexDirection: 'row',
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  unreadText: {
    fontWeight: '600',
    color: Colors.primary600,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 4,
  },
  date: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  message: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  unreadBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.primary500,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  unreadBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default NotificationCard;