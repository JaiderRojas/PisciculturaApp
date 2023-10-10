import React, {useState, useEffect} from 'react';
import {Text, Button, StyleSheet, Alert, ScrollView} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';
import ProgrammedFeedingItem from '../components/ProgrammedFeedingItem';
import notifee from '@notifee/react-native';

interface Pond {
  id: string;
  volumen: number;
  temperatura: number;
  peces: number;
  numeroDeEstanque: number;
  pesoPromedio: number;
}

interface Guia {
  id: string;
  species: string;
  percentages: Record<string, number>;
  feedingFrequency: string;
}

interface ProgrammedFeeding {
  id: string;
  estanqueSeleccionado: number;
  guiaSeleccionada: string;
  biomasa: number;
  alimentoDiario: number;
  frecuenciaDeAlimento: number;
  alimentoPorRacion: number;
  notificaciones: boolean;
}

const ScheduleFeedingScreen = () => {
  const [pondsData, setPondsData] = useState<Pond[]>([]);
  const [selectedPondId, setSelectedPondId] = useState('');
  const [programmedFeeding, setProgrammedFeeding] = useState<
    ProgrammedFeeding[]
  >([]);
  const [guiasData, setGuiasData] = useState<Guia[]>([]);
  const [selectedGuiaId, setSelectedGuiaId] = useState('');
  const [biomasa, setBiomasa] = useState<number | null>(null);
  const [selectedPondWeight, setSelectedPondWeight] = useState<number | null>(
    null,
  );
  const [selectedPondTemperature, setSelectedPondTemperature] = useState<
    number | null
  >(null);
  const [selectedFeedingPercentage, setSelectedFeedingPercentage] = useState<
    number | null
  >(null);
  const [dailyFood, setDailyFood] = useState<number | null>(null); // Nuevo estado para el alimento diario
  const [foodPerMeal, setFoodPerMeal] = useState<number | null>(null);
  const [feedingFrequency, setFeedingFrequency] = useState<number | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  useEffect(() => {
    // Obtener los datos de los estanques desde Firestore al cargar la pantalla
    const unsubscribePonds = firestore()
      .collection('estanques')
      .onSnapshot(querySnapshot => {
        const data: Pond[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Pond[];

        // Ordenar los estanques por número de estanque de menor a mayor
        const sortedData = data.sort(
          (a, b) => a.numeroDeEstanque - b.numeroDeEstanque,
        );

        setPondsData(sortedData);
      });

    // Obtener los datos de las guías desde Firestore al cargar la pantalla
    const unsubscribeGuias = firestore()
      .collection('guias')
      .onSnapshot(querySnapshot => {
        const data: Guia[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Guia[];

        setGuiasData(data);
      });

    return () => {
      unsubscribePonds();
      unsubscribeGuias();
    };
  }, []);

  const handleAplicarButton = async () => {
    const selectedPond = pondsData.find(pond => pond.id === selectedPondId);

    if (selectedPond) {
      const biomasaCalculada = selectedPond.peces * selectedPond.pesoPromedio;
      setBiomasa(biomasaCalculada);
      setSelectedPondWeight(selectedPond.pesoPromedio);
      setSelectedPondTemperature(selectedPond.temperatura);

      let selectedWeightRange = '';
      if (selectedPond.pesoPromedio >= 5 && selectedPond.pesoPromedio < 10) {
        selectedWeightRange = '5-10';
      } else if (
        selectedPond.pesoPromedio >= 10 &&
        selectedPond.pesoPromedio < 20
      ) {
        selectedWeightRange = '10-20';
      } else if (
        selectedPond.pesoPromedio >= 20 &&
        selectedPond.pesoPromedio < 40
      ) {
        selectedWeightRange = '20-40';
      } else if (
        selectedPond.pesoPromedio >= 40 &&
        selectedPond.pesoPromedio < 70
      ) {
        selectedWeightRange = '40-70';
      } else if (
        selectedPond.pesoPromedio >= 70 &&
        selectedPond.pesoPromedio < 120
      ) {
        selectedWeightRange = '70-120';
      } else if (
        selectedPond.pesoPromedio >= 120 &&
        selectedPond.pesoPromedio < 200
      ) {
        selectedWeightRange = '120-200';
      } else if (
        selectedPond.pesoPromedio >= 200 &&
        selectedPond.pesoPromedio < 300
      ) {
        selectedWeightRange = '200-300';
      } else if (
        selectedPond.pesoPromedio >= 300 &&
        selectedPond.pesoPromedio < 400
      ) {
        selectedWeightRange = '300-400';
      }

      const selectedGuia = guiasData.find(guia => guia.id === selectedGuiaId);
      if (selectedGuia) {
        const feedingPercentage =
          selectedGuia.percentages[selectedPond.temperatura.toString()][
            selectedWeightRange.toString()
          ];
        setSelectedFeedingPercentage(feedingPercentage);

        // Calcular el alimento diario
        const dailyFoodCalc = (biomasaCalculada * feedingPercentage) / 100;
        setDailyFood(dailyFoodCalc);
        // Calcular la cantidad de alimento por ración
        const feedingFrequencyCalc =
          selectedGuia.feedingFrequency[selectedWeightRange];
        setFeedingFrequency(feedingFrequencyCalc);

        if (feedingFrequencyCalc > 0) {
          const foodPerMealCalc = dailyFoodCalc / feedingFrequencyCalc;
          setFoodPerMeal(foodPerMealCalc);
        } else {
          setFoodPerMeal(0); // Otra lógica si la frecuencia de alimento es 0
        }
        if (foodPerMeal !== null) {
          try {
            console.log(`Peso Promedio: ${selectedPondWeight}`);
            console.log(`Temperatura: ${selectedPondTemperature}`);
            console.log(
              `Porcentaje de alimentación: ${selectedFeedingPercentage}`,
            );
            // Guardar los datos en la colección "Alimentación programada"
            await firestore().collection('Alimentacion programada').add({
              estanqueSeleccionado: selectedPond.numeroDeEstanque,
              guiaSeleccionada: selectedGuia.species,
              biomasa: biomasa,
              alimentoDiario: dailyFood,
              frecuenciaDeAlimento: feedingFrequency,
              alimentoPorRacion: foodPerMeal,
              notificaciones: false, // Puedes establecer este valor según tus necesidades
            });
            // Limpiar los estados después de guardar los datos
            setBiomasa(null);
            setSelectedPondWeight(null);
            setSelectedPondTemperature(null);
            setSelectedFeedingPercentage(null);
            setDailyFood(null);
            setFoodPerMeal(null);
            setFeedingFrequency(null);
            Alert.alert('Aplicado');
          } catch (error) {
            console.error('Error al guardar los datos: ', error);
          }
        }
      }
    } else {
      setBiomasa(null);
      setSelectedPondWeight(null);
      setSelectedPondTemperature(null);
      setSelectedFeedingPercentage(null);
      setDailyFood(null);
      setFoodPerMeal(null);
      setFeedingFrequency(null);
    }
  };
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('Alimentacion programada')
      .onSnapshot(querySnapshot => {
        const data: ProgrammedFeeding[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as ProgrammedFeeding[];

        // Ordenar las guías programadas por estanque (puedes ajustar la lógica de ordenación según tus necesidades)
        const sortedData = data.sort(
          (a, b) => a.estanqueSeleccionado - b.estanqueSeleccionado,
        );

        setProgrammedFeeding(sortedData);
      });

    return () => {
      unsubscribe();
    };
  }, []);
  const handleDeleteProgrammedFeeding = (programmedFeedingId: string) => {
    Alert.alert(
      'Confirmación',
      '¿Estás seguro de que deseas eliminar esta guía programada?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              // Eliminar la guía programada de Firestore
              await firestore()
                .collection('Alimentacion programada')
                .doc(programmedFeedingId)
                .delete();

              // También puedes actualizar la lista de guías programadas localmente si lo deseas
              const updatedProgrammedFeeding = programmedFeeding.filter(
                feeding => feeding.id !== programmedFeedingId,
              );
              setProgrammedFeeding(updatedProgrammedFeeding);

              Alert.alert('Guía programada eliminada con éxito');
            } catch (error) {
              console.error('Error al eliminar la guía programada: ', error);
            }
          },
          style: 'destructive', // El estilo "destructive" muestra el botón en rojo
        },
      ],
      {cancelable: true},
    );
  };
  const handleNotificationsSwitch = async (programmedFeedingId: string) => {
    try {
      // Cambia el estado de notificaciones en Firestore
      await firestore()
        .collection('Alimentacion programada')
        .doc(programmedFeedingId) // Reemplaza ID_DEL_DOCUMENTO con el ID correcto del documento que deseas actualizar
        .update({
          notificaciones: !notificationsEnabled, // Invierte el valor actual
        });

      // Actualiza el estado local
      setNotificationsEnabled(!notificationsEnabled);
    } catch (error) {
      console.error('Error al cambiar el estado de notificaciones: ', error);
    }
  };
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Seleccionar estanque:</Text>
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

      <Text style={styles.label}>Seleccionar Guía:</Text>
      <Picker
        selectedValue={selectedGuiaId}
        onValueChange={itemValue => setSelectedGuiaId(itemValue)}
        style={styles.picker}>
        <Picker.Item label="Seleccionar Guía" value="" />
        {guiasData.map(guia => (
          <Picker.Item key={guia.id} label={guia.species} value={guia.id} />
        ))}
      </Picker>

      <Button title="Aplicar" onPress={handleAplicarButton} />
      {programmedFeeding.length > 0 && (
        <>
          {programmedFeeding.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Guías Programadas:</Text>
              {programmedFeeding.map(feeding => (
                <ProgrammedFeedingItem
                  key={feeding.id}
                  feeding={feeding}
                  onNotificationsSwitch={handleNotificationsSwitch}
                  onDelete={() => handleDeleteProgrammedFeeding(feeding.id)}
                />
              ))}
            </>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
  },
  label: {
    color: 'black',
    fontSize: 16,
    marginBottom: 5,
  },
  picker: {
    borderWidth: 1,
    marginBottom: 10,
    backgroundColor: 'black',
  },
  sectionTitle: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  programmedFeedingItem: {
    marginTop: 10,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    color: 'black',
  },
  text: {
    color: 'black',
  },
});

export default ScheduleFeedingScreen;
