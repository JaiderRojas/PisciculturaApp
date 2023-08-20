import React from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Button,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native'; // Importa useNavigation

interface MainMenuProps {
  onSignOut: () => void;
}

const MainMenuScreen: React.FC<MainMenuProps> = ({onSignOut}) => {
  const navigation = useNavigation(); // Obtiene el objeto de navegación

  const goToUserManagement = () => {
    navigation.navigate('UserManagement'); // Navega a la pantalla UserManagementScreen
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* ... */}
      <TouchableOpacity style={styles.button} onPress={goToUserManagement}>
        <Text style={styles.buttonText}>Gestión de usuarios</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Pendiente</Text>
      </TouchableOpacity>
      <Button title="Cerrar Sesión" onPress={onSignOut} />
      {/* ... */}
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainMenu: {
    fontSize: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3498db',
    width: 200,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default MainMenuScreen;
