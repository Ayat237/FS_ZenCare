import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigation from "@navigation/appNavigation";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useState, useEffect, FC } from "react";
import { Provider } from "react-redux";
import { persistor } from "@/store";
import store from "@/store";
import { PersistGate } from "redux-persist/integration/react";

SplashScreen.preventAutoHideAsync(); // Prevent splash screen from hiding too soon

const App: FC = () => {
  const [appIsReady, setAppIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    "open-sans": require("./assets/fonts/OpenSans-Regular.ttf"),
    "open-sans-bold": require("./assets/fonts/OpenSans-Bold.ttf"),
  });

  useEffect(() => {
    async function prepare() {
      if (fontsLoaded) {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, [fontsLoaded]);

  if (!appIsReady) {
    return null; // Keep splash screen visible until fonts are loaded
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <View style={styles.container}>
            <StatusBar
              style="dark"
              backgroundColor="#fff"
              translucent={false}
            />
            <AppNavigation />
          </View>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
