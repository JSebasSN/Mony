import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
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
  Animated,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { Stack } from 'expo-router';
import { UserPlus, Trash2, Edit2, Mail, Lock, User, Shield } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/trpc';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

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
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

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
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTitleStyle: {
            fontWeight: '700' as const,
          },
        }}
      />
      <View style={styles.container}>
        <LinearGradient
          colors={['#ffffff', '#f8fafc']}
          style={styles.gradient}
        >
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Equipo</Text>
              <Text style={styles.headerSubtitle}>
                {usersQuery.data?.length || 0} {usersQuery.data?.length === 1 ? 'miembro' : 'miembros'}
              </Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={openCreateModal} activeOpacity={0.8}>
              <LinearGradient
                colors={['#2563eb', '#1d4ed8']}
                style={styles.addButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <UserPlus size={20} color="#fff" strokeWidth={2.5} />
                <Text style={styles.addButtonText}>Nuevo</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {usersQuery.isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>Cargando usuarios...</Text>
            </View>
          ) : (
            <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
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
                            <Shield size={28} color="#f59e0b" strokeWidth={2.5} />
                          ) : (
                            <User size={28} color="#2563eb" strokeWidth={2.5} />
                          )}
                        </View>
                        <View style={styles.userInfo}>
                          <View style={styles.userNameRow}>
                            <Text style={styles.userName}>{item.name}</Text>
                            {isCurrentUser && (
                              <View style={styles.currentUserBadge}>
                                <Text style={styles.currentUserBadgeText}>Tú</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.userEmail}>{item.email}</Text>
                          <View style={styles.roleChip}>
                            <Text style={[
                              styles.roleChipText,
                              item.role === 'admin' ? styles.roleChipAdmin : styles.roleChipUser
                            ]}>
                              {item.role === 'admin' ? 'Administrador' : 'Usuario'}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.userCardRight}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => openEditModal(item)}
                          activeOpacity={0.7}
                        >
                          <Edit2 size={18} color="#2563eb" strokeWidth={2.5} />
                        </TouchableOpacity>
                        {!isCurrentUser && (
                          <TouchableOpacity
                            style={styles.deleteActionButton}
                            onPress={() => handleDelete(item.id, item.name)}
                            activeOpacity={0.7}
                          >
                            <Trash2 size={18} color="#ef4444" strokeWidth={2.5} />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                }}
              />
            </Animated.View>
          )}
        </LinearGradient>

        <Modal
          visible={showModal}
          animationType="slide"
          transparent={true}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20, maxWidth: Platform.OS === 'web' ? 600 : undefined, width: Platform.OS === 'web' ? '90%' : '100%', alignSelf: 'center' }]}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>
                      {editingUserId ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </Text>
                    <Text style={styles.modalSubtitle}>
                      {editingUserId ? 'Actualiza la información del usuario' : 'Agrega un nuevo miembro al equipo'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Nombre completo</Text>
                  <View style={styles.inputContainer}>
                    <User size={20} color="#64748b" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Nombre completo"
                      placeholderTextColor="#94a3b8"
                      value={formName}
                      onChangeText={setFormName}
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Correo electrónico</Text>
                  <View style={styles.inputContainer}>
                    <Mail size={20} color="#64748b" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="usuario@email.com"
                      placeholderTextColor="#94a3b8"
                      value={formEmail}
                      onChangeText={setFormEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>
                    {editingUserId ? 'Nueva contraseña (opcional)' : 'Contraseña'}
                  </Text>
                  <View style={styles.inputContainer}>
                    <Lock size={20} color="#64748b" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="#94a3b8"
                      value={formPassword}
                      onChangeText={setFormPassword}
                      secureTextEntry
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <Text style={styles.roleLabel}>Rol del usuario</Text>
                <View style={styles.roleContainer}>
                  <TouchableOpacity
                    style={[styles.roleButton, formRole === 'user' && styles.roleButtonActive]}
                    onPress={() => setFormRole('user')}
                    activeOpacity={0.7}
                  >
                    <User size={18} color={formRole === 'user' ? '#2563eb' : '#64748b'} strokeWidth={2.5} />
                    <Text
                      style={[styles.roleButtonText, formRole === 'user' && styles.roleButtonTextActive]}
                    >
                      Usuario
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.roleButton, formRole === 'admin' && styles.roleButtonActive]}
                    onPress={() => setFormRole('admin')}
                    activeOpacity={0.7}
                  >
                    <Shield size={18} color={formRole === 'admin' ? '#2563eb' : '#64748b'} strokeWidth={2.5} />
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
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#2563eb', '#1d4ed8']}
                    style={styles.saveButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.saveButtonText}>
                        {editingUserId ? 'Actualizar Usuario' : 'Crear Usuario'}
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
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
  },
  gradient: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500' as const,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'web' ? Math.min(width * 0.05, 24) : 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#0f172a',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  addButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  listContent: {
    padding: Platform.OS === 'web' ? Math.min(width * 0.05, 24) : 20,
    maxWidth: Platform.OS === 'web' ? 1200 : undefined,
    width: '100%',
    alignSelf: 'center',
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  userCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  adminAvatar: {
    backgroundColor: '#fef3c7',
  },
  normalAvatar: {
    backgroundColor: '#dbeafe',
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  currentUserBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  currentUserBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#2563eb',
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  roleChip: {
    alignSelf: 'flex-start',
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  roleChipAdmin: {
    color: '#f59e0b',
  },
  roleChipUser: {
    color: '#64748b',
  },
  userCardRight: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  deleteActionButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
    ...(Platform.OS === 'web' ? { justifyContent: 'center', alignItems: 'center' } : {}),
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    maxHeight: '90%',
    ...(Platform.OS === 'web' ? { 
      borderRadius: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
    } : {}),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: '#0f172a',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    fontSize: 22,
    color: '#64748b',
    fontWeight: '400' as const,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#334155',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    color: '#0f172a',
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#334155',
    marginBottom: 12,
    marginLeft: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  roleButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#dbeafe',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  roleButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#64748b',
  },
  roleButtonTextActive: {
    color: '#2563eb',
  },
  saveButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonGradient: {
    paddingVertical: 18,
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
