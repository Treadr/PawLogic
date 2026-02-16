import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '../constants/colors';
import LoginScreen from '../screens/auth/LoginScreen';
import DashboardScreen from '../screens/home/DashboardScreen';
import PetListScreen from '../screens/pets/PetListScreen';
import AddPetScreen from '../screens/pets/AddPetScreen';
import ABCLogScreen from '../screens/abc/ABCLogScreen';
import ABCLogListScreen from '../screens/abc/ABCLogListScreen';
import ABCLogDetailScreen from '../screens/abc/ABCLogDetailScreen';
import InsightsScreen from '../screens/insights/InsightsScreen';
import PetDetailScreen from '../screens/pets/PetDetailScreen';
import ProgressScreen from '../screens/progress/ProgressScreen';
import EditPetScreen from '../screens/pets/EditPetScreen';
import CoachingScreen from '../screens/coaching/CoachingScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import { restoreSession } from '../services/auth';

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  PetList: undefined;
  AddPet: undefined;
  PetDetail: { petId: string };
  EditPet: { petId: string };
  ABCLog: { petId: string; petName: string; species: string };
  ABCLogList: { petId: string; petName: string };
  ABCLogDetail: { logId: string };
  Insights: { petId: string; petName: string };
  Progress: { petId: string; petName: string };
  Coaching: { petId: string; petName: string };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    restoreSession().then((restored) => {
      setIsLoggedIn(restored);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isLoggedIn ? 'Dashboard' : 'Login'}
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary[800] },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={({ navigation: nav }) => ({
            title: 'PawLogic',
            headerRight: () => (
              <TouchableOpacity
                onPress={() => nav.navigate('Settings')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={{ color: '#fff', fontSize: 22 }}>{'\u2699'}</Text>
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="PetList"
          component={PetListScreen}
          options={{ title: 'My Pets' }}
        />
        <Stack.Screen
          name="AddPet"
          component={AddPetScreen}
          options={{ title: 'Add Pet' }}
        />
        <Stack.Screen
          name="PetDetail"
          component={PetDetailScreen}
          options={{ title: 'Pet Profile' }}
        />
        <Stack.Screen
          name="EditPet"
          component={EditPetScreen}
          options={{ title: 'Edit Pet' }}
        />
        <Stack.Screen
          name="ABCLog"
          component={ABCLogScreen}
          options={{ title: 'Log Behavior' }}
        />
        <Stack.Screen
          name="ABCLogList"
          component={ABCLogListScreen}
          options={{ title: 'Behavior History' }}
        />
        <Stack.Screen
          name="ABCLogDetail"
          component={ABCLogDetailScreen}
          options={{ title: 'Log Details' }}
        />
        <Stack.Screen
          name="Insights"
          component={InsightsScreen}
          options={{ title: 'Insights' }}
        />
        <Stack.Screen
          name="Progress"
          component={ProgressScreen}
          options={{ title: 'Progress' }}
        />
        <Stack.Screen
          name="Coaching"
          component={CoachingScreen}
          options={{ title: 'Behavior Coach' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
