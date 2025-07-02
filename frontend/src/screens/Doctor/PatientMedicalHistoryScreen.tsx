import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import Colors from '@/theme/colors';
import { getPatientById } from '@/mockData/patients';
import { Patient, PatientHistorySection } from '@/types/patient';
import { DoctorDrawerParamList } from '@/types/navigation';
import PatientHistorySectionComponent from '@/components/doctor/PatientHistorySection';
import HistoryItem from '@/components/doctor/HistoryItem';
import { Card } from '@/components/ui';

// Using DoctorDrawerParamList for route typing

const PatientMedicalHistoryScreen: React.FC = () => {
  const navigation = useNavigation<DrawerNavigationProp<DoctorDrawerParamList>>();
  const route = useRoute<RouteProp<DoctorDrawerParamList, 'PatientMedicalHistory'>>();
  const { patientId } = route.params;
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [expandedSections, setExpandedSections] = useState<{
    [key in PatientHistorySection]?: boolean;
  }>({});

  useEffect(() => {
    const patientData = getPatientById(patientId);
    if (patientData) {
      setPatient(patientData);
      // Initialize all sections as expanded
      setExpandedSections({
        chronicDiseases: true,
        surgeries: true,
        allergies: true,
        medications: true,
        labResults: true,
      });
    }
  }, [patientId]);

  const toggleSection = (section: PatientHistorySection) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (!patient) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Patient Not Found</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centerContainer}>
          <Text>Patient information could not be loaded.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderHistorySection = (title: string, iconName: string, section: PatientHistorySection, items: string[] | { title: string; date: string }[]) => {
    const isExpanded = expandedSections[section] || false;
    const isEmpty = items.length === 0;

    return (
      <PatientHistorySectionComponent
        title={title}
        iconName={iconName}
        isExpanded={isExpanded}
        itemCount={items.length}
        onToggle={() => toggleSection(section)}
      >
        {isEmpty ? (
          <Text style={styles.emptyText}>No {title.toLowerCase()} recorded</Text>
        ) : (
          <>
            {section === 'labResults' ? (
              // Lab results have a different structure
              (items as { title: string; date: string; filePath?: number }[]).map((item, index) => (
                <HistoryItem 
                  key={index}
                  text={item.title}
                  date={item.date}
                  isLabResult={true}
                  filePath={item.filePath}
                />
              ))
            ) : (
              // Other sections are simple string arrays
              (items as string[]).map((item, index) => (
                <HistoryItem key={index} text={item} />
              ))
            )}
          </>
        )}
      </PatientHistorySectionComponent>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        backgroundColor={Colors.primary500} 
        barStyle="light-content" 
      />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medical History</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <Card style={styles.patientInfoCard}>
          <Image source={patient.image} style={styles.patientImage} />
          <View style={styles.patientDetails}>
            <Text style={styles.patientName}>{patient.name}</Text>
            <Text style={styles.patientAge}>{patient.age} years old</Text>
          </View>
        </Card>

        {renderHistorySection('Chronic Conditions', 'heart-pulse', 'chronicDiseases', patient.history.chronicDiseases)}
        {renderHistorySection('Surgeries', 'medical-bag', 'surgeries', patient.history.surgeries)}
        {renderHistorySection('Allergies', 'alert-circle-outline', 'allergies', patient.history.allergies)}
        {renderHistorySection('Medications', 'pill', 'medications', patient.history.medications)}
        {renderHistorySection('Lab Results', 'test-tube', 'labResults', patient.history.labResults)}
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.primary500,
    ...Platform.select({
      ios: {
        paddingTop: 50,
      },
      android: {
        paddingTop: StatusBar.currentHeight,
      },
    }),
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  placeholder: {
    width: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 24,
  },
  patientInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    margin: 16,
    marginTop: 24,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  patientImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    borderWidth: 3,
    borderColor: Colors.primary100,
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary500,
    marginBottom: 6,
  },
  patientAge: {
    fontSize: 16,
    color: Colors.gray,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.gray,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
});

export default PatientMedicalHistoryScreen;