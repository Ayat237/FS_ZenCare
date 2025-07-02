import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../theme/colors';

interface StatusTagProps {
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'paid' | 'refunded';
  type?: 'appointment' | 'payment';
}

const StatusTag: React.FC<StatusTagProps> = ({ status, type = 'appointment' }) => {
  const getStatusColor = () => {
    // For payment status
    if (type === 'payment') {
      switch (status) {
        case 'paid':
          return {
            backgroundColor: '#e6f7e6', // Light green
            textColor: '#2e7d32', // Dark green
          };
        case 'pending':
          return {
            backgroundColor: Colors.primary100,
            textColor: Colors.primary600,
          };
        case 'refunded':
          return {
            backgroundColor: '#ffebee', // Light red
            textColor: '#c62828', // Dark red
          };
        default:
          return {
            backgroundColor: Colors.primary100,
            textColor: Colors.primary600,
          };
      }
    }
    
    // For appointment status
    switch (status) {
      case 'pending':
        return {
          backgroundColor: Colors.primary100,
          textColor: Colors.primary600,
        };
      case 'accepted':
        return {
          backgroundColor: '#e6f7e6', // Light green
          textColor: '#2e7d32', // Dark green
        };
      case 'rejected':
        return {
          backgroundColor: '#ffebee', // Light red
          textColor: '#c62828', // Dark red
        };
      case 'completed':
        return {
          backgroundColor: '#e8eaf6', // Light indigo
          textColor: '#3949ab', // Dark indigo
        };
      default:
        return {
          backgroundColor: Colors.primary100,
          textColor: Colors.primary600,
        };
    }
  };

  const { backgroundColor, textColor } = getStatusColor();

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.text, { color: textColor }]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default StatusTag;