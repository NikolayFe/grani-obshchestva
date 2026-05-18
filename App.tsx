import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation/RootNavigator';
import { GlossaryProvider } from './src/contexts/GlossaryContext';
import { DailyLivesProvider } from './src/contexts/DailyLivesContext';

export default function App() {
  return (
    <GlossaryProvider>
      <DailyLivesProvider>
        <StatusBar style="auto" />
        <RootNavigator />
      </DailyLivesProvider>
    </GlossaryProvider>
  );
}
