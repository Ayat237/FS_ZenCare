import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Colors from "@theme/colors";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { RootStackParamList } from "@/types/navigation";

// Components
import AppointmentCard from "@components/Home/AppointmentCard";
import MedicineReminderCard from "@components/Home/MedicineReminderCard";

// Define a type that combines both stack and drawer navigation capabilities
type CombinedNavigation = NativeStackNavigationProp<RootStackParamList> &
  DrawerNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  // Use the combined navigation type
  const navigation = useNavigation<CombinedNavigation>();
  // Add null check for state.auth to prevent TypeError
  const loggedUser = useSelector((state: RootState) => state?.auth?.user);
  // console.log("loggedUser: ", loggedUser);
  const user = {
    name: loggedUser?.firstName + " " + loggedUser?.lastName,
    email: loggedUser?.email,
    avatar: loggedUser?.profileImage,
  };

  const appointments = [
    {
      id: 1,
      doctorName: "DR. Ibrahim Mohamed",
      rating: 4.8,
      specialty: "Neurologist",
      type: "Virtual consultation",
      time: "Tue 13, 10:30AM (30 mins)",
      image: require("@/assets/images/doctor1.png"),
    },
    {
      id: 2,
      doctorName: "DR. Moh. Ahmed",
      rating: 4.8,
      specialty: "Neurologist",
      type: "Virtual consultation",
      time: "Wed 14, 2:00PM (45 mins)",
      image: require("@/assets/images/doctor2.png"),
    },
  ];

  const medicines = [
    {
      id: 1,
      name: "Omega3",
      type: "Pills",
      frequency: "once a day",
      timing: "After eat",
      image: require("@/assets/images/drugs2.png"),
      taken: false,
      count: 2,
    },
    {
      id: 2,
      name: "Fludace 60",
      type: "Capsule",
      frequency: "twice a day",
      timing: "After eat",
      image: require("@/assets/images/drugs2.png"),
      taken: true,
    },
    {
      id: 3,
      name: "Fludace 60",
      type: "Capsule",
      frequency: "twice a day",
      timing: "After eat",
      image: require("@/assets/images/drugs2.png"),
      taken: true,
    },
    {
      id: 4,
      name: "Fludace 60",
      type: "Capsule",
      frequency: "twice a day",
      timing: "After eat",
      image: require("@/assets/images/drugs2.png"),
      taken: true,
    },
  ];

  const [activeTab, setActiveTab] = useState("Today");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <View>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Icon name="menu" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView}>
        {/* Header */}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Icon name="magnify" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for doctors..."
              placeholderTextColor="#666"
            />
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() =>
              navigation.navigate("Drawer", { screen: "Notifications" })
            }
          >
            <Icon name="bell-outline" size={24} color={Colors.primary500} />
          </TouchableOpacity>
        </View>

        {/* Upcoming Appointments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.appointmentsContainer}
          >
            {appointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </ScrollView>
        </View>

        {/* Medicine Reminders */}
        <View style={[styles.section, styles.medicineSection]}>
          <Text style={styles.sectionTitle}>Medicine reminders</Text>
          <View style={styles.reminderTabs}>
            {["Yesterday", "Today", "Tomorrow"].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.medicineList}>
            {medicines.map((medicine) => (
              <MedicineReminderCard key={medicine.id} medicine={medicine} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const screenHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0F0",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
    backgroundColor: Colors.primary500,
    
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    marginBottom: 15,
    height: 100,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
  userEmail: {
    color: "#FFF",
    fontSize: 14,
    opacity: 0.8,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 3,
    alignItems: "center",
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 45,
    borderWidth: 1,
    borderColor: Colors.primary200,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  notificationButton: {
    backgroundColor: "#fff",
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary200,
  },
  section: {
    padding: 20,
  },
  medicineSection: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    minHeight: screenHeight * 0.45,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primary600,
    marginBottom: 15,
  },
  appointmentsContainer: {
    paddingRight: 20,
  },
  reminderTabs: {
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    borderRadius: 25,
    padding: 5,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: Colors.primary500,
  },
  tabText: {
    fontSize: 14,
    color: "#666",
  },
  activeTabText: {
    color: "#FFF",
    fontWeight: "500",
  },
  medicineList: {
    gap: 12,
  },
});

export default HomeScreen;
