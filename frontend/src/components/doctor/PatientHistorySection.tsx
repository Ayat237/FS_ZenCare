import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '@/theme/colors';
import { PatientHistorySection as HistorySectionType } from '@/types/patient';
import { Card } from '@/components/ui';

interface PatientHistorySectionProps {
  title: string;
  iconName: string;
  isExpanded: boolean;
  itemCount: number;
  onToggle: () => void;
  children: React.ReactNode;
}

const PatientHistorySection: React.FC<PatientHistorySectionProps> = ({
  title,
  iconName,
  isExpanded,
  itemCount,
  onToggle,
  children,
}) => {
  return (
    <Card style={styles.sectionContainer}>
      <TouchableOpacity 
        style={styles.sectionHeader} 
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.sectionTitleContainer}>
          <View style={styles.iconContainer}>
            <Icon name={iconName} size={20} color={Colors.white} />
          </View>
          <Text style={styles.sectionTitle}>{title}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{itemCount}</Text>
          </View>
        </View>
        <Icon 
          name={isExpanded ? 'chevron-up' : 'chevron-down'} 
          size={24} 
          color={Colors.primary500} 
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.sectionContent}>
          {children}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    padding: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary500,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary500,
  },
  countBadge: {
    backgroundColor: Colors.primary100,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  countText: {
    fontSize: 12,
    color: Colors.primary500,
    fontWeight: '600',
  },
  sectionContent: {
    padding: 16,
  },
});

export default PatientHistorySection;