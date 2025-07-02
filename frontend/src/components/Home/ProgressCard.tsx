import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import Colors from "@theme/colors";

interface ProgressCardProps {
  progress: {
    recovery: number;
    diagnoses: number;
  };
}

const ProgressCard: React.FC<ProgressCardProps> = ({ progress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={styles.progressItem}>
          <View style={styles.labelContainer}>
            <Text style={styles.progressLabel}>Recovery</Text>
            <Text style={styles.progressValue}>{progress.recovery}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[styles.progressBar, { width: `${progress.recovery}%` }]}
            />
          </View>
        </View>

        <View style={styles.progressItem}>
          <View style={styles.labelContainer}>
            <Text style={styles.progressLabel}>Diagnoses</Text>
            <Text style={styles.progressValue}>{progress.diagnoses}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[styles.progressBar, { width: `${progress.diagnoses}%` }]}
            />
          </View>
        </View>
      </View>
      <Image
        source={require("@/assets/images/doctor1.png")}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#E8F3FF",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressContainer: {
    flex: 1,
    marginRight: 20,
  },
  progressItem: {
    marginBottom: 15,
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  progressValue: {
    fontSize: 14,
    color: Colors.primary600,
    fontWeight: "600",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#FFF",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.primary600,
    borderRadius: 3,
  },
  image: {
    width: 120,
    height: 80,
  },
});

export default ProgressCard;
