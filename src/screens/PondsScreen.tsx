import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {Picker} from '@react-native-picker/picker';

interface Pond {
  id: string;
  volumen: number;
  temperatura: number;
  peces: number;
  numeroDeEstanque: number;
  pesoPromedio: number;
}

const PondsScreen: React.FC = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [volume, setVolume] = useState('');
  const [temperature, setTemperature] = useState('');
  const [fishCount, setFishCount] = useState('');
  const [nextPondNumber, setNextPondNumber] = useState(1);
  const [newPondWeight, setNewPondWeight] = useState('');

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleAddPonds = async () => {
    try {
      if (!volume || !temperature || !fishCount || !newPondWeight) {
        Alert.alert('Error', 'Por favor, completa todos los campos.');
        return;
      }

      const pondsCollection = await firestore().collection('estanques').get();
      const numPonds = pondsCollection.size;
      const newPondNumber = numPonds + 1;

      const newPondData = {
        volumen: parseFloat(volume),
        temperatura: parseFloat(temperature),
        peces: parseInt(fishCount, 10),
        numeroDeEstanque: newPondNumber,
        pesoPromedio: parseFloat(newPondWeight),
      };

      await firestore().collection('estanques').add(newPondData);

      setNextPondNumber(newPondNumber + 1);

      toggleModal();
      Alert.alert('Éxito', 'Nuevo estanque agregado correctamente.');
    } catch (error) {
      console.error('Error al agregar el estanque:', error);

      Alert.alert(
        'Error',
        'Ocurrió un error al agregar el estanque. Por favor, inténtalo nuevamente.',
      );
    }
  };

  useEffect(() => {
    firestore()
      .collection('estanques')
      .get()
      .then(querySnapshot => {
        const numPonds = querySnapshot.size;
        setNextPondNumber(numPonds + 1);
      });
  }, []);

  //Mostrar tabla
  const [pondsData, setPondsData] = useState<Pond[]>([]);

  useEffect(() => {
    // Obtener los datos de los estanques desde Firestore al cargar la pantalla
    const unsubscribe = firestore()
      .collection('estanques')
      .onSnapshot(querySnapshot => {
        const data: Pond[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Pond[]; // Agregar "as Pond[]" para asegurar el tipo

        // Ordenar los estanques por número de estanque de menor a mayor
        const sortedData = data.sort(
          (a, b) => a.numeroDeEstanque - b.numeroDeEstanque,
        );

        setPondsData(sortedData);
      });

    return () => {
      unsubscribe();
    };
  }, []);
  // Estado para el modal de agregar peces
  const [isAddFishModalVisible, setAddFishModalVisible] = useState(false);
  const [selectedPondId, setSelectedPondId] = useState('');
  const [fishToAdd, setFishToAdd] = useState('');

  const toggleAddFishModal = () => {
    setAddFishModalVisible(!isAddFishModalVisible);
  };

  const handleAddFish = async () => {
    try {
      // Validar que los campos no estén vacíos
      if (!selectedPondId || !fishToAdd) {
        Alert.alert('Error', 'Por favor, completa todos los campos.');
        return;
      }

      // Obtener el estanque seleccionado
      const selectedPondRef = firestore()
        .collection('estanques')
        .doc(selectedPondId);

      // Actualizar la cantidad de peces en el estanque
      await selectedPondRef.update({
        peces: firestore.FieldValue.increment(parseInt(fishToAdd, 10)),
      });

      // Cerrar el modal
      toggleAddFishModal();
      Alert.alert('Éxito', 'Peces agregados correctamente.');
    } catch (error) {
      console.error('Error al agregar peces:', error);

      // Mostrar alerta de error
      Alert.alert(
        'Error',
        'Ocurrió un error al agregar los peces. Por favor, inténtalo nuevamente.',
      );
    }
  };
  // Estado para el modal de restar peces
  const [isSubtractFishModalVisible, setSubtractFishModalVisible] =
    useState(false);
  const [selectedSubtractPondId, setSelectedSubtractPondId] = useState('');
  const [fishToSubtract, setFishToSubtract] = useState('');

  const toggleSubtractFishModal = () => {
    setSubtractFishModalVisible(!isSubtractFishModalVisible);
  };

  const handleSubtractFish = async () => {
    try {
      // Validar que los campos no estén vacíos
      if (!selectedSubtractPondId || !fishToSubtract) {
        Alert.alert('Error', 'Por favor, completa todos los campos.');
        return;
      }

      // Obtener el estanque seleccionado
      const selectedPondRef = firestore()
        .collection('estanques')
        .doc(selectedSubtractPondId);

      // Obtener la cantidad actual de peces en el estanque
      const selectedPondDoc = await selectedPondRef.get();
      const currentFishCount = selectedPondDoc.data()?.peces || 0;

      // Validar que la cantidad a restar no sea mayor que la cantidad actual
      if (parseInt(fishToSubtract, 10) > currentFishCount) {
        Alert.alert(
          'Error',
          'La cantidad a restar es mayor que la cantidad actual de peces.',
        );
        return;
      }

      // Restar la cantidad de peces en el estanque
      await selectedPondRef.update({
        peces: firestore.FieldValue.increment(-parseInt(fishToSubtract, 10)),
      });

      // Cerrar el modal
      toggleSubtractFishModal();
      Alert.alert('Éxito', 'Peces restados correctamente.');
    } catch (error) {
      console.error('Error al restar peces:', error);

      // Mostrar alerta de error
      Alert.alert(
        'Error',
        'Ocurrió un error al restar los peces. Por favor, inténtalo nuevamente.',
      );
    }
  };
  // Modal de eliminar estanques
  const [isDeletePondModalVisible, setDeletePondModalVisible] = useState(false);
  const [selectedPondToDelete, setSelectedPondToDelete] = useState('');

  const toggleDeletePondModal = () => {
    setDeletePondModalVisible(!isDeletePondModalVisible);
  };

  const handleDeletePond = async () => {
    try {
      if (!selectedPondToDelete) {
        Alert.alert('Error', 'Por favor, selecciona un estanque.');
        return;
      }

      // Mostrar una advertencia antes de eliminar
      Alert.alert(
        'Advertencia',
        '¿Estás seguro de que quieres eliminar este estanque? Esta acción no se puede deshacer.',
        [
          {
            text: 'Cancelar',
            onPress: () => toggleDeletePondModal(),
            style: 'cancel',
          },
          {
            text: 'Eliminar',
            onPress: async () => {
              // Eliminar el estanque seleccionado
              await firestore()
                .collection('estanques')
                .doc(selectedPondToDelete)
                .delete();

              // Cerrar el modal
              toggleDeletePondModal();

              // Mostrar mensaje de éxito
              Alert.alert('Éxito', 'Estanque eliminado correctamente.');
            },
          },
        ],
      );
    } catch (error) {
      console.error('Error al eliminar el estanque:', error);

      // Mostrar alerta de error
      Alert.alert(
        'Error',
        'Ocurrió un error al eliminar el estanque. Por favor, inténtalo nuevamente.',
      );
    }
  };
  // Estado para el modal de editar peso promedio
  const [isEditWeightModalVisible, setEditWeightModalVisible] = useState(false);
  const [selectedPondToEditWeight, setSelectedPondToEditWeight] = useState('');
  const [editedWeight, setEditedWeight] = useState('');

  const toggleEditWeightModal = () => {
    setEditWeightModalVisible(!isEditWeightModalVisible);
  };

  const handleEditWeight = async () => {
    try {
      // Validar que los campos no estén vacíos
      if (!selectedPondToEditWeight || !editedWeight) {
        Alert.alert('Error', 'Por favor, completa todos los campos.');
        return;
      }

      // Obtener el estanque seleccionado
      const selectedPondRef = firestore()
        .collection('estanques')
        .doc(selectedPondToEditWeight);

      // Actualizar el peso promedio en el estanque
      await selectedPondRef.update({
        pesoPromedio: parseFloat(editedWeight),
      });

      // Cerrar el modal
      toggleEditWeightModal();
      Alert.alert('Éxito', 'Peso promedio editado correctamente.');
    } catch (error) {
      console.error('Error al editar el peso promedio:', error);

      // Mostrar alerta de error
      Alert.alert(
        'Error',
        'Ocurrió un error al editar el peso promedio. Por favor, inténtalo nuevamente.',
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Modal para Agregar Estanques */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar Estanque</Text>
            <TextInput
              placeholder="Volumen (m3)"
              value={volume}
              onChangeText={setVolume}
              keyboardType="numeric"
              style={styles.input}
              placeholderTextColor={'black'}
            />
            <TextInput
              placeholder="Temperatura (grados °)"
              value={temperature}
              onChangeText={setTemperature}
              keyboardType="numeric"
              style={styles.input}
              placeholderTextColor={'black'}
            />
            <TextInput
              placeholder="Peces #"
              value={fishCount}
              onChangeText={setFishCount}
              keyboardType="numeric"
              style={styles.input}
              placeholderTextColor={'black'}
            />
            <TextInput
              placeholder="Peso Promedio(g)"
              value={newPondWeight}
              onChangeText={setNewPondWeight}
              keyboardType="numeric"
              style={styles.input}
              placeholderTextColor={'black'}
            />
            <Text>Numero de estanque: {nextPondNumber}</Text>
            <Button title="Guardar" onPress={handleAddPonds} />
            <Button title="Cancelar" onPress={toggleModal} />
          </View>
        </View>
      </Modal>
      {/* Modal para Agregar Peces */}
      <Modal
        visible={isAddFishModalVisible}
        animationType="slide"
        transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar Peces</Text>
            <Picker
              selectedValue={selectedPondId}
              onValueChange={itemValue => setSelectedPondId(itemValue)}
              style={styles.picker}>
              <Picker.Item label="Seleccionar Estanque" value="" />
              {pondsData.map(pond => (
                <Picker.Item
                  key={pond.id}
                  label={`Estanque ${pond.numeroDeEstanque}`}
                  value={pond.id}
                />
              ))}
            </Picker>
            <TextInput
              placeholder="Cantidad de Peces"
              value={fishToAdd}
              onChangeText={setFishToAdd}
              keyboardType="numeric"
              style={styles.input}
              placeholderTextColor={'black'}
            />
            <Button title="Guardar" onPress={handleAddFish} />
            <Button title="Cancelar" onPress={toggleAddFishModal} />
          </View>
        </View>
      </Modal>
      {/* Modal para Restar Peces */}
      <Modal
        visible={isSubtractFishModalVisible}
        animationType="slide"
        transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Restar Peces</Text>

            <Picker
              selectedValue={selectedSubtractPondId}
              onValueChange={itemValue => setSelectedSubtractPondId(itemValue)}
              style={styles.picker}>
              <Picker.Item label="Seleccionar Estanque" value="" />
              {pondsData.map(pond => (
                <Picker.Item
                  key={pond.id}
                  label={`Estanque ${pond.numeroDeEstanque}`}
                  value={pond.id}
                />
              ))}
            </Picker>

            <TextInput
              placeholder="Cantidad de Peces a Restar"
              value={fishToSubtract}
              onChangeText={setFishToSubtract}
              keyboardType="numeric"
              style={styles.input}
              placeholderTextColor={'black'}
            />

            <View style={styles.modalButtonContainer}>
              <Button title="Restar" onPress={handleSubtractFish} />
              <Button title="Cancelar" onPress={toggleSubtractFishModal} />
            </View>
          </View>
        </View>
      </Modal>
      {/* Modal para Eliminar Estanques */}
      <Modal
        visible={isDeletePondModalVisible}
        animationType="slide"
        transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Eliminar Estanque</Text>

            <Picker
              selectedValue={selectedPondToDelete}
              onValueChange={itemValue => setSelectedPondToDelete(itemValue)}
              style={styles.picker}>
              <Picker.Item label="Seleccionar Estanque" value="" />
              {pondsData.map(pond => (
                <Picker.Item
                  key={pond.id}
                  label={`Estanque ${pond.numeroDeEstanque}`}
                  value={pond.id}
                />
              ))}
            </Picker>

            <View style={styles.modalButtonContainer}>
              <Button title="Eliminar" onPress={handleDeletePond} />
              <Button title="Cancelar" onPress={toggleDeletePondModal} />
            </View>
          </View>
        </View>
      </Modal>
      {/* Modal para Editar Peso Promedio */}
      <Modal
        visible={isEditWeightModalVisible}
        animationType="slide"
        transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Peso Promedio</Text>

            <Picker
              selectedValue={selectedPondToEditWeight}
              onValueChange={itemValue =>
                setSelectedPondToEditWeight(itemValue)
              }
              style={styles.picker}>
              <Picker.Item label="Seleccionar Estanque" value="" />
              {pondsData.map(pond => (
                <Picker.Item
                  key={pond.id}
                  label={`Estanque ${pond.numeroDeEstanque}`}
                  value={pond.id}
                />
              ))}
            </Picker>

            <TextInput
              placeholder="Peso Promedio"
              value={editedWeight}
              onChangeText={setEditedWeight}
              keyboardType="numeric"
              style={styles.input}
              placeholderTextColor={'black'}
            />

            <View style={styles.modalButtonContainer}>
              <Button title="Guardar" onPress={handleEditWeight} />
              <Button title="Cancelar" onPress={toggleEditWeightModal} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Botones */}
      <TouchableOpacity style={styles.Button} onPress={toggleModal}>
        <Text style={styles.ButtonText}>Agregar Estanques</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.Button} onPress={toggleAddFishModal}>
        <Text style={styles.ButtonText}>Agregar Peces</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.Button} onPress={toggleSubtractFishModal}>
        <Text style={styles.ButtonText}>Restar Peces</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.Button} onPress={toggleDeletePondModal}>
        <Text style={styles.ButtonText}>Eliminar Estanques</Text>
      </TouchableOpacity>

      {/* Tabla */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Estanque</Text>
          <Text style={styles.tableHeaderText}>Volumen</Text>
          <Text style={styles.tableHeaderText}>Temperatura</Text>
          <Text style={styles.tableHeaderText}># Peces</Text>
          <Text style={styles.tableHeaderText}>Peso Promedio</Text>
          <Text style={styles.tableHeaderText}>(gramos)</Text>
        </View>
        {pondsData.map(item => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={styles.tableCell}>{item.numeroDeEstanque}</Text>
            <Text style={styles.tableCell}>{item.volumen} m3</Text>
            <Text style={styles.tableCell}>{item.temperatura}°</Text>
            <Text style={styles.tableCell}>{item.peces}</Text>
            <Text style={styles.tableCell}>{item.pesoPromedio}</Text>
            <View style={styles.tableCell}>
              <TouchableOpacity
                style={styles.EditButton}
                onPress={() => {
                  setSelectedPondToEditWeight(item.id);
                  setEditedWeight(item.pesoPromedio.toString());
                  toggleEditWeightModal();
                }}>
                <Text>Editar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    color: 'black',
  },
  pondItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  pondItemText: {
    color: 'black',
  },
  header: {
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  Button: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    marginTop: 10,
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
  EditButton: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 7,
    alignSelf: 'flex-start',
  },
  ButtonText: {
    color: 'white',
    fontSize: 20,
  },
  table: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  tableHeaderText: {
    fontWeight: 'bold',
    flex: 1,
    color: 'black',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  tableCell: {
    flex: 1,
    color: 'black',
  },
  picker: {
    borderWidth: 1,
    marginBottom: 10,
    backgroundColor: 'black',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default PondsScreen;
