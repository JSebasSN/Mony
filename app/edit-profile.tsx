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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { User, Mail, Lock, Save } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/trpc';

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser, updateCurrentUser } = useAuth();
  const { showAlert } = useCustomAlert();
  
  const [name, setName] = useState<string>(currentUser?.name || '');
  const [email, setEmail] = useState<string>(currentUser?.email || '');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const updateMutation = trpc.users.update.useMutation({
    onSuccess: async (data) => {
      console.log('[EditProfile] Update successful:', data);
      try {
        await updateCurrentUser(data);
        showAlert('Éxito', 'Perfil actualizado correctamente', undefined, 'success');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          router.back();
        }, 500);
      } catch (error) {
        console.error('[EditProfile] Error updating context:', error);
      }
    },
    onError: (error) => {
      console.error('[EditProfile] Update error:', error);
      showAlert('Error', error.message || 'No se pudo actualizar el perfil', undefined, 'error');
    },
  });

  const handleSave = () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail) {
      showAlert('Error', 'El nombre y email son obligatorios', undefined, 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      showAlert('Error', 'Por favor ingresa un email válido', undefined, 'error');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      showAlert('Error', 'Las contraseñas nuevas no coinciden', undefined, 'error');
      return;
    }

    if (newPassword && newPassword.trim().length < 6) {
      showAlert('Error', 'La contraseña debe tener al menos 6 caracteres', undefined, 'error');
      return;
    }

    if (!currentUser?.id) {
      showAlert('Error', 'No se encontró el usuario', undefined, 'error');
      return;
    }

    console.log('[EditProfile] Updating profile for:', currentUser.id);
    
    const updates: {
      userId: string;
      name: string;
      email: string;
      password?: string;
    } = {
      userId: currentUser.id,
      name: trimmedName,
      email: trimmedEmail.toLowerCase(),
    };

    if (newPassword) {
      updates.password = newPassword.trim();
    }

    updateMutation.mutate(updates);
  };

  if (!currentUser) {
    return null;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Editar Perfil',
          headerBackTitle: 'Atrás',
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <User size={56} color="#2d4a7c" strokeWidth={2} />
            </View>
            <Text style={styles.roleText}>
              {currentUser.role === 'admin' ? 'Administrador' : 'Usuario'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Personal</Text>

            <View style={styles.inputContainer}>
              <User size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                value={name}
                onChangeText={setName}
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Mail size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cambiar Contraseña</Text>
            <Text style={styles.sectionSubtitle}>
              Deja en blanco si no deseas cambiarla
            </Text>

            <View style={styles.inputContainer}>
              <Lock size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nueva contraseña"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirmar nueva contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, updateMutation.isPending && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Save size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.saveButtonText}>Guardar Cambios</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  roleText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500' as const,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
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
  saveButton: {
    backgroundColor: '#2d4a7c',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
