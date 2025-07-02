import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Colors from "@theme/colors";

interface AppointmentCardProps {
  appointment: {
    id: number;
    doctorName: string;
    rating: number;
    specialty: string;
    type: string;
    time: string;
    image: any;
  };
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment }) => {
  return (
    <TouchableOpacity style={styles.container}>
      <View style={styles.header}>
        <Image source={appointment.image} style={styles.doctorImage} />
        <View style={styles.doctorInfo}>
          <View style={styles.nameRating}>
            <Text style={styles.doctorName}>{appointment.doctorName}</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>{appointment.rating}</Text>
            </View>
          </View>
          <Text style={styles.specialty}>{appointment.specialty}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.consultationType}>
          <Icon name="video" size={16} color={Colors.primary600} />
          <Text style={styles.consultationText}>{appointment.type}</Text>
        </View>
        <View style={styles.timeContainer}>
          <Icon name="clock-outline" size={16} color="#666" />
          <Text style={styles.timeText}>{appointment.time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    // backgroundColor: Colors.primary200,
    // backgroundColor: "#99C7E6",
    backgroundColor: "#B3D9F7",
    // backgroundColor: "rgba(173, 216, 230)",
    borderRadius: 20,
    padding: 15,
    marginRight: 15,
    width: 300,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  doctorImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  doctorInfo: {
    flex: 1,
  },
  nameRating: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  ratingContainer: {
    backgroundColor: Colors.primary500,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  rating: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  specialty: {
    fontSize: 14,
    color: "#333",
  },
  details: {
    gap: 8,
  },
  consultationType: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  consultationText: {
    fontSize: 14,
    color: Colors.primary600,
    fontWeight: "500",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    color: "#666",
  },
});

export default AppointmentCard;
