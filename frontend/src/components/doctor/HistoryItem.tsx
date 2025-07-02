import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '@/theme/colors';
import { formattedDate } from '@/utils/formattedDate';
import PDFViewer from './PDFViewer';
import { useNavigation, CommonActions } from '@react-navigation/native';

interface HistoryItemProps {
  text: string;
  date?: string;
  isLabResult?: boolean;
  onViewFile?: () => void;
  filePath?: number; // React Native's require returns a number
}

const HistoryItem: React.FC<HistoryItemProps> = ({ 
  text, 
  date, 
  isLabResult = false,
  onViewFile,
  filePath
}) => {
  const navigation = useNavigation();
  const [isPdfVisible, setIsPdfVisible] = useState(false);
  
  // Convert the require'd asset to a file path for WebView
  const getFilePath = () => {
    if (typeof filePath === 'number') {
      // For Android, we need to use the file:///android_asset/ prefix
      // For iOS, we need to use the file:// prefix
      // This is a simplified approach for demo purposes
      return Platform.OS === 'android' 
        ? 'file:///android_asset/lab result.pdf'
        : 'file://lab result.pdf';
    }
    return '';
  };
  
  if (isLabResult) {
    return (
      <>
        <View style={styles.labResultItem}>
          <View style={styles.labResultInfo}>
            <Text style={styles.itemText}>{text}</Text>
            {date && <Text style={styles.dateText}>{formattedDate(date)}</Text>}
          </View>
          <TouchableOpacity 
            style={styles.viewFileButton}
            onPress={() => {
              if (filePath) {
                // Option 1: Use the modal PDF viewer (original implementation)
                // setIsPdfVisible(true);
                
                // Option 2: Navigate to the standalone PDF viewer screen
                // Use CommonActions to navigate to a nested screen
                navigation.dispatch(
                  CommonActions.navigate({
                    name: 'LabResult',
                    params: {
                      filePath: getFilePath(),
                      title: text,
                    },
                  })
                );
              } else if (onViewFile) {
                onViewFile();
              }
            }}
          >
            <Text style={styles.viewFileText}>View File</Text>
            <Icon name="file-document-outline" size={16} color={Colors.white} />
          </TouchableOpacity>
        </View>
        
        {/* Option 1: Modal PDF viewer (original implementation) */}
        {filePath && isPdfVisible && (
          <PDFViewer
            filePath={filePath}
            visible={isPdfVisible}
            onClose={() => setIsPdfVisible(false)}
            title={text}
          />
        )}
      </>
    );
  }

  return (
    <View style={styles.historyItem}>
      <View style={styles.bulletPoint} />
      <Text style={styles.itemText}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginVertical: 2,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary500,
    marginRight: 12,
    marginLeft: 4,
  },
  itemText: {
    fontSize: 15,
    color: Colors.text,
    flex: 1,
    lineHeight: 22,
  },
  labResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  labResultInfo: {
    flex: 1,
  },
  dateText: {
    fontSize: 13,
    color: Colors.gray,
    marginTop: 6,
  },
  viewFileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary500,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  viewFileText: {
    fontSize: 12,
    color: Colors.white,
    marginRight: 6,
    fontWeight: '500',
  },
});

export default HistoryItem;