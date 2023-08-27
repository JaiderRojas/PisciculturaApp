import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [editedRole, setEditedRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await firestore().collection('users').get();
      const usersData: User[] = [];

      usersSnapshot.forEach(userDoc => {
        const userData = {id: userDoc.id, ...userDoc.data()} as User;
        usersData.push(userData);
      });

      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditedName(user.name);
    setEditedEmail(user.email);
    setEditedRole(user.role);
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setSelectedUser(null);
    setEditedName('');
    setEditedEmail('');
    setEditedRole('');
  };

  const saveChanges = async () => {
    if (selectedUser) {
      try {
        await firestore().collection('users').doc(selectedUser.id).update({
          name: editedName,
          email: editedEmail,
          role: editedRole,
        });

        // Update local user data
        const updatedUsers = users.map(user =>
          user.id === selectedUser.id
            ? {...user, name: editedName, email: editedEmail, role: editedRole}
            : user,
        );
        setUsers(updatedUsers);

        closeEditModal();
      } catch (error) {
        console.error('Error updating user:', error);
      }
    }
  };
  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalVisible(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalVisible(false);
    setSelectedUser(null);
  };

  const confirmDelete = async () => {
    if (selectedUser) {
      try {
        await firestore().collection('users').doc(selectedUser.id).delete();

        // Update local user data
        const updatedUsers = users.filter(user => user.id !== selectedUser.id);
        setUsers(updatedUsers);

        closeDeleteModal();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const renderItem = ({item}: {item: User}) => (
    <View style={styles.userItem}>
      <Text style={styles.text}>Name: {item.name}</Text>
      <Text style={styles.text}>Email: {item.email}</Text>
      <Text style={styles.text}>Role: {item.role}</Text>
      <TouchableOpacity onPress={() => openEditModal(item)}>
        <Text style={styles.text}>Editar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => openDeleteModal(item)}>
        <Text style={styles.text}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Usuarios</Text>
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />

      <Modal visible={isEditModalVisible} animationType="slide">
        <View style={styles.editModal}>
          <Text style={styles.text}>Edit User</Text>
          <TextInput
            style={styles.input}
            value={editedName}
            onChangeText={setEditedName}
          />
          <TextInput
            style={styles.input}
            value={editedEmail}
            onChangeText={setEditedEmail}
          />
          <TextInput
            style={styles.input}
            value={editedRole}
            onChangeText={setEditedRole}
          />
          <Button title="Save" onPress={saveChanges} />
          <Button title="Cancel" onPress={closeEditModal} />
        </View>
      </Modal>
      <Modal visible={isDeleteModalVisible} animationType="slide">
        <View style={styles.editModal}>
          <Text style={styles.text}>Confirmar Eliminación</Text>
          <Text style={styles.text}>
            ¿Estás seguro de eliminar a {selectedUser?.name}?
          </Text>
          <Button title="Eliminar" onPress={confirmDelete} />
          <Button title="Cancelar" onPress={closeDeleteModal} />
        </View>
      </Modal>
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
  editModal: {
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
});

export default UserList;
