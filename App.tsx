import React, {useState, useEffect, useCallback} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {QueryClient, QueryClientProvider} from 'react-query';

import LoginScreen from './src/screens/LoginScreen';
import MainMenuScreen from './src/screens/MainMenuScreen';
import UserManagementScreen from './src/screens/UserManagementScreen';
import SalesScreen from './src/screens/SalesScreen';
import PreviousSalesScreen from './src/screens/PreviousSalesScreen';
import PondsScreen from './src/screens/PondsScreen';
import FeedingGuideScreen from './src/screens/FeedingGuideScreen';
import AddGuide from './src/components/AddGuide';
import ViewGuide from './src/components/ViewGuide';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

const App: React.FC = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null | undefined>(
    null,
  );

  const onAuthStateChanged = useCallback(
    (newUser: FirebaseAuthTypes.User | null) => {
      setUser(newUser);
      if (initializing) {
        setInitializing(false);
      }
    },
    [initializing],
  );

  const handleSignOut = async () => {
    try {
      await auth().signOut();
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return () => {
      subscriber(); // Unsubscribe al desmontar el componente
    };
  }, [onAuthStateChanged]);

  if (initializing) {
    return null;
  }

  return (
    <NavigationContainer>
      <QueryClientProvider client={queryClient}>
        <Stack.Navigator>
          {user ? (
            <>
              <Stack.Screen name="MainMenu" options={{headerShown: false}}>
                {props => (
                  <MainMenuScreen {...props} onSignOut={handleSignOut} />
                )}
              </Stack.Screen>
              <Stack.Screen
                name="UserManagement"
                component={UserManagementScreen}
                initialParams={{userEmail: user?.email, userId: user?.uid}}
              />
              <Stack.Screen
                name="RegisterUser"
                component={UserManagementScreen}
                options={{title: 'Registrar Usuario'}}
              />
              <Stack.Screen
                name="Sales"
                component={SalesScreen}
                options={{title: 'Ventas'}}
              />
              <Stack.Screen
                name="PreviousSales"
                component={PreviousSalesScreen}
                options={{title: 'Ventas Anteriores'}}
              />
              <Stack.Screen
                name="Ponds"
                component={PondsScreen}
                options={{title: 'Estanques'}}
              />
              <Stack.Screen
                name="FeedingGuide"
                component={FeedingGuideScreen}
                options={{title: 'Guías de Alimentacíon'}}
              />
              <Stack.Screen
                name="AddGuide"
                component={AddGuide}
                options={{title: 'Agregar Guía de Alimentación'}}
              />
              <Stack.Screen
                name="ViewGuide"
                component={ViewGuide}
                options={{title: 'Ver Guía'}}
              />
            </>
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
        </Stack.Navigator>
      </QueryClientProvider>
    </NavigationContainer>
  );
};

export default App;
