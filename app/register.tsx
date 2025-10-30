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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Building2, Mail, Lock, User, Sparkles } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

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
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)/movements');
    }
  }, [isAuthenticated, router]);
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

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
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 40 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View 
            style={[styles.header, {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }]}
          >
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                <Building2 size={52} color="#2563eb" strokeWidth={2.5} />
              </View>
              <View style={styles.sparkleIcon}>
                <Sparkles size={18} color="#fbbf24" />
              </View>
            </View>
            <Text style={styles.title}>Crea tu Cuenta</Text>
            <Text style={styles.subtitle}>Comienza a gestionar tus finanzas</Text>
          </Animated.View>

          <Animated.View 
            style={[styles.form, {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }]}
          >
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Nombre de la Empresa</Text>
              <View style={styles.inputContainer}>
                <Building2 size={20} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Mi Empresa S.A."
                  placeholderTextColor="#94a3b8"
                  value={companyName}
                  onChangeText={setCompanyName}
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Tu Nombre</Text>
              <View style={styles.inputContainer}>
                <User size={20} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Juan Pérez"
                  placeholderTextColor="#94a3b8"
                  value={name}
                  onChangeText={setName}
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Correo Electrónico</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="tu@email.com"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Contraseña</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Confirmar Contraseña</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Repite tu contraseña"
                  placeholderTextColor="#94a3b8"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#2563eb', '#1d4ed8']}
                style={styles.registerButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.registerButtonText}>Crear Cuenta</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
              <Link href="/login" asChild>
                <TouchableOpacity disabled={isLoading}>
                  <Text style={styles.loginLink}>Iniciar sesión</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Platform.OS === 'web' ? Math.min(width * 0.1, 60) : 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  iconBackground: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  sparkleIcon: {
    position: 'absolute',
    top: -2,
    right: 5,
  },
  title: {
    fontSize: 36,
    fontWeight: '800' as const,
    color: '#0f172a',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#64748b',
  },
  form: {
    width: '100%',
    maxWidth: 450,
    alignSelf: 'center',
  },
  inputWrapper: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#334155',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
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
  registerButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 12,
    marginBottom: 20,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  registerButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500' as const,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 15,
    color: '#64748b',
  },
  loginLink: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#2563eb',
  },
});
