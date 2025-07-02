import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Colors from '@theme/colors';

const CustomDrawerContent = (props: any) => {
  // Add null check for state.auth to prevent TypeError
  const loggedUser = useSelector((state: RootState) => state?.auth?.user);
  const user = {
    name: loggedUser?.firstName + ' ' + loggedUser?.lastName,
    email: loggedUser?.email,
    avatar: loggedUser?.profileImage,
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileSection}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerListWrapper}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.bottomButton}>
          <Icon name="cog-outline" size={22} color="#333" />
          <Text style={styles.bottomButtonText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton}>
          <Icon name="logout" size={22} color="#333" />
          <Text style={styles.bottomButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CustomDrawerContent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 5,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  drawerListWrapper: {
    paddingTop: 10,
  },
  bottomSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  bottomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  bottomButtonText: {
    fontSize: 15,
    marginLeft: 12,
    color: '#333',
  },
});