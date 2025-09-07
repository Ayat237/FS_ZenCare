import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setUser } from '@/store/auth/authSlice';
import Colors from '@theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const DoctorProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    specialty: user?.specialty || '',
    clinicLocation: user?.clinicLocation || '',
    mobilePhone: user?.mobilePhone || '',
    email: user?.email || '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Update user data in Redux store
    dispatch(setUser({
      ...user!,
      ...formData
    }));
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={Colors.primary600} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doctor Profile</Text>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Icon name="menu" size={24} color={Colors.primary600} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <Image 
            source={{ uri: user?.profileImage || 'https://dummyimage.com/200x200/007bff/ffffff' }} 
            style={styles.profileImage} 
          />
          <View style={styles.nameContainer}>
            <Text style={styles.doctorName}>
              Dr. {isEditing ? formData.firstName + ' ' + formData.lastName : user?.firstName + ' ' + user?.lastName}
            </Text>
            <Text style={styles.specialtyText}>
              {isEditing ? formData.specialty : user?.specialty}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => isEditing ? handleSave() : setIsEditing(true)}
          >
            <Icon name={isEditing ? "content-save" : "pencil"} size={20} color="#fff" />
            <Text style={styles.editButtonText}>{isEditing ? 'Save' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Icon name="account" size={20} color={Colors.primary600} />
              <Text style={styles.infoLabel}>First Name</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.firstName}
                onChangeText={(text) => handleChange('firstName', text)}
              />
            ) : (
              <Text style={styles.infoValue}>{user?.firstName}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Icon name="account" size={20} color={Colors.primary600} />
              <Text style={styles.infoLabel}>Last Name</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.lastName}
                onChangeText={(text) => handleChange('lastName', text)}
              />
            ) : (
              <Text style={styles.infoValue}>{user?.lastName}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Icon name="doctor" size={20} color={Colors.primary600} />
              <Text style={styles.infoLabel}>Specialty</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.specialty}
                onChangeText={(text) => handleChange('specialty', text)}
              />
            ) : (
              <Text style={styles.infoValue}>{user?.specialty}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Icon name="map-marker" size={20} color={Colors.primary600} />
              <Text style={styles.infoLabel}>Clinic Location</Text>
            </View>
            {isEditing ? (
              <View style={styles.locationInputContainer}>
                <TextInput
                  style={styles.locationInput}
                  value={formData.clinicLocation}
                  onChangeText={(text) => handleChange('clinicLocation', text)}
                />
                <TouchableOpacity 
                  style={styles.mapButton}
                  onPress={() => navigation.navigate('DoctorClinicLocation')}
                >
                  <Icon name="map" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.locationValueContainer}>
                <Text style={styles.infoValue}>{user?.clinicLocation}</Text>
                <TouchableOpacity 
                  style={styles.mapButton}
                  onPress={() => navigation.navigate('DoctorClinicLocation')}
                >
                  <Icon name="map" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Icon name="phone" size={20} color={Colors.primary600} />
              <Text style={styles.infoLabel}>Phone</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.mobilePhone}
                onChangeText={(text) => handleChange('mobilePhone', text)}
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.infoValue}>{user?.mobilePhone}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Icon name="email" size={20} color={Colors.primary600} />
              <Text style={styles.infoLabel}>Email</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
                keyboardType="email-address"
              />
            ) : (
              <Text style={styles.infoValue}>{user?.email}</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary700,
  },
  scrollContent: {
    padding: 16,
  },
  profileHeader: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: Colors.primary500,
  },
  nameContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  doctorName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary700,
    textAlign: 'center',
  },
  specialtyText: {
    fontSize: 16,
    color: Colors.primary500,
    marginTop: 5,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary600,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 5,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary700,
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 16,
    color: '#555',
    marginLeft: 8,
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  locationInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  locationValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  mapButton: {
    backgroundColor: '#2563EB',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 16,
    color: '#333',
    width: '50%',
    textAlign: 'right',
  },
});

export default DoctorProfileScreen;