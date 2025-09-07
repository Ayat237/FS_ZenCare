import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '@theme/colors';

interface MockVideoCallProps {
  roomName: string;
  displayName: string;
  email: string;
  onCallEnd: () => void;
  isModerator?: boolean;
}

const MockVideoCall: React.FC<MockVideoCallProps> = ({
  roomName,
  displayName,
  email,
  onCallEnd,
  isModerator = false,
}) => {
  const [isConnecting, setIsConnecting] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const jitsiUrl = `https://meet.jit.si/${roomName}#userInfo.displayName=${encodeURIComponent(displayName)}&userInfo.email=${encodeURIComponent(email)}`;

  useEffect(() => {
    const requestPermissions = async () => {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: microphoneStatus } = await Audio.requestPermissionsAsync();

      if (cameraStatus === 'granted' && microphoneStatus === 'granted') {
        setPermissionsGranted(true);
        setIsConnecting(false);
        // Start call duration timer only when connected
        const durationTimer = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);

        return () => clearInterval(durationTimer);
      } else {
        Alert.alert(
          'Permissions Required',
          'Camera and microphone permissions are needed for video calls.',
          [{ text: 'OK', onPress: onCallEnd }]
        );
        setPermissionsGranted(false);
        setIsConnecting(false);
      }
    };

    requestPermissions();

    return () => {
      // Cleanup if needed
    };
  }, [onCallEnd]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const injectJavaScript = (jsCode: string) => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(jsCode);
    }
  };

  const toggleVideo = () => {
    const newState = !isVideoEnabled;
    setIsVideoEnabled(newState);
    injectJavaScript(`
      try {
        const api = window.api;
        if (api) {
          api.executeCommand('toggleVideo');
          true;
        }
      } catch (e) {
        console.error(e);
      }
    `);
  };

  const toggleAudio = () => {
    const newState = !isAudioEnabled;
    setIsAudioEnabled(newState);
    injectJavaScript(`
      try {
        const api = window.api;
        if (api) {
          api.executeCommand('toggleAudio');
          true;
        }
      } catch (e) {
        console.error(e);
      }
    `);
  };

  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error: ', nativeEvent);
    Alert.alert(
      'Connection Error',
      `Failed to connect to Jitsi Meet: ${nativeEvent.description || 'Unknown error'}`,
      [{ text: 'OK', onPress: onCallEnd }]
    );
  };

  if (isConnecting) {
    return (
      <View style={styles.container}>
        <View style={styles.connectingContainer}>
          <ActivityIndicator size="large" color={Colors.primary500} />
          <Text style={styles.connectingText}>Connecting to video call...</Text>
          <Text style={styles.roomText}>Room: {roomName}</Text>
          <Text style={styles.userText}>{displayName} ({email})</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: jitsiUrl }}
        style={styles.webview}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        onLoadEnd={() => console.log('WebView loaded')}
        onError={handleWebViewError}
        onMessage={(event) => {
          // Handle messages from WebView if needed
          console.log('Message from WebView:', event.nativeEvent.data);
        }}
        // For Android, enable camera and microphone access
        {...(Platform.OS === 'android' && { 
          javaScriptCanOpenWindowsAutomatically: true,
          domStorageEnabled: true,
          allowFileAccess: true,
          allowUniversalAccessFromFileURLs: true,
          allowFileAccessFromFileURLs: true,
          mediaPlaybackRequiresUserAction: false,
          setSupportMultipleWindows: false,
          useWebKit: true,
          onShouldStartLoadWithRequest: (request) => {
            // This is crucial for handling redirects and ensuring Jitsi loads correctly
            return true;
          },
        })}
      />

      {/* Call info overlay */}
      <View style={styles.callInfoOverlay}>
        <Text style={styles.roomNameText}>{roomName}</Text>
        <Text style={styles.durationText}>{formatDuration(callDuration)}</Text>
      </View>

      {/* Control buttons */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, !isAudioEnabled && styles.controlButtonDisabled]}
          onPress={toggleAudio}
        >
          <Icon
            name={isAudioEnabled ? "microphone" : "microphone-off"}
            size={24}
            color={Colors.white}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, !isVideoEnabled && styles.controlButtonDisabled]}
          onPress={toggleVideo}
        >
          <Icon
            name={isVideoEnabled ? "video" : "video-off"}
            size={24}
            color={Colors.white}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.endCallButton]}
          onPress={onCallEnd}
        >
          <Icon name="phone-hangup" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 9999,
    elevation: 9999,
  },
  connectingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  connectingText: {
    fontSize: 18,
    color: Colors.white,
    marginTop: 16,
    textAlign: 'center',
  },
  roomText: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
  userText: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
    textAlign: 'center',
  },
  webview: {
    flex: 1,
  },
  callInfoOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  roomNameText: {
    fontSize: 14,
    color: Colors.white,
  },
  durationText: {
    fontSize: 14,
    color: Colors.white,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary500,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  controlButtonDisabled: {
    backgroundColor: '#666',
  },
  endCallButton: {
    backgroundColor: '#E53935',
  },
  controlButtonText: {
    color: Colors.white,
    marginTop: 4,
    fontSize: 12,
  },
});

export default MockVideoCall;