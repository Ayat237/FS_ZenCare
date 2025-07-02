import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../theme/colors';

interface ActionButtonProps {
  type: 'accept' | 'reject';
  onPress: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ type, onPress }) => {
  const isAccept = type === 'accept';
  
  return (
    <TouchableOpacity 
      style={[styles.button, isAccept ? styles.acceptButton : styles.rejectButton]}
      onPress={onPress}
    >
      <Icon 
        name={isAccept ? 'check' : 'close'} 
        size={16} 
        color={isAccept ? '#2e7d32' : '#c62828'} 
      />
      <Text style={[styles.text, isAccept ? styles.acceptText : styles.rejectText]}>
        {isAccept ? 'Accept' : 'Reject'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  acceptButton: {
    backgroundColor: '#e6f7e6', // Light green
  },
  rejectButton: {
    backgroundColor: '#ffebee', // Light red
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  acceptText: {
    color: '#2e7d32', // Dark green
  },
  rejectText: {
    color: '#c62828', // Dark red
  },
});

export default ActionButton;