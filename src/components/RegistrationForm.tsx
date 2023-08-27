import React, {useState} from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  StyleSheet,
  Button,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {Picker} from '@react-native-picker/picker';

interface RegistrationFormProps {
  onClose: () => void;
}
const roles = [
  'Administrador',
  'P. Producción',
  'P. Ventas',
  'P. Alimentacion',
];

const RegistrationForm: React.FC<RegistrationFormProps> = ({onClose}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  const handleRegister = async () => {
    try {
      const authResult = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );

      await firestore().collection('users').doc(authResult.user.uid).set({
        name,
        email,
        role,
      });

      // Mostrar alerta de éxito
      Alert.alert(
        'Registro exitoso',
        'El usuario ha sido registrado exitosamente',
        [{text: 'OK', onPress: onClose}],
      );
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al registrar el usuario', [
        {text: 'OK', style: 'cancel'},
      ]);
      console.error('Error al registrar usuario:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.formTitle}>Registro de Usuario</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#777"
      />
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        placeholderTextColor="#777"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#777"
      />
      <Picker
        selectedValue={role}
        style={styles.picker}
        onValueChange={itemValue => setRole(itemValue)}>
        <Picker.Item label="Selecciona un rol" value="" />
        {roles.map(roleItem => (
          <Picker.Item key={roleItem} label={roleItem} value={roleItem} />
        ))}
      </Picker>
      <Button title="Registrar" onPress={handleRegister} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    color: 'black',
  },
  formTitle: {
    fontSize: 20,
    marginBottom: 20,
    color: 'black',
  },
  picker: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 10,
    color: 'black',
  },
});

export default RegistrationForm;
