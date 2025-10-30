import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
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
import { useRouter, Link } from 'expo-router';
import { Building2, Mail, Lock, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { registerWithEmail, isAuthenticated } = useAuth();
  const { showAlert } = useCustomAlert();
  
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)/movements');
    }
  }, [isAuthenticated, router]);

  const handleRegister = async () => {
    if (isLoading) {
      console.log('[Register] Registration already in progress');
      return;
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();
    const trimmedCompanyName = companyName.trim();

    if (!trimmedCompanyName) {
      showAlert('Error', 'Por favor ingresa el nombre de la empresa', undefined, 'error');
      return;
    }

    if (!trimmedName) {
      showAlert('Error', 'Por favor ingresa tu nombre completo', undefined, 'error');
      return;
    }

    if (!trimmedEmail) {
      showAlert('Error', 'Por favor ingresa tu correo electrónico', undefined, 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      showAlert('Error', 'Por favor ingresa un correo electrónico válido', undefined, 'error');
      return;
    }

    if (!trimmedPassword) {
      showAlert('Error', 'Por favor ingresa una contraseña', undefined, 'error');
      return;
    }

    if (trimmedPassword.length < 6) {
      showAlert('Error', 'La contraseña debe tener al menos 6 caracteres', undefined, 'error');
      return;
    }

    if (!trimmedConfirmPassword) {
      showAlert('Error', 'Por favor confirma tu contraseña', undefined, 'error');
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      showAlert('Error', 'Las contraseñas no coinciden', undefined, 'error');
      return;
    }

    console.log('[Register] Starting registration for:', trimmedEmail);
    console.log('[Register] Company name:', trimmedCompanyName);
    setIsLoading(true);
    
    try {
      await registerWithEmail(
        trimmedEmail.toLowerCase(),
        trimmedPassword,
        trimmedName,
        trimmedCompanyName
      );
      console.log('[Register] Registration successful');
      showAlert('Éxito', '¡Cuenta creada exitosamente!', undefined, 'success');
    } catch (error) {
      console.error('[Register] Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al registrarse';
      showAlert('Error', errorMessage, undefined, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Building2 size={48} color="#2d4a7c" strokeWidth={2} />
          </View>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Regístrate con Firebase</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Building2 size={20} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nombre de la empresa"
              value={companyName}
              onChangeText={setCompanyName}
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <User size={20} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Tu nombre completo"
              value={name}
              onChangeText={setName}
              autoCorrect={false}
              editable={!isLoading}
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
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña (min. 6 caracteres)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Tu cuenta será creada en Firebase y tendrás acceso completo a la aplicación.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Crear Cuenta</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
            <Link href="/login" asChild>
              <TouchableOpacity disabled={isLoading}>
                <Text style={styles.loginLink}>Iniciar sesión</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
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
  infoBox: {
    backgroundColor: '#E8F0FE',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#2d4a7c',
    lineHeight: 20,
  },
  registerButton: {
    backgroundColor: '#2d4a7c',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 15,
    color: '#8E8E93',
  },
  loginLink: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#2d4a7c',
  },
});
