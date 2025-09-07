import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform, ScrollView } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '@/theme/colors';
import PDFViewerStandalone from '@/components/doctor/PDFViewerStandalone';

const PDFViewerTestScreen: React.FC = () => {
  const navigation = useNavigation();
  const [showPdfInline, setShowPdfInline] = useState(false);
  
  // Get the lab result PDF path based on platform
  const labResultPdfPath = Platform.OS === 'android' 
    ? 'file:///android_asset/lab result.pdf' // Android assets folder
    : 'file://lab result.pdf'; // iOS bundle

  const toggleInlinePdfViewer = () => {
    setShowPdfInline(!showPdfInline);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.primary500} barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PDF Viewer Test</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>PDF Viewer Demo</Text>
        <Text style={styles.description}>
          This screen demonstrates different ways to view PDF files in the app.
          Select one of the options below to see the PDF viewer in action.
        </Text>

        <TouchableOpacity 
          style={styles.card}
          onPress={() => {
            navigation.dispatch(
              CommonActions.navigate({
                name: 'LabResult',
                params: {
                  filePath: labResultPdfPath,
                  title: 'Lab Result PDF'
                }
              })
            );
          }}
        >
          <View style={styles.cardContent}>
            <Icon 
              name="file-pdf-box" 
              size={32} 
              color={Colors.primary500} 
              style={styles.cardIcon} 
            />
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>View Lab Result PDF</Text>
              <Text style={styles.cardDate}>Open in full screen viewer</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card}
          onPress={toggleInlinePdfViewer}
        >
          <View style={styles.cardContent}>
            <Icon 
              name="file-pdf-outline" 
              size={32} 
              color={Colors.secondary500} 
              style={styles.cardIcon} 
            />
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Toggle Inline PDF Viewer</Text>
              <Text style={styles.cardDate}>{showPdfInline ? 'Hide' : 'Show'} PDF inline on this screen</Text>
            </View>
          </View>
        </TouchableOpacity>

        {showPdfInline && (
          <View style={styles.inlinePdfContainer}>
            <PDFViewerStandalone 
              filePath={labResultPdfPath}
              showControls={true}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.primary500,
    ...Platform.select({
      ios: {
        paddingTop: 50,
      },
      android: {
        paddingTop: StatusBar.currentHeight,
      },
    }),
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: Colors.gray,
    marginBottom: 24,
    lineHeight: 22,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  cardIcon: {
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 14,
    color: Colors.gray,
  },
  inlinePdfContainer: {
    height: 500,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.primary100,
  },
});

export default PDFViewerTestScreen;