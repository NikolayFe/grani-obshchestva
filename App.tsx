import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation/RootNavigator';
import { GlossaryProvider } from './src/contexts/GlossaryContext';

export default function App() {
  return (
    <GlossaryProvider>
      <StatusBar style="auto" />
      <RootNavigator />
    </GlossaryProvider>
  );
}
