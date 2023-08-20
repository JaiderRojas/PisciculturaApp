import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';

import LoginScreen from './src/screens/LoginScreen';
import MainMenuScreen from './src/screens/MainMenuScreen';
import UserManagementScreen from './src/screens/UserManagementScreen';

const Stack = createNativeStackNavigator();

const App: React.FC = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null | undefined>(
    null,
  );

  function onAuthStateChanged(newUser: FirebaseAuthTypes.User | null) {
    setUser(newUser);
    if (initializing) {
      setInitializing(false);
    }
  }

  const handleSignOut = async () => {
    try {
      await auth().signOut();
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen name="MainMenu" options={{headerShown: false}}>
              {props => <MainMenuScreen {...props} onSignOut={handleSignOut} />}
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
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
