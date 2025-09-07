import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Colors from "@theme/colors";

interface MedicineReminderCardProps {
  medicine: {
    id: number;
    name: string;
    type: string;
    frequency: string;
    timing: string;
    image: any;
    taken: boolean;
    count?: number;
  };
}

const MedicineReminderCard: React.FC<MedicineReminderCardProps> = ({
  medicine,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <View style={styles.imageContainer}>
          <Image source={medicine.image} style={styles.medicineImage} />
        </View>
        <View style={styles.medicineInfo}>
          <Text style={styles.medicineName}>{medicine.name}</Text>
          <Text style={styles.medicineType}>
            {medicine.type}, {medicine.frequency}
          </Text>
          <View style={styles.timingContainer}>
            <Icon name="clock-outline" size={14} color="#666" />
            <Text style={styles.timingText}>{medicine.timing}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.checkButton, medicine.taken && styles.checkButtonTaken]}
      >
        {medicine.taken ? (
          <Icon name="check" size={20} color="#FFF" />
        ) : (
          <Text style={styles.pillCount}>{medicine.count}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  imageContainer: {
    width: 45,
    height: 45,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  medicineImage: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  medicineType: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  timingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timingText: {
    fontSize: 14,
    color: "#666",
  },
  checkButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  checkButtonTaken: {
    backgroundColor: Colors.primary600,
  },
  pillCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
});

export default MedicineReminderCard;
