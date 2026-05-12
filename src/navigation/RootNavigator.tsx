import React, { useMemo, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import GlossaryScreen from '../screens/GlossaryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../theme/colors';
import { AuthContext } from './AuthContext';

const Stack = createStackNavigator();
const Tabs = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.neutral.main,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: colors.border,
          height: 66,
          paddingTop: 6,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size }) => {
          const iconName =
            route.name === 'Home'
              ? 'home'
              : route.name === 'Categories'
              ? 'albums'
              : route.name === 'Glossary'
              ? 'book'
              : 'person';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Главная' }}
      />
      <Tabs.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{ title: 'Категории' }}
      />
      <Tabs.Screen
        name="Glossary"
        component={GlossaryScreen}
        options={{ title: 'Глоссарий' }}
      />
      <Tabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Профиль' }}
      />
    </Tabs.Navigator>
  );
}

export function RootNavigator() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  const authContextValue = useMemo(
    () => ({
      signIn: () => setIsSignedIn(true),
      signOut: () => setIsSignedIn(false),
    }),
    []
  );

  return (
    <AuthContext.Provider value={authContextValue}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.primary.main,
            },
            headerTintColor: colors.text.light,
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 18,
            },
          }}
        >
          {isSignedIn ? (
            <Stack.Screen
              name="Main"
              component={MainTabs}
              options={{ title: 'Грани общества', headerShown: false }}
            />
          ) : (
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: 'Регистрация', headerShown: false }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
