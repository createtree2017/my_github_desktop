import React from 'react';
import { View, StatusBar } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { AppProvider } from './src/context/AppProvider';
import { AppNavigationContainer } from './src/navigation/NavigationContainer';

export default function App() {
  return (
    <PaperProvider>
      <AppProvider>
        <View style={{ flex: 1 }}>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          <AppNavigationContainer />
        </View>
      </AppProvider>
    </PaperProvider>
  );
}
