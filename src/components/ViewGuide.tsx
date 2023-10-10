import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore'; // Importa firestore desde @react-native-firebase/firestore
import {useFocusEffect} from '@react-navigation/native';

interface PrevPercentages {
  [key: string]: {
    [key: string]: number;
  };
}

const ViewGuide: React.FC = ({route}) => {
  const {species, percentages, guideId} = route.params; // Asegúrate de pasar el guideId

  const [isEditing, setIsEditing] = useState(false);
  const [editedPercentages, setEditedPercentages] = useState({...percentages});

  const handlePercentageChange = (
    temp: string,
    range: string,
    value: string,
  ) => {
    setEditedPercentages((prevPercentages: PrevPercentages) => ({
      ...prevPercentages,
      [temp]: {
        ...prevPercentages[temp],
        [range]: parseFloat(value) || 0,
      },
    }));
  };

  // Función para actualizar los datos en Firestore
  const updateGuideData = async () => {
    try {
      // Utiliza el ID del documento para actualizar los datos en Firestore
      const docRef = firestore().collection('guias').doc(guideId); // Utiliza el guideId aquí
      await docRef.update({
        percentages: editedPercentages, // Utiliza los porcentajes editados
      });

      setIsEditing(false); // Deshabilita la edición
      Alert.alert('Éxito', 'Los porcentajes se han actualizado con éxito.');
    } catch (error) {
      Alert.alert(
        'Error',
        'Hubo un error al actualizar los porcentajes: ' + error,
      );
    }
  };
  // Función para cargar los datos desde Firestore
  const loadGuideData = async () => {
    try {
      const docRef = firestore().collection('guias').doc(guideId);
      const docSnapshot = await docRef.get();
      if (docSnapshot.exists) {
        const guideData = docSnapshot.data();
        if (guideData) {
          // Verifica si guideData no es nulo o indefinido
          setEditedPercentages(guideData.percentages);
        } else {
          console.error('Los datos de la guía son nulos o indefinidos.');
        }
      }
    } catch (error) {
      console.error('Error al cargar los datos: ', error);
    }
  };
  // Utiliza useFocusEffect para recargar los datos cuando la pantalla obtiene el enfoque
  useFocusEffect(
    useCallback(() => {
      loadGuideData();
    }, []),
  );

  return (
    <>
      <View style={styles.inputContainer}>
        <Text style={styles.text}>{species}</Text>
        {isEditing ? (
          <TouchableOpacity style={styles.saveButton} onPress={updateGuideData}>
            <Text style={styles.buttonText}>Guardar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}>
            <Text style={styles.buttonText}>Editar</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView horizontal={true} style={styles.scrollView}>
        <ScrollView contentContainerStyle={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>°C Agua</Text>
            {Object.keys(percentages[21])
              .sort((a, b) => parseFloat(a) - parseFloat(b))
              .map((range, index) => (
                <Text key={index} style={styles.tableHeader}>
                  {range}
                </Text>
              ))}
          </View>
          {Object.keys(percentages)
            .sort((a, b) => parseFloat(a) - parseFloat(b))
            .map((temp, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableHeader}>{temp}</Text>
                {Object.keys(percentages[temp])
                  .sort((a, b) => parseFloat(a) - parseFloat(b))
                  .map((range, innerIndex) => (
                    <TextInput
                      key={innerIndex}
                      style={styles.tableCell}
                      value={
                        isEditing
                          ? editedPercentages[temp][range].toString()
                          : percentages[temp][range].toString()
                      }
                      onChangeText={value =>
                        handlePercentageChange(temp, range, value)
                      }
                      keyboardType="numeric"
                      editable={isEditing}
                    />
                  ))}
              </View>
            ))}
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>Frecuencia de suministro</Text>
          </View>
        </ScrollView>
      </ScrollView>
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
    justifyContent: 'space-between',
    margin: 20,
  },
  editButton: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  saveButton: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
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
    borderWidth: 1,
    borderColor: '#ccc',
  },
  scrollView: {
    margin: 20,
  },
});

export default ViewGuide;
