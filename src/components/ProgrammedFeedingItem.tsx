import React from 'react';
import {View, Text, Switch, Button} from 'react-native';

// Define un tipo para las props
interface ProgrammedFeedingItemProps {
  feeding: {
    id: string;
    estanqueSeleccionado: number;
    guiaSeleccionada: string;
    biomasa: number;
    alimentoDiario: number;
    frecuenciaDeAlimento: number;
    alimentoPorRacion: number;
    notificaciones: boolean;
  };
  onNotificationsSwitch: (id: string) => void;
  onDelete: () => void;
}

const ProgrammedFeedingItem: React.FC<ProgrammedFeedingItemProps> = ({
  feeding,
  onNotificationsSwitch,
  onDelete,
}) => {
  return (
    <View key={feeding.id} style={styles.programmedFeedingItem}>
      <Text style={styles.text}>Estanque: {feeding.estanqueSeleccionado}</Text>
      <Text style={styles.text}>Guía: {feeding.guiaSeleccionada}</Text>
      <Text style={styles.text}>Biomasa: {feeding.biomasa} g</Text>
      <Text style={styles.text}>
        Alimento Diario: {feeding.alimentoDiario} g
      </Text>
      <Text style={styles.text}>
        Frecuencia de Alimento: {feeding.frecuenciaDeAlimento} veces al día
      </Text>
      <Text style={styles.text}>
        Alimento por Ración: {feeding.alimentoPorRacion} g
      </Text>
      <Text style={styles.text}>
        Notificaciones: {feeding.notificaciones ? 'Activadas' : 'Desactivadas'}
      </Text>
      <Switch
        value={feeding.notificaciones}
        onValueChange={() => onNotificationsSwitch(feeding.id)}
      />
      <Button title="Eliminar" onPress={onDelete} />
    </View>
  );
};

// Estilos para ProgrammedFeedingItem
const styles = {
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
};

export default ProgrammedFeedingItem;
