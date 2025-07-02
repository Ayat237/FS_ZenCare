import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { logout } from '@/store/auth/authSlice';
import Colors from '@theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const DoctorHomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const navigateToAppointments = () => {
    navigation.navigate('DoctorAppointments');
  };

  const navigateToProfile = () => {
    navigation.navigate('DoctorProfile');
  };

  const navigateToPatients = () => {
    navigation.navigate('PatientList');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Doctor Dashboard</Text>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Icon name="menu" size={28} color={Colors.primary600} />
        </TouchableOpacity>
      </View>

      <View style={styles.welcomeContainer}>
        <Image 
          source={{ uri: user?.profileImage || 'https://dummyimage.com/200x200/007bff/ffffff' }} 
          style={styles.profileImage} 
        />
        <Text style={styles.welcomeText}>Welcome, Dr. {user?.firstName} {user?.lastName}</Text>
        <Text style={styles.specialtyText}>{user?.specialty}</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={navigateToAppointments}>
          <Icon name="calendar-clock" size={32} color={Colors.primary600} />
          <Text style={styles.buttonText}>View Appointments</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('DoctorPrescriptions')}>
          <Icon name="file-document-outline" size={32} color={Colors.primary600} />
          <Text style={styles.buttonText}>Prescriptions</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={navigateToPatients}>
          <Icon name="account-group-outline" size={32} color={Colors.primary600} />
          <Text style={styles.buttonText}>Patient Records</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={navigateToProfile}>
          <Icon name="account-edit" size={32} color={Colors.primary600} />
          <Text style={styles.buttonText}>View/Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
          <Icon name="logout" size={32} color="#fff" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
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
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary600,
  },
  welcomeContainer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: Colors.primary500,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary700,
    textAlign: 'center',
  },
  specialtyText: {
    fontSize: 16,
    color: Colors.primary500,
    marginTop: 5,
  },
  buttonsContainer: {
    padding: 20,
    gap: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 15,
    color: Colors.primary700,
  },
  logoutButton: {
    backgroundColor: Colors.primary600,
    marginTop: 20,
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 15,
    color: '#fff',
  },
});

export default DoctorHomeScreen;