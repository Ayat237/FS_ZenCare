import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '@theme/colors';
import MockVideoCall from '../../components/MockVideoCall';

const TelemedicineTestScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [roomName, setRoomName] = useState('zencare-test-room');
  const [displayName, setDisplayName] = useState('Dr. John Doe');
  const [email, setEmail] = useState('doctor@example.com');
  const [isInCall, setIsInCall] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  // Removed webViewRef as we're using MockVideoCall now

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
  };

  const startCall = () => {
    try {
      setIsLoading(true);
      // Generate a call ID
      const callId = Math.random().toString(36).substring(2, 10);
      const fullRoomName = `zencare-${callId}`;
      
      // Update the room name with the generated ID
      setRoomName(fullRoomName);
      
      addLog(`Call ID: ${callId}`);
      addLog(`Preparing to join room: ${fullRoomName}`);
      addLog(`User: ${displayName} (${email})`);
      addLog(`Starting mock video call...`);
      
      // Simulate a brief delay then start the call
      setTimeout(() => {
        setIsInCall(true);
        setIsLoading(false);
        addLog(`Mock call started successfully`);
      }, 1000);
    } catch (err) {
      addLog(`Error preparing call: ${err}`);
      Alert.alert(
        'Call Error',
        'Failed to prepare video call. Please try again.',
        [{ text: 'OK', onPress: () => {} }]
      );
      setIsLoading(false);
    }
  };

  const endCall = () => {
    addLog('Ending call...');
    setIsInCall(false);
    addLog('Call ended successfully');
  };

  return (
    <>
      {isInCall ? (
        <MockVideoCall
          roomName={roomName}
          displayName={displayName}
          email={email}
          onCallEnd={endCall}
        />
      ) : (
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="arrow-left" size={24} color={Colors.primary600} />
            </TouchableOpacity>
            <Text style={styles.title}>Telemedicine Test</Text>
          </View>
        <ScrollView style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Test Video Call</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Room Name:</Text>
              <TextInput
                style={styles.input}
                value={roomName}
                onChangeText={setRoomName}
                placeholder="Enter room name"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Display Name:</Text>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter your name"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email:</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.button, styles.startCallButton]} 
              onPress={startCall}
            >
              <Icon name="video" size={20} color="#fff" />
              <Text style={styles.buttonText}>Start Test Call</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.logsCard}>
            <Text style={styles.cardTitle}>Logs</Text>
            <View style={styles.logsContainer}>
              {logs.map((log, index) => (
                <Text key={index} style={styles.logText}>{log}</Text>
              ))}
              {logs.length === 0 && (
                <Text style={styles.emptyLogsText}>No logs yet. Start a test call to see logs.</Text>
              )}
            </View>
          </View>
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
  backButton: {
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
    padding: 16,
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
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
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: Colors.text,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
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
  logsCard: {
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
  logsContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    maxHeight: 300,
  },
  logText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#333',
    marginBottom: 4,
  },
  emptyLogsText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
});

export default TelemedicineTestScreen;