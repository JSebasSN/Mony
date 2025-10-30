import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useCustomAlert } from '@/components/CustomAlert';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
  Modal,
} from 'react-native';
import { Stack } from 'expo-router';
import { UserPlus, Trash2, Edit2, Mail, Lock, User, Shield } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/trpc';

export default function ManageUsersScreen() {
  const insets = useSafeAreaInsets();
  const { currentUser } = useAuth();
  const { showAlert } = useCustomAlert();
  
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formName, setFormName] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formPassword, setFormPassword] = useState<string>('');
  const [formRole, setFormRole] = useState<'admin' | 'user'>('user');

  const usersQuery = trpc.users.getAll.useQuery(
    { groupId: currentUser?.groupId || '' },
    { enabled: !!currentUser?.groupId }
  );

  const createMutation = trpc.users.create.useMutation({
    onSuccess: () => {
      usersQuery.refetch();
      closeModal();
      showAlert('Éxito', 'Usuario creado correctamente', undefined, 'success');
    },
    onError: (error) => {
      showAlert('Error', error.message || 'No se pudo crear el usuario', undefined, 'error');
    },
  });

  const updateMutation = trpc.users.update.useMutation({
    onSuccess: () => {
      usersQuery.refetch();
      closeModal();
      showAlert('Éxito', 'Usuario actualizado correctamente', undefined, 'success');
    },
    onError: (error) => {
      showAlert('Error', error.message || 'No se pudo actualizar el usuario', undefined, 'error');
    },
  });

  const deleteMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      usersQuery.refetch();
      showAlert('Éxito', 'Usuario eliminado correctamente', undefined, 'success');
    },
    onError: (error) => {
      showAlert('Error', error.message || 'No se pudo eliminar el usuario', undefined, 'error');
    },
  });

  const openCreateModal = () => {
    setEditingUserId(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('user');
    setShowModal(true);
  };

  const openEditModal = (user: any) => {
    setEditingUserId(user.id);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword('');
    setFormRole(user.role);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUserId(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('user');
  };

  const handleSave = () => {
    if (!formName.trim() || !formEmail.trim()) {
      showAlert('Error', 'Nombre y email son obligatorios', undefined, 'error');
      return;
    }

    if (!editingUserId && !formPassword.trim()) {
      showAlert('Error', 'La contraseña es obligatoria para nuevos usuarios', undefined, 'error');
      return;
    }

    if (formPassword && formPassword.length < 6) {
      showAlert('Error', 'La contraseña debe tener al menos 6 caracteres', undefined, 'error');
      return;
    }

    if (editingUserId) {
      const updates: any = {
        userId: editingUserId,
        name: formName.trim(),
        email: formEmail.trim(),
        role: formRole,
      };
      if (formPassword.trim()) {
        updates.password = formPassword.trim();
      }
      updateMutation.mutate(updates);
    } else {
      createMutation.mutate({
        name: formName.trim(),
        email: formEmail.trim(),
        password: formPassword.trim(),
        role: formRole,
        groupId: currentUser?.groupId || '',
      });
    }
  };

  const handleDelete = (userId: string, userName: string) => {
    if (userId === currentUser?.id) {
      showAlert('Error', 'No puedes eliminarte a ti mismo', undefined, 'error');
      return;
    }

    showAlert(
      'Eliminar Usuario',
      `¿Estás seguro de que deseas eliminar a ${userName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteMutation.mutate({ userId }),
        },
      ],
      'warning'
    );
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Solo los administradores pueden acceder aquí</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Gestionar Usuarios',
          headerBackTitle: 'Atrás',
        }}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Equipo</Text>
          <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
            <UserPlus size={20} color="#fff" />
            <Text style={styles.addButtonText}>Nuevo</Text>
          </TouchableOpacity>
        </View>

        {usersQuery.isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2d4a7c" />
          </View>
        ) : (
          <FlatList
            data={usersQuery.data || []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
            renderItem={({ item }) => {
              const isCurrentUser = item.id === currentUser.id;
              return (
                <View style={styles.userCard}>
                  <View style={styles.userCardLeft}>
                    <View
                      style={[
                        styles.userAvatar,
                        item.role === 'admin' ? styles.adminAvatar : styles.normalAvatar,
                      ]}
                    >
                      {item.role === 'admin' ? (
                        <Shield size={24} color="#FF9500" />
                      ) : (
                        <User size={24} color="#2d4a7c" />
                      )}
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>
                        {item.name} {isCurrentUser && '(Tú)'}
                      </Text>
                      <Text style={styles.userEmail}>{item.email}</Text>
                      <Text style={styles.userRole}>
                        {item.role === 'admin' ? 'Administrador' : 'Usuario'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.userCardRight}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => openEditModal(item)}
                    >
                      <Edit2 size={20} color="#2d4a7c" />
                    </TouchableOpacity>
                    {!isCurrentUser && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDelete(item.id, item.name)}
                      >
                        <Trash2 size={20} color="#FF3B30" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            }}
          />
        )}

        <Modal
          visible={showModal}
          animationType="slide"
          transparent={true}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingUserId ? 'Editar Usuario' : 'Nuevo Usuario'}
                </Text>
                <TouchableOpacity onPress={closeModal}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <User size={20} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nombre completo"
                  value={formName}
                  onChangeText={setFormName}
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Mail size={20} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Correo electrónico"
                  value={formEmail}
                  onChangeText={setFormEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Lock size={20} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={editingUserId ? 'Nueva contraseña (opcional)' : 'Contraseña'}
                  value={formPassword}
                  onChangeText={setFormPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <Text style={styles.roleLabel}>Rol</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[styles.roleButton, formRole === 'user' && styles.roleButtonActive]}
                  onPress={() => setFormRole('user')}
                >
                  <Text
                    style={[styles.roleButtonText, formRole === 'user' && styles.roleButtonTextActive]}
                  >
                    Usuario
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleButton, formRole === 'admin' && styles.roleButtonActive]}
                  onPress={() => setFormRole('admin')}
                >
                  <Text
                    style={[styles.roleButtonText, formRole === 'admin' && styles.roleButtonTextActive]}
                  >
                    Administrador
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (createMutation.isPending || updateMutation.isPending) &&
                    styles.saveButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingUserId ? 'Actualizar' : 'Crear Usuario'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
  },
  errorText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1C1C1E',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d4a7c',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  listContent: {
    padding: 20,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  adminAvatar: {
    backgroundColor: '#FFF3E0',
  },
  normalAvatar: {
    backgroundColor: '#E8F0FE',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1C1C1E',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 13,
    color: '#8E8E93',
  },
  userCardRight: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
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
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1C1C1E',
  },
  modalClose: {
    fontSize: 28,
    color: '#8E8E93',
    fontWeight: '300' as const,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    color: '#1C1C1E',
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1C1C1E',
    marginBottom: 12,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    alignItems: 'center',
  },
  roleButtonActive: {
    borderColor: '#2d4a7c',
    backgroundColor: '#E8F0FE',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#8E8E93',
  },
  roleButtonTextActive: {
    color: '#2d4a7c',
  },
  saveButton: {
    backgroundColor: '#2d4a7c',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
