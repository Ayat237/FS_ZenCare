import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '@theme/colors';
import { TelemedicineSession } from '../../types/telemedicine';
import MockVideoCall from '../../components/MockVideoCall';

interface CallDetails {
  callId: string;
  participant: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  clinicLocation?: {
    latitude: number;
    longitude: number;
    displayName?: string;
  };
}

const DoctorTelemedicineScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const session = route.params?.session as TelemedicineSession | undefined;
  
  const [isInCall, setIsInCall] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentCall, setCurrentCall] = useState<CallDetails | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(true);
  const [callHistory, setCallHistory] = useState<CallDetails[]>([]);
  // Removed webViewRef as we're using MockVideoCall now

  // Mock clinic location (would be fetched from user profile in a real app)
  const clinicLocation = {
    latitude: 25.2048,
    longitude: 55.2708,
    displayName: 'Dubai Healthcare City',
  };

  // Mock permission check - always granted for testing without build
  const checkPermissions = () => {
    console.log('Permissions automatically granted for testing');
    setPermissionGranted(true);
  };

  const generateCallId = () => {
    // Generate a unique call ID using timestamp and random string
    return `call-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  };

  const startVideoCall = () => {
    if (!permissionGranted) {
      checkPermissions();
    }

    setLoading(true);

    try {
      const callId = generateCallId();
      const roomName = `zencare-${callId}`;
      const userInfo = {
        displayName: 'Dr. John Doe', // Would be fetched from user profile
        email: 'doctor@example.com', // Would be fetched from user profile
      };

      // Create call details object
      const newCall: CallDetails = {
        callId,
        participant: session?.patientName || 'Patient',
        startTime: new Date(),
        clinicLocation,
      };

      setCurrentCall(newCall);
      console.log(`Initiating call: ID=${callId}, Room=${roomName}`);
      
      // Set isInCall to true to show the WebView
      setIsInCall(true);
      console.log(`Call connected: ID=${callId}`);
    } catch (err) {
      console.error('Error starting video call:', err);
      setLoading(false);
      Alert.alert(
        'Error',
        'Failed to start video call. Please try again.',
        [{ text: 'OK', onPress: () => {} }]
      );
    }
  };
  
  const handleCallEnd = () => {
    endVideoCall();
  };

  const endVideoCall = () => {
    if (currentCall) {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - currentCall.startTime.getTime()) / 1000);
      const completedCall = { ...currentCall, endTime, duration };
      
      setCallHistory(prev => [...prev, completedCall]);
      setCurrentCall(null);
      
      console.log(`Call ended manually: ID=${completedCall.callId}, Duration=${duration}s, End Time=${endTime.toISOString()}`);
      if (completedCall.clinicLocation) {
        console.log(`Call clinic location: Latitude=${completedCall.clinicLocation.latitude}, Longitude=${completedCall.clinicLocation.longitude}${completedCall.clinicLocation.displayName ? `, Address=${completedCall.clinicLocation.displayName}` : ''}`);
      }
    }
    
    setIsInCall(false);
  };

  return (
    <>
      {isInCall && currentCall ? (
        <MockVideoCall
          roomName={`zencare-${currentCall.callId}`}
          displayName="Dr. John Doe"
          email="doctor@example.com"
          onCallEnd={handleCallEnd}
          isModerator={true}
        />
      ) : (
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
              <Icon name="menu" size={24} color={Colors.primary600} />
            </TouchableOpacity>
            <Text style={styles.title}>Telemedicine</Text>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                {session ? `Consultation with ${session.patientName}` : 'Start a Video Consultation'}
              </Text>
              <Text style={styles.cardDescription}>
                {session 
                  ? `${session.type === 'video' ? 'Video' : 'Voice'} call scheduled for ${session.date} at ${session.time}. Make sure you have a stable internet connection.`
                  : 'Connect with your patients through secure video calls. Make sure you have a stable internet connection.'}
              </Text>
          ) : (
            <TouchableOpacity 
              style={[styles.button, styles.startCallButton]} 
              onPress={startVideoCall}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="video" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Start Video Call</Text>
                </>
              )}
            </TouchableOpacity>
          )
        </View>

        {callHistory.length > 0 && (
          <View style={styles.historyCard}>
            <Text style={styles.cardTitle}>Recent Calls</Text>
            {callHistory.map((call, index) => (
              <View key={call.callId} style={styles.historyItem}>
                <View style={styles.historyItemHeader}>
                  <Text style={styles.historyItemTitle}>Call with {call.participant}</Text>
                  <Text style={styles.historyItemTime}>
                    {new Date(call.startTime).toLocaleDateString()} at {new Date(call.startTime).toLocaleTimeString()}
                  </Text>
                </View>
                <Text style={styles.historyItemDetail}>
                  Duration: {call.duration} seconds
                </Text>
                {call.clinicLocation && (
                  <Text style={styles.historyItemDetail}>
                    Location: {call.clinicLocation.displayName || `${call.clinicLocation.latitude.toFixed(4)}, ${call.clinicLocation.longitude.toFixed(4)}`}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
  },
  menuButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary600,
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
    height: 400,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.primary600,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 20,
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  startCallButton: {
    backgroundColor: Colors.primary500,
  },
  endCallButton: {
    backgroundColor: '#E53935',
  },
  buttonText: {
    color: Colors.white,
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  callActiveContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    marginBottom: 16,
  },
  callActiveText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary600,
    marginBottom: 8,
  },
  callIdText: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  callTimeText: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 16,
  },
  historyCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyItemTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
  },
  historyItemTime: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  historyItemDetail: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 2,
  },
});

export default DoctorTelemedicineScreen;