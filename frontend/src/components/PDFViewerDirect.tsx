import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import Pdf from 'react-native-pdf';
import Colors from '@/theme/colors';

interface PDFViewerDirectProps {
  source: { uri: string } | number; // Can be a URI or a require'd asset
  title?: string;
}

/**
 * A direct PDF viewer component using react-native-pdf
 * Note: This component requires the react-native-pdf package to be installed
 * npm install react-native-pdf
 * 
 * This is an alternative to the WebView-based PDF viewer
 */
const PDFViewerDirect: React.FC<PDFViewerDirectProps> = ({ source, title }) => {
  return (
    <View style={styles.container}>
      {title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
        </View>
      )}
      
      <View style={styles.pdfContainer}>
        {/* 
          Note: This component requires the react-native-pdf package
          If you want to use this component, you need to install it first:
          npm install react-native-pdf
          
          Uncomment the Pdf component below after installing the package
        */}
        {/* 
        <Pdf
          source={source}
          onLoadComplete={(numberOfPages, filePath) => {
            console.log(`PDF loaded with ${numberOfPages} pages`);
          }}
          onPageChanged={(page, numberOfPages) => {
            console.log(`Current page: ${page}`);
          }}
          onError={(error) => {
            console.log(error);
          }}
          style={styles.pdf}
        />
        */}
        
        {/* This is a placeholder that will be shown until you install react-native-pdf */}
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>
            To use this component, you need to install react-native-pdf:
          </Text>
          <Text style={styles.placeholderCode}>
            npm install react-native-pdf
          </Text>
          <Text style={styles.placeholderText}>
            Then uncomment the Pdf component in PDFViewerDirect.tsx
          </Text>
        </View>
      </View>
    </View>
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
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.primary500,
    ...Platform.select({
      ios: {
        paddingTop: 50,
      },
      android: {
        paddingTop: 0,
      },
    }),
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
  },
  pdfContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: Colors.background,
  },
  placeholderContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  placeholderCode: {
    fontSize: 16,
    color: Colors.primary500,
    fontWeight: 'bold',
    backgroundColor: Colors.primary100,
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
});

export default PDFViewerDirect;