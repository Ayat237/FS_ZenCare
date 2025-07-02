import { StyleSheet } from 'react-native';
import Colors from '@theme/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary500,
  },
  safeAreaTop: {
    flex: 1,
    marginTop: 50,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  formOuterContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingTop: 48,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  formContainer: {
    gap: 5,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  termsText: {
    marginTop: -2,
  },
  inputWrapper: {
    marginBottom: 10,
  },
  errorText: {
    color: Colors.error500,
    fontSize: 12,
    marginTop: 4,
  },
  datePickerButton: {
    height: 55,
    borderWidth: 1,
    borderColor: Colors.accent500,
    borderRadius: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: Colors.accent500,
  },
  calendarIcon: {
    fontSize: 20,
  },
  selectionButton: {
    height: 55,
    borderWidth: 1,
    borderColor: Colors.accent500,
    borderRadius: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  selectionButtonError: {
    borderColor: Colors.error500,
  },
  selectionText: {
    fontSize: 16,
    color: '#333',
  },
  chevronDown: {
    fontSize: 10,
    color: '#555',
  },
  doctorFieldsContainer: {
    marginTop: 20,
    marginBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 20,
  },
  documentUploadContainer: {
    marginBottom: 20,
  },
  // Map related styles
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: Colors.primary400,
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
  fullScreenMapContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 15,
    overflow: 'hidden',
  },
});