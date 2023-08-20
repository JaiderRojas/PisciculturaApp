import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import firestore from '@react-native-firebase/firestore';

interface User {
  name: string;
  email: string;
  role: string;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await firestore().collection('users').get();
      const usersData: User[] = [];

      usersSnapshot.forEach(userDoc => {
        const userData = userDoc.data() as User;
        usersData.push(userData);
      });

      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const renderItem = ({item}: {item: User}) => (
    <View style={styles.userItem}>
      <Text style={styles.text}>Name: {item.name}</Text>
      <Text style={styles.text}>Email: {item.email}</Text>
      <Text style={styles.text}>Role: {item.role}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Usuarios</Text>
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    color: 'black',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  userItem: {
    borderBottomWidth: 1,
    marginBottom: 10,
    color: 'black',
  },
  text: {
    color: 'black',
  },
});

export default UserList;
