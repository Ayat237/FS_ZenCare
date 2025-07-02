import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import PDFViewerStandalone from '@/components/doctor/PDFViewerStandalone';
import Colors from '@/theme/colors';

type LabResultScreenParams = {
  LabResult: {
    filePath: string;
    title?: string;
  };
};

const LabResultScreen: React.FC = () => {
  const route = useRoute<RouteProp<LabResultScreenParams, 'LabResult'>>();
  const { filePath, title } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <PDFViewerStandalone 
        filePath={filePath}
        title={title || 'Lab Result'}
        showControls={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});

export default LabResultScreen;