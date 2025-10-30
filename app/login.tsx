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
import { LogIn, Mail, Lock, Sparkles } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { loginWithEmail, isAuthenticated } = useAuth();
  const { showAlert } = useCustomAlert();
  
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
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

  const handleLogin = async () => {
    if (isLoading) {
      console.log('[Login] Login already in progress');
      return;
    }

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

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
      showAlert('Error', 'Por favor ingresa tu contraseña', undefined, 'error');
      return;
    }

    console.log('[Login] Starting login for:', trimmedEmail);
    setIsLoading(true);
    
    try {
      await loginWithEmail(trimmedEmail.toLowerCase(), trimmedPassword);
      console.log('[Login] Login successful, navigating...');
      showAlert('Éxito', '¡Bienvenido!', undefined, 'success');
    } catch (error) {
      console.error('[Login] Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión';
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
                <LogIn size={52} color="#2563eb" strokeWidth={2.5} />
              </View>
              <View style={styles.sparkleIcon}>
                <Sparkles size={18} color="#fbbf24" />
              </View>
            </View>
            <Text style={styles.title}>Bienvenido</Text>
            <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
          </Animated.View>

          <Animated.View 
            style={[styles.form, {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }]}
          >
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
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#2563eb', '#1d4ed8']}
                style={styles.loginButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <Link href="/forgot-password" asChild>
              <TouchableOpacity style={styles.forgotPasswordButton} disabled={isLoading}>
                <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            </Link>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>¿No tienes cuenta?</Text>
              <Link href="/register" asChild>
                <TouchableOpacity disabled={isLoading}>
                  <Text style={styles.registerLink}>Crear cuenta</Text>
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
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
    marginBottom: 20,
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
  loginButton: {
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
  loginButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  forgotPasswordButton: {
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#2563eb',
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
  registerLink: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#2563eb',
  },
});
