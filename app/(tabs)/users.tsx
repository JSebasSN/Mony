import { useAuth } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Stack } from 'expo-router';
import { UserPlus, Trash2, Shield, User as UserIcon } from 'lucide-react-native';
import { UserRole } from '@/types';

export default function UsersScreen() {
  const { currentUser } = useAuth();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<UserRole>('user');

  const usersQuery = trpc.users.getAll.useQuery(
    { groupId: currentUser?.groupId || '' },
    { enabled: !!currentUser?.groupId && currentUser?.role === 'admin' }
  );

  const createUserMutation = trpc.users.create.useMutation({
    onSuccess: () => {
      usersQuery.refetch();
    },
  });

  const deleteUserMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      usersQuery.refetch();
    },
  });

  const users = usersQuery.data || [];

  const handleAddUser = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Todos los campos son requeridos');
      return;
    }

    if (!currentUser?.groupId) {
      Alert.alert('Error', 'Grupo no encontrado');
      return;
    }

    try {
      await createUserMutation.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
        groupId: currentUser.groupId,
      });

      setName('');
      setEmail('');
      setPassword('');
      setRole('user');
      setShowModal(false);
      Alert.alert('Éxito', 'Usuario creado correctamente');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudo crear el usuario');
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de eliminar a ${userName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUserMutation.mutateAsync({ userId });
              Alert.alert('Éxito', 'Usuario eliminado correctamente');
            } catch (error: any) {
              Alert.alert('Error', error?.message || 'No se pudo eliminar el usuario');
            }
          },
        },
      ]
    );
  };

  if (currentUser?.role !== 'admin') {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Usuarios' }} />
        <View style={styles.noAccessContainer}>
          <Text style={styles.noAccessText}>Acceso restringido</Text>
          <Text style={styles.noAccessSubtext}>Solo administradores pueden gestionar usuarios</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Usuarios',
          headerRight: () => (
            <TouchableOpacity onPress={() => setShowModal(true)} style={styles.addButton}>
              <UserPlus size={24} color="#007AFF" />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.groupHeader}>
        <Text style={styles.groupName}>Usuarios de la Empresa</Text>
        <Text style={styles.groupUsers}>{users.length} usuarios</Text>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
          const isAdmin = item.role === 'admin';
          const isSelf = item.id === currentUser?.id;

          return (
            <View style={styles.userCard}>
              <View style={[styles.userIcon, isAdmin ? styles.adminIcon : styles.normalIcon]}>
                {isAdmin ? <Shield size={20} color="#FF9500" /> : <UserIcon size={20} color="#007AFF" />}
              </View>

              <View style={styles.userInfo}>
                <View style={styles.userNameRow}>
                  <Text style={styles.userName}>{item.name}</Text>
                  {isSelf && <Text style={styles.selfBadge}>Tú</Text>}
                </View>
                <Text style={styles.userEmail}>{item.email}</Text>
                <Text style={styles.userRole}>
                  {isAdmin ? 'Administrador' : 'Usuario'}
                </Text>
              </View>

              {!isSelf && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteUser(item.id, item.name)}
                >
                  <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nuevo Usuario</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Juan Pérez"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="juan@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Rol</Text>
              <View style={styles.roleSelector}>
                <TouchableOpacity
                  style={[styles.roleButton, role === 'user' && styles.roleButtonActive]}
                  onPress={() => setRole('user')}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      role === 'user' && styles.roleButtonTextActive,
                    ]}
                  >
                    Usuario
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleButton, role === 'admin' && styles.roleButtonActive]}
                  onPress={() => setRole('admin')}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      role === 'admin' && styles.roleButtonTextActive,
                    ]}
                  >
                    Admin
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowModal(false);
                  setName('');
                  setEmail('');
                  setPassword('');
                  setRole('user');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleAddUser}>
                <Text style={styles.saveButtonText}>Crear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  noAccessContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noAccessText: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#1C1C1E',
    marginBottom: 8,
  },
  noAccessSubtext: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  addButton: {
    padding: 4,
  },
  groupHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  groupName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    marginBottom: 4,
  },
  groupUsers: {
    fontSize: 14,
    color: '#8E8E93',
  },
  listContainer: {
    padding: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  userIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  adminIcon: {
    backgroundColor: '#FFF3E0',
  },
  normalIcon: {
    backgroundColor: '#E3F2FD',
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1C1C1E',
  },
  selfBadge: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#007AFF',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 13,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1C1C1E',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F7',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#007AFF',
  },
  roleButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#666',
  },
  roleButtonTextActive: {
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F7',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#666',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
