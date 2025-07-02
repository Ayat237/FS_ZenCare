import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GENDER_OPTIONS } from "../constants";
import Colors from "@theme/colors";

interface GenderSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (gender: string) => void;
  selectedGender?: string;
}

const GenderSelectionModal: React.FC<GenderSelectionModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedGender,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Gender</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={GENDER_OPTIONS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.genderItem,
                  selectedGender === item.label && styles.selectedGender,
                ]}
                onPress={() => {
                  onSelect(item.label);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.genderLabel,
                    selectedGender === item.label && styles.selectedGenderText,
                  ]}
                >
                  {item.label}
                </Text>
                {selectedGender === item.label && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={Colors.primary500}
                  />
                )}
              </TouchableOpacity>
            )}
            style={styles.genderList}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    width: "100%",
    maxHeight: "80%",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary500,
  },
  genderList: {
    maxHeight: 300,
  },
  genderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedGender: {
    backgroundColor: Colors.primary100,
  },
  genderLabel: {
    fontSize: 16,
  },
  selectedGenderText: {
    fontWeight: "bold",
    color: Colors.primary500,
  },
});

export default GenderSelectionModal;
