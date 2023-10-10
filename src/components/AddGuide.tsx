import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';

const AddGuide: React.FC = () => {
  // Estado para los campos del formulario
  const [species, setSpecies] = useState(''); // Agregamos el estado para la especie de pez
  const [percentageData, setPercentageData] = useState<{
    [key: string]: {[key: string]: number};
  }>({
    21: {
      '5-10': 0,
      '10-20': 0,
      '20-40': 0,
      '40-70': 0,
      '70-120': 0,
      '120-200': 0,
      '200-300': 0,
      '300-400': 0,
    },
    22: {
      '5-10': 0,
      '10-20': 0,
      '20-40': 0,
      '40-70': 0,
      '70-120': 0,
      '120-200': 0,
      '200-300': 0,
      '300-400': 0,
    },
    23: {
      '5-10': 0,
      '10-20': 0,
      '20-40': 0,
      '40-70': 0,
      '70-120': 0,
      '120-200': 0,
      '200-300': 0,
      '300-400': 0,
    },
    24: {
      '5-10': 0,
      '10-20': 0,
      '20-40': 0,
      '40-70': 0,
      '70-120': 0,
      '120-200': 0,
      '200-300': 0,
      '300-400': 0,
    },
    25: {
      '5-10': 0,
      '10-20': 0,
      '20-40': 0,
      '40-70': 0,
      '70-120': 0,
      '120-200': 0,
      '200-300': 0,
      '300-400': 0,
    },
    26: {
      '5-10': 0,
      '10-20': 0,
      '20-40': 0,
      '40-70': 0,
      '70-120': 0,
      '120-200': 0,
      '200-300': 0,
      '300-400': 0,
    },
    27: {
      '5-10': 0,
      '10-20': 0,
      '20-40': 0,
      '40-70': 0,
      '70-120': 0,
      '120-200': 0,
      '200-300': 0,
      '300-400': 0,
    },
  });
  // Agrega un estado para la frecuencia de suministro
  const [feedingFrequency, setFeedingFrequency] = useState<{
    [key: string]: number;
  }>({
    // Inicializa con valores por defecto o vacíos según tus necesidades
    '5-10': 0,
    '10-20': 0,
    '20-40': 0,
    '40-70': 0,
    '70-120': 0,
    '120-200': 0,
    '200-300': 0,
    '300-400': 0,
  });
  // Función para manejar cambios en los porcentajes
  const handlePercentageChange = (
    temp: string,
    range: string,
    value: string,
  ) => {
    setPercentageData(prevData => ({
      ...prevData,
      [temp]: {
        ...prevData[temp],
        [range]: parseFloat(value) || 0, // Asegura que el valor sea un número
      },
    }));
  };
  // Función para manejar cambios en la frecuencia de suministro
  const handleFrequencyChange = (range: string, value: string) => {
    setFeedingFrequency(prevFrequency => ({
      ...prevFrequency,
      [range]: parseInt(value, 10), // Asegura que el valor sea un número entero
    }));
  };

  // Función para guardar los porcentajes en Firebase
  const savePercentageDataToFirebase = async () => {
    try {
      const docData = {
        species,
        percentages: percentageData,
        feedingFrequency,
      };
      const docRef = await firestore().collection('guias').add(docData);
      Alert.alert('Éxito', 'Datos guardados con éxito');
      console.log(
        'Datos guardados con éxito en el documento con ID: ',
        docRef.id,
      );
    } catch (error) {
      Alert.alert('Error al guardar los datos ');
      console.error('Error al guardar los datos: ', error);
    }
  };

  return (
    <>
      <View style={styles.inputContainer}>
        <Text style={styles.text}>Especie de Pez</Text>
        <TextInput
          style={styles.input}
          value={species}
          onChangeText={setSpecies}
          placeholderTextColor={'black'}
        />
      </View>
      <ScrollView horizontal={true} style={styles.scrollView}>
        <ScrollView contentContainerStyle={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>°C Agua</Text>
            {Object.keys(percentageData[21]).map((range, index) => (
              <Text key={index} style={styles.tableHeader}>
                {range}
              </Text>
            ))}
          </View>
          {Object.keys(percentageData).map((temp, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableHeader}>{temp}°C</Text>
              {Object.keys(percentageData[temp]).map((range, rangeIndex) => (
                <TextInput
                  key={rangeIndex}
                  style={styles.tableCell}
                  value={percentageData[temp][range].toString()}
                  onChangeText={value =>
                    handlePercentageChange(temp, range, value)
                  }
                  keyboardType="numeric"
                />
              ))}
            </View>
          ))}
          {/* Agregar la fila para la frecuencia de suministro */}
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>.......</Text>
            {Object.keys(feedingFrequency).map((range, index) => (
              <TextInput
                key={index}
                style={styles.tableCell}
                value={feedingFrequency[range].toString()}
                onChangeText={value => handleFrequencyChange(range, value)}
                keyboardType="numeric"
              />
            ))}
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>Frecuencia de suministro</Text>
          </View>
        </ScrollView>
      </ScrollView>
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={savePercentageDataToFirebase}>
          <Text style={styles.buttonText}>Guardar</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  text: {
    color: 'black',
    fontSize: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    marginTop: 10,
    color: 'black',
  },
  table: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  tableHeader: {
    flex: 1,
    fontWeight: 'bold',
    padding: 10,
    backgroundColor: '#f2f2f2',
    textAlign: 'center',
    color: 'black',
  },
  tableCell: {
    flex: 1,
    padding: 10,
    textAlign: 'center',
    color: 'black',
  },
  scrollView: {
    margin: 20,
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
  },
});

export default AddGuide;
