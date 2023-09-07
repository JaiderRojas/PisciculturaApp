import React from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';
import {useQuery} from 'react-query';
import firestore from '@react-native-firebase/firestore';

const PreviousSalesScreen: React.FC = () => {
  const {data, error, isLoading} = useQuery('sales', async () => {
    const querySnapshot = await firestore()
      .collection('ventas')
      .orderBy('fecha', 'desc')
      .get();
    return querySnapshot.docs.map(doc => doc.data());
  });

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: {error.toString()}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ventas Anteriores</Text>
      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => (
          <View style={styles.saleItem}>
            <Text style={styles.text}>Peso: {item.peso} lb</Text>
            <Text style={styles.text}>Precio Total: {item.precioTotal}</Text>
            <Text style={styles.text}>
              Fecha: {item.fecha.toDate().toLocaleDateString()}
            </Text>
            <Text style={styles.text}>
              Precio por Libra: {item.precioPorLibra}
            </Text>
            <Text style={styles.text}>
              Numero de peces: {item.numeroDePeces}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black',
  },
  saleItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
  text: {
    color: 'black',
  },
});

export default PreviousSalesScreen;
