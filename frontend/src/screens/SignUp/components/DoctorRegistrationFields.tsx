import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import InputField from '@components/ui/inputs/InputField';
import Colors from '@theme/colors';
import { Education, HospitalAffiliation, ClinicBranch, Address } from '@/types/doctor';
import SearchableMapExample from '@/components/maps/SearchableMapExample';

interface DoctorRegistrationFieldsProps {
  formData: {
    specialty: string;
    yearsOfExperience: number | string;
    education: Education[];
    certifications: string[];
    hospitalAffiliations: HospitalAffiliation[];
    clinicBranches: ClinicBranch[];
  };
  onFormDataChange: (newData: any) => void;
  errors: {
    specialty?: string;
    yearsOfExperience?: string;
    education?: string;
    certifications?: string;
    hospitalAffiliations?: string;
    clinicBranches?: string;
  };
}

const DoctorRegistrationFields: React.FC<DoctorRegistrationFieldsProps> = ({
  formData,
  onFormDataChange,
  errors,
}) => {
  const [showMapModal, setShowMapModal] = useState(false);
  const [currentBranchIndex, setCurrentBranchIndex] = useState<number | null>(null);
  const [newCertification, setNewCertification] = useState('');
  
  // Predefined specialties list
  const Specialties = { 
    ALLERGY_IMMUNOLOGY: "Allergy and Immunology", 
    ANESTHESIOLOGY: "Anesthesiology", 
    CARDIOLOGY: "Cardiology", 
    CARDIOTHORACIC_SURGERY: "Cardiothoracic Surgery", 
    COLORECTAL_SURGERY: "Colorectal Surgery", 
    CRITICAL_CARE_MEDICINE: "Critical Care Medicine", 
    DERMATOLOGY: "Dermatology", 
    EMERGENCY_MEDICINE: "Emergency Medicine", 
    ENDOCRINOLOGY: "Endocrinology", 
    FAMILY_MEDICINE: "Family Medicine", 
    FORENSIC_PATHOLOGY: "Forensic Pathology", 
    GASTROENTEROLOGY: "Gastroenterology", 
    GERIATRICS: "Geriatrics", 
    GENERAL_SURGERY: "General Surgery", 
    GYNECOLOGY: "Gynecology", 
    HEMATOLOGY: "Hematology", 
    INFECTIOUS_DISEASE: "Infectious Disease", 
    INTERNAL_MEDICINE: "Internal Medicine", 
    INTERVENTIONAL_CARDIOLOGY: "Interventional Cardiology", 
    INTERVENTIONAL_RADIOLOGY: "Interventional Radiology", 
    MEDICAL_GENETICS: "Medical Genetics", 
    MEDICAL_ONCOLOGY: "Medical Oncology", 
    NEPHROLOGY: "Nephrology", 
    NEUROLOGY: "Neurology", 
    NEUROSURGERY: "Neurosurgery", 
    NUCLEAR_MEDICINE: "Nuclear Medicine", 
    OBSTETRICS: "Obstetrics", 
    OCCUPATIONAL_MEDICINE: "Occupational Medicine", 
    ONCOLOGY: "Oncology", 
    OPHTHALMOLOGY: "Ophthalmology", 
    ORAL_MAXILLOFACIAL_SURGERY: "Oral and Maxillofacial Surgery", 
    ORTHOPEDIC_SURGERY: "Orthopedic Surgery", 
    OTOLARYNGOLOGY: "Otolaryngology (ENT)", 
    PAIN_MEDICINE: "Pain Medicine", 
    PALLIATIVE_CARE: "Palliative Care", 
    PATHOLOGY: "Pathology", 
    PEDIATRICS: "Pediatrics", 
    PHYSICAL_MEDICINE_REHAB: "Physical Medicine and Rehabilitation", 
    PLASTIC_SURGERY: "Plastic Surgery", 
    PSYCHIATRY: "Psychiatry", 
    PULMONOLOGY: "Pulmonology", 
    RADIATION_ONCOLOGY: "Radiation Oncology", 
    RADIOLOGY: "Radiology", 
    REPRODUCTIVE_ENDOCRINOLOGY: "Reproductive Endocrinology and Infertility", 
    RHEUMATOLOGY: "Rheumatology", 
    SLEEP_MEDICINE: "Sleep Medicine", 
    SPORTS_MEDICINE: "Sports Medicine", 
    SURGICAL_ONCOLOGY: "Surgical Oncology", 
    THORACIC_SURGERY: "Thoracic Surgery", 
    TRANSFUSION_MEDICINE: "Transfusion Medicine", 
    TRANSPLANT_SURGERY: "Transplant Surgery", 
    TRAUMA_SURGERY: "Trauma Surgery", 
    UROLOGY: "Urology", 
    VASCULAR_SURGERY: "Vascular Surgery" 
  };
  
  const specialtiesList = Object.values(Specialties);

  // State for specialty dropdown
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false);
  
  // Handle specialty selection
  const handleSpecialtyChange = (value: string) => {
    onFormDataChange({ ...formData, specialty: value });
    setShowSpecialtyDropdown(false);
  };

  // Handle years of experience change
  const handleYearsOfExperienceChange = (value: string) => {
    const numValue = value === '' ? '' : parseInt(value, 10);
    onFormDataChange({ ...formData, yearsOfExperience: numValue });
  };

  // Handle education changes
  const handleEducationChange = (index: number, field: keyof Education, value: string | number) => {
    const updatedEducation = [...formData.education];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    onFormDataChange({ ...formData, education: updatedEducation });
  };

  // Add new education entry
  const addEducation = () => {
    const newEducation = { degree: '', institution: '', graduationYear: new Date().getFullYear() };
    onFormDataChange({ ...formData, education: [...formData.education, newEducation] });
  };

  // Remove education entry
  const removeEducation = (index: number) => {
    const updatedEducation = [...formData.education];
    updatedEducation.splice(index, 1);
    onFormDataChange({ ...formData, education: updatedEducation });
  };

  // Handle certifications
  const addCertification = () => {
    if (newCertification.trim()) {
      onFormDataChange({
        ...formData,
        certifications: [...formData.certifications, newCertification.trim()],
      });
      setNewCertification('');
    }
  };

  const removeCertification = (index: number) => {
    const updatedCertifications = [...formData.certifications];
    updatedCertifications.splice(index, 1);
    onFormDataChange({ ...formData, certifications: updatedCertifications });
  };

  // Handle hospital affiliations
  const handleHospitalChange = (index: number, name: string) => {
    const updatedAffiliations = [...formData.hospitalAffiliations];
    updatedAffiliations[index] = { name };
    onFormDataChange({ ...formData, hospitalAffiliations: updatedAffiliations });
  };

  const addHospital = () => {
    onFormDataChange({
      ...formData,
      hospitalAffiliations: [...formData.hospitalAffiliations, { name: '' }],
    });
  };

  const removeHospital = (index: number) => {
    const updatedAffiliations = [...formData.hospitalAffiliations];
    updatedAffiliations.splice(index, 1);
    onFormDataChange({ ...formData, hospitalAffiliations: updatedAffiliations });
  };

  // Handle clinic branches
  const handleClinicBranchChange = (index: number, field: string, value: any) => {
    const updatedBranches = [...formData.clinicBranches];
    
    if (field === 'address') {
      updatedBranches[index] = {
        ...updatedBranches[index],
        address: { ...updatedBranches[index].address, ...value },
      };
    } else {
      updatedBranches[index] = { ...updatedBranches[index], [field]: value };
    }
    
    onFormDataChange({ ...formData, clinicBranches: updatedBranches });
  };

  const addClinicBranch = () => {
    const newBranch: ClinicBranch = {
      address: {
        street: '',
        city: '',
        country: '',
        coordinates: {
          longitude: 0,
          latitude: 0,
        },
      },
      phoneNumber: '',
    };
    onFormDataChange({
      ...formData,
      clinicBranches: [...formData.clinicBranches, newBranch],
    });
  };

  const removeClinicBranch = (index: number) => {
    const updatedBranches = [...formData.clinicBranches];
    updatedBranches.splice(index, 1);
    onFormDataChange({ ...formData, clinicBranches: updatedBranches });
  };

  // Handle map selection
  const openMapForBranch = (index: number) => {
    setCurrentBranchIndex(index);
    setShowMapModal(true);
  };

  const handleLocationConfirmed = async (location: { latitude: number; longitude: number; displayName?: string }) => {
    if (currentBranchIndex === null) return;
    
    try {
      // First, create a new address object with the coordinates
      // This ensures we always have the coordinates even if the API call fails
      const updatedBranches = [...formData.clinicBranches];
      
      // Reset the address to ensure we don't keep old data
      updatedBranches[currentBranchIndex] = {
        ...updatedBranches[currentBranchIndex],
        address: {
          street: '',
          city: '',
          country: '',
          neighborhood: '',
          buildingName: updatedBranches[currentBranchIndex].address.buildingName || '',
          buildingNumber: updatedBranches[currentBranchIndex].address.buildingNumber,
          coordinates: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        },
      };
      
      // Call the OpenStreetMap API to get address details
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}&zoom=18&addressdetails=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        const address = data.address;
        
        // Update the clinic branch with the address information
        updatedBranches[currentBranchIndex].address = {
          ...updatedBranches[currentBranchIndex].address,
          street: address.road || '',
          city: address.city || address.state || '',
          country: address.country || '',
          neighborhood: address.suburb || '',
        };
      }
      
      // Update the form data with the new branches
      onFormDataChange({ ...formData, clinicBranches: updatedBranches });
      console.log('Updated branch address:', updatedBranches[currentBranchIndex].address);
    } catch (error) {
      console.error('Error fetching address details:', error);
      
      // Even if there's an error, we still want to update the coordinates
      const updatedBranches = [...formData.clinicBranches];
      updatedBranches[currentBranchIndex] = {
        ...updatedBranches[currentBranchIndex],
        address: {
          ...updatedBranches[currentBranchIndex].address,
          coordinates: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        },
      };
      
      onFormDataChange({ ...formData, clinicBranches: updatedBranches });
    }
    
    setShowMapModal(false);
    setCurrentBranchIndex(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Doctor Information</Text>
      
      {/* Specialty */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Specialty</Text>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={[styles.dropdown, errors.specialty && styles.errorBorder]}
            onPress={() => setShowSpecialtyDropdown(true)}
          >
            <Text style={[styles.dropdownText, !formData.specialty && styles.placeholderText]}>
              {formData.specialty || "Select your specialty"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        {errors.specialty && <Text style={styles.errorText}>{errors.specialty}</Text>}
        
        {/* Specialty Dropdown Modal */}
        <Modal
          visible={showSpecialtyDropdown}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowSpecialtyDropdown(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.specialtyModalContent}>
              <View style={styles.specialtyModalHeader}>
                <Text style={styles.specialtyModalTitle}>Select Specialty</Text>
                <TouchableOpacity onPress={() => setShowSpecialtyDropdown(false)}>
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={specialtiesList}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[styles.specialtyItem, formData.specialty === item && styles.selectedSpecialty]}
                    onPress={() => handleSpecialtyChange(item)}
                  >
                    <Text style={[styles.specialtyItemText, formData.specialty === item && styles.selectedSpecialtyText]}>{item}</Text>
                    {formData.specialty === item && (
                      <Ionicons name="checkmark" size={20} color={Colors.primary500} />
                    )}
                  </TouchableOpacity>
                )}
                style={styles.specialtyList}
              />
            </View>
          </View>
        </Modal>
      </View>
      
      {/* Years of Experience */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Years of Experience</Text>
        <InputField
          label="Experience"
          placeholder="Enter years of experience"
          value={formData.yearsOfExperience.toString()}
          onChangeText={handleYearsOfExperienceChange}
          keyboardType="numeric"
          error={errors.yearsOfExperience}
        />
      </View>
      
      {/* Education */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Education</Text>
        {formData.education.map((edu, index) => (
          <View key={index} style={styles.multiItemContainer}>
            <InputField
              label="Degree"
              placeholder="Degree (e.g., MBBS)"
              value={edu.degree}
              onChangeText={(value) => handleEducationChange(index, 'degree', value)}
              style={styles.multiItemField}
            />
            <InputField
              label="Institution"
              placeholder="Institution"
              value={edu.institution}
              onChangeText={(value) => handleEducationChange(index, 'institution', value)}
              style={styles.multiItemField}
            />
            <InputField
              label="Year"
              placeholder="Year"
              value={edu.graduationYear.toString()}
              onChangeText={(value) => handleEducationChange(index, 'graduationYear', parseInt(value) || new Date().getFullYear())}
              keyboardType="numeric"
              style={styles.multiItemField}
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeEducation(index)}
            >
              <Ionicons name="close-circle" size={24} color={Colors.error} />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addButton} onPress={addEducation}>
          <Text style={styles.addButtonText}>+ Add Education</Text>
        </TouchableOpacity>
        {errors.education && <Text style={styles.errorText}>{errors.education}</Text>}
      </View>
      
      {/* Certifications */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Certifications</Text>
        <View style={styles.tagsContainer}>
          {formData.certifications.map((cert, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{cert}</Text>
              <TouchableOpacity onPress={() => removeCertification(index)}>
                <Ionicons name="close-circle" size={16} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <View style={styles.addTagContainer}>
          <InputField
            label="Certification"
            placeholder="Add certification (e.g., ACLS)"
            value={newCertification}
            onChangeText={setNewCertification}
            style={styles.tagInput}
          />
          <TouchableOpacity style={styles.addTagButton} onPress={addCertification}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        {errors.certifications && <Text style={styles.errorText}>{errors.certifications}</Text>}
      </View>
      
      {/* Hospital Affiliations */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Hospital Affiliations</Text>
        {formData.hospitalAffiliations.map((hospital, index) => (
          <View key={index} style={styles.hospitalContainer}>
            <InputField
              label="Hospital"
              placeholder="Hospital name"
              value={hospital.name}
              onChangeText={(value) => handleHospitalChange(index, value)}
              style={styles.hospitalInput}
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeHospital(index)}
            >
              <Ionicons name="close-circle" size={24} color={Colors.error} />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addButton} onPress={addHospital}>
          <Text style={styles.addButtonText}>+ Add Hospital</Text>
        </TouchableOpacity>
        {errors.hospitalAffiliations && <Text style={styles.errorText}>{errors.hospitalAffiliations}</Text>}
      </View>
      
      {/* Clinic Branches */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Clinic Branches</Text>
        {formData.clinicBranches.map((branch, index) => (
          <View key={index} style={styles.branchContainer}>
            <Text style={styles.branchTitle}>Branch {index + 1}</Text>
            
            <TouchableOpacity 
              style={styles.mapButton}
              onPress={() => openMapForBranch(index)}
            >
              <Ionicons name="map-outline" size={20} color="white" />
              <Text style={styles.mapButtonText}>Add Address from Map</Text>
            </TouchableOpacity>
            
            {(branch.address.coordinates.latitude !== 0 && branch.address.coordinates.longitude !== 0) && (
              <Text style={styles.addressHelpText}>
                Location selected. Please ensure phone number is provided.
              </Text>
            )}
            
            {(branch.address.coordinates.latitude !== 0 && branch.address.coordinates.longitude !== 0) ? (
              <View style={styles.addressPreview}>
                <View style={styles.addressHeaderRow}>
                  <Ionicons name="location" size={20} color={Colors.primary500} />
                  <Text style={styles.addressHeaderText}>Location Selected</Text>
                </View>
                <Text style={styles.addressText}>
                  {branch.address.street ? `${branch.address.street}, ` : ''}{branch.address.neighborhood || ''}
                </Text>
                <Text style={styles.addressText}>
                  {branch.address.city ? `${branch.address.city}, ` : ''}{branch.address.country || 'Unknown location'}
                </Text>
                <Text style={styles.coordsText}>
                  Lat: {branch.address.coordinates.latitude.toFixed(4)}, 
                  Lon: {branch.address.coordinates.longitude.toFixed(4)}
                </Text>
              </View>
            ) : (
              <View style={styles.noAddressContainer}>
                <Text style={styles.noAddressText}>No location selected</Text>
                <Text style={styles.noAddressSubtext}>Please select a location from the map</Text>
              </View>
            )}
            
            <InputField
              label="Building Name"
              placeholder="Building Name"
              value={branch.address.buildingName || ''}
              onChangeText={(value) => handleClinicBranchChange(index, 'address', { buildingName: value })}
            />
            
            <InputField
              label="Building Number"
              placeholder="Building Number"
              value={branch.address.buildingNumber?.toString() || ''}
              onChangeText={(value) => handleClinicBranchChange(index, 'address', { buildingNumber: parseInt(value) || undefined })}
              keyboardType="numeric"
            />
            
            <InputField
              label="Phone Number"
              placeholder="Phone Number"
              value={branch.phoneNumber}
              onChangeText={(value) => handleClinicBranchChange(index, 'phoneNumber', value)}
              keyboardType="phone-pad"
            />
            
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeClinicBranch(index)}
            >
              <Ionicons name="trash-outline" size={24} color={Colors.error} />
              <Text style={styles.removeText}>Remove Branch</Text>
            </TouchableOpacity>
          </View>
        ))}
        
        <TouchableOpacity style={styles.addButton} onPress={addClinicBranch}>
          <Text style={styles.addButtonText}>+ Add Branch</Text>
        </TouchableOpacity>
        {errors.clinicBranches && <Text style={styles.errorText}>{errors.clinicBranches}</Text>}
      </View>

      {/* Map Modal */}
      <Modal
        visible={showMapModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowMapModal(false);
          setCurrentBranchIndex(null);
        }}
      >
        <View style={styles.fullScreenModalContainer}>
          <View style={styles.fullScreenModalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                setShowMapModal(false);
                setCurrentBranchIndex(null);
              }}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.fullScreenMapContainer}>
              <SearchableMapExample
                onConfirmLocation={handleLocationConfirmed}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary500,
    marginBottom: 15,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: Colors.primary400,
  },
  dropdownContainer: {
    width: '100%',
  },
  dropdown: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
  },
  placeholderText: {
    color: '#999',
  },
  errorBorder: {
    borderColor: Colors.error500,
  },
  errorText: {
    color: Colors.error500,
    fontSize: 12,
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  specialtyModalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '100%',
    maxHeight: '80%',
    padding: 20,
  },
  specialtyModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  specialtyModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary500,
  },
  specialtyList: {
    maxHeight: 400,
  },
  specialtyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedSpecialty: {
    backgroundColor: Colors.primary100,
  },
  specialtyItemText: {
    fontSize: 16,
  },
  selectedSpecialtyText: {
    fontWeight: 'bold',
    color: Colors.primary500,
  },
  multiItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  multiItemField: {
    flex: 1,
    marginRight: 5,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  removeText: {
    color: Colors.error,
    marginLeft: 5,
  },
  addButton: {
    backgroundColor: Colors.primary100,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: Colors.primary500,
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tag: {
    backgroundColor: Colors.primary500,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    margin: 5,
  },
  tagText: {
    color: 'white',
    marginRight: 5,
  },
  addTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    marginRight: 10,
  },
  addTagButton: {
    backgroundColor: Colors.primary100,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  hospitalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  hospitalInput: {
    flex: 1,
    marginRight: 10,
  },
  branchContainer: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  branchTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.primary500,
  },
  mapButton: {
    backgroundColor: Colors.primary500,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  mapButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  addressPreview: {
    backgroundColor: '#e8f4ff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.primary200,
  },
  addressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary200,
  },
  addressHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary500,
    marginLeft: 8,
  },
  addressText: {
    fontSize: 14,
    marginBottom: 3,
  },
  coordsText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  noAddressContainer: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noAddressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 5,
  },
  addressHelpText: {
    fontSize: 12,
    color: Colors.primary500,
    fontStyle: 'italic',
    marginTop: -10,
    marginBottom: 10,
  },
  noAddressSubtext: {
    fontSize: 14,
    color: '#999',
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
    height: '80%',
    padding: 20,
    position: 'relative',
  },
  fullScreenModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenModalContent: {
    width: '90%',
    height: '90%',
    maxHeight: 600,
    maxWidth: 600,
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  mapContainer: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  fullScreenMapContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 15,
    overflow: 'hidden',
  },
});

export default DoctorRegistrationFields;