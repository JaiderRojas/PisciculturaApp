import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import RegistrationForm from '../components/RegistrationForm'; // Importa el componente de registro
import UserList from '../components/UserList';

const UserManagementScreen: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegisterButtonPress = () => {
    setIsRegistering(true);
  };

  const handleCloseRegistrationForm = () => {
    setIsRegistering(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.registerButton}
        onPress={handleRegisterButtonPress}>
        <Text style={styles.registerButtonText}>Registrar Usuario</Text>
      </TouchableOpacity>

      <Text style={styles.mainMenu}>Gestión de Usuarios</Text>
      <UserList />

      {isRegistering && (
        <RegistrationForm onClose={handleCloseRegistrationForm} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  mainMenu: {
    fontSize: 20,
    marginBottom: 20,
    marginTop: 20,
    color: 'black',
  },
  registerButton: {
    position: 'absolute',
    top: 10, // Ajusta la posición vertical según sea necesario
    left: 10, // Ajusta la posición horizontal según sea necesario
    backgroundColor: '#3498db',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 14,
  },
  // Resto de estilos...
});

export default UserManagementScreen;
