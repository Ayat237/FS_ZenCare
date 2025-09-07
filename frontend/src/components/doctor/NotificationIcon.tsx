import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../theme/colors';

type NotificationType = 'appointment' | 'prescription' | 'system' | 'reminder';

interface NotificationIconProps {
  type: NotificationType;
  size?: number;
  color?: string;
  backgroundColor?: string;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({
  type,
  size = 24,
  color = Colors.white,
  backgroundColor,
}) => {
  // Get icon name based on notification type
  const getIconName = (): string => {
    switch (type) {
      case 'appointment':
        return 'calendar-clock';
      case 'prescription':
        return 'file-document-outline';
      case 'system':
        return 'bell-outline';
      case 'reminder':
        return 'alarm';
      default:
        return 'bell-outline';
    }
  };

  // Get background color based on notification type
  const getBackgroundColor = (): string => {
    if (backgroundColor) return backgroundColor;
    
    switch (type) {
      case 'appointment':
        return Colors.primary500;
      case 'prescription':
        return Colors.info;
      case 'system':
        return Colors.warning;
      case 'reminder':
        return Colors.success;
      default:
        return Colors.primary500;
    }
  };

  return (
    <View style={[styles.iconContainer, { backgroundColor: getBackgroundColor() }]}>
      <Icon name={getIconName()} size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NotificationIcon;