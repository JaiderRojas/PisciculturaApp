import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {useNavigation} from '@react-navigation/native';

const SalesScreen: React.FC = () => {
  const navigation = useNavigation();
  const [peso, setPeso] = useState('');
  const [precioPorLibra, setPrecioPorLibra] = useState('');
  const [numeroDePeces, setNumeroDePeces] = useState('');
  const [precioTotal, setPrecioTotal] = useState('');

  const formatPrice = (amount: number): string => {
    return amount.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    });
  };

  const parseInputPrice = (input: string): string => {
    const numericString = input.replace(/[^0-9,]/g, ''); // Acepta números y coma decimal
    return numericString;
  };

  const parseCommaDecimal = (input: string): number => {
    const numericString = input.replace(/,/g, '.');
    return parseFloat(numericString);
  };

  const handlePesoChange = (input: string) => {
    const formattedInput = parseInputPrice(input); // Acepta números y coma decimal
    setPeso(formattedInput);
    calcularPrecioTotal(formattedInput, precioPorLibra);
  };

  const handlePrecioPorLibraChange = (input: string) => {
    const formattedInput = parseInputPrice(input); // Acepta números y coma decimal
    setPrecioPorLibra(formattedInput);
    calcularPrecioTotal(peso, formattedInput);
  };

  const calcularPrecioTotal = (
    formattedPeso: string,
    formattedprecioPorLibra: string,
  ) => {
    const pesoValue = parseCommaDecimal(formattedPeso);
    const precioPorLibraValue = parseCommaDecimal(formattedprecioPorLibra);

    if (!isNaN(pesoValue) && !isNaN(precioPorLibraValue)) {
      const total = pesoValue * precioPorLibraValue;
      setPrecioTotal(formatPrice(total));
    } else {
      setPrecioTotal('');
    }
  };
  //modals
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const showSuccess = () => {
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const showError = () => {
    setShowErrorMessage(true);
    setTimeout(() => {
      setShowErrorMessage(false);
    }, 3000);
  };

  // Lógica para registrar la venta en la base de datos
  const handleRegistrarVenta = async () => {
    try {
      const parsedPeso = parseCommaDecimal(peso);
      const parsedprecioPorLibra = parseCommaDecimal(precioPorLibra);
      const parsedNumeroDePeces = parseInt(numeroDePeces, 10);

      const ventaData = {
        peso: parsedPeso,
        precioPorLibra: parsedprecioPorLibra,
        precioTotal: parsedPeso * parsedprecioPorLibra,
        fecha: new Date(),
        numeroDePeces: parsedNumeroDePeces,
      };

      await firestore().collection('ventas').add(ventaData);
      showSuccess();
    } catch (error) {
      console.error('Error al registrar la venta:', error);
      showError();
    }
  };

  // Función para navegar a la pantalla de ventas anteriores
  const goToPreviousSales = () => {
    navigation.navigate('PreviousSales'); // Navega a la pantalla de ventas anteriores
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {showSuccessMessage && (
        <View style={styles.messageModal}>
          <Text style={styles.messageText}>¡Venta registrada con éxito!</Text>
        </View>
      )}

      {showErrorMessage && (
        <View style={[styles.messageModal, styles.errorMessage]}>
          <Text style={styles.messageText}>¡Error al registrar la venta!</Text>
        </View>
      )}

      <Text style={styles.title}>Registro de Venta</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.text}>Peso (lb)</Text>
        <TextInput
          style={styles.input}
          value={peso}
          onChangeText={handlePesoChange}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.text}>Precio Por Libra</Text>
        <TextInput
          style={styles.input}
          value={precioPorLibra}
          onChangeText={handlePrecioPorLibraChange}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.text}>Número de Peces</Text>
        <TextInput
          style={styles.input}
          value={numeroDePeces}
          onChangeText={setNumeroDePeces}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.text}>Precio Total</Text>
        <Text style={styles.calculatedPrice}>{precioTotal}</Text>
      </View>

      <Button title="Registrar Venta" onPress={handleRegistrarVenta} />

      <View style={styles.divider} />
      <TouchableOpacity style={styles.button} onPress={goToPreviousSales}>
        <Text style={styles.buttonText}>Ventas Anteriores</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black',
  },
  text: {
    color: 'black',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    color: 'black',
  },
  calculatedPrice: {
    fontSize: 16,
    marginVertical: 10,
    color: 'black',
  },
  divider: {
    borderBottomWidth: 1,
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  messageModal: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: '#4CAF50', // Verde para éxito
    zIndex: 999,
  },
  errorMessage: {
    backgroundColor: '#f44336', // Rojo para error
  },
  messageText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default SalesScreen;
