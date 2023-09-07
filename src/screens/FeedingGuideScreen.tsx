import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

const FeedingGuideScreen: React.FC = () => {
  const navigation = useNavigation();
  const [guides, setGuides] = useState<
    {id: string; species: string; percentages: any}[]
  >([]);

  useEffect(() => {
    // Recuperar las guías de alimentación desde Firebase al cargar la pantalla
    const fetchGuides = async () => {
      try {
        const guidesRef = await firestore().collection('guias').get();
        const guidesData = guidesRef.docs.map(doc => ({
          id: doc.id,
          species: doc.data().species,
          percentages: doc.data().percentages,
        }));
        setGuides(guidesData);
      } catch (error) {
        console.error('Error al recuperar las guías de alimentación: ', error);
      }
    };

    fetchGuides();
  }, []);

  const navigateToAddGuide = () => {
    navigation.navigate('AddGuide');
  };

  const handleGuideView = (guide: {
    id: string;
    species: string;
    percentages: any;
  }) => {
    navigation.navigate('ViewGuide', {
      guideId: guide.id,
      species: guide.species,
      percentages: guide.percentages,
    });
  };

  const handleGuideDelete = (guideId: string, species: string) => {
    // Muestra una alerta de confirmación antes de eliminar
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que quieres eliminar la guía para ${species}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sí',
          onPress: async () => {
            // Lógica para eliminar una guía específica en Firebase
            try {
              await firestore().collection('guias').doc(guideId).delete();
              // Actualiza la lista de guías después de eliminar
              setGuides(prevGuides =>
                prevGuides.filter(guide => guide.id !== guideId),
              );
              Alert.alert('Guía eliminada con éxito.');
            } catch (error) {
              Alert.alert('Error al eliminar la guía: ', error);
            }
          },
        },
      ],
      {cancelable: false},
    );
  };

  const renderItem = ({
    item,
  }: {
    item: {id: string; species: string; percentages: any};
  }) => (
    <View style={styles.listItem}>
      <Text style={styles.text}>{item.species}</Text>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handleGuideView(item)}>
        <Text>Ver</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handleGuideDelete(item.id, item.species)}>
        <Text>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text>Lista de Guías de Alimentación</Text>
      <TouchableOpacity style={styles.addButton} onPress={navigateToAddGuide}>
        <Text style={styles.addButtonLabel}>Agregar Guía de Alimentación</Text>
      </TouchableOpacity>
      <FlatList
        data={guides}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
  addButton: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    marginTop: 10,
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
  addButtonLabel: {
    color: 'white',
    fontSize: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  actionButton: {
    backgroundColor: '#3498db',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginHorizontal: 5,
  },
  text: {
    color: 'black',
  },
});

export default FeedingGuideScreen;
