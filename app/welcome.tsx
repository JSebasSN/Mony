import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, Users, DollarSign, Sparkles, BarChart3 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e3a5f', '#2563eb']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
          <Animated.View 
            style={[
              styles.iconContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  { translateY: slideAnim },
                ],
              },
            ]}
          >
            <View style={styles.iconBackground}>
              <BarChart3 size={72} color="#3b82f6" strokeWidth={2.5} />
            </View>
            <View style={[styles.sparkle, styles.sparkle1]}>
              <Sparkles size={20} color="#fbbf24" />
            </View>
            <View style={[styles.sparkle, styles.sparkle2]}>
              <Sparkles size={16} color="#60a5fa" />
            </View>
          </Animated.View>

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Text style={styles.title}>FinanceFlow</Text>
            <Text style={styles.subtitle}>
              Lleva el control de tu empresa{"\n"}de forma inteligente y visual
            </Text>
          </Animated.View>

          <Animated.View 
            style={[
              styles.featuresContainer,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: '#dbeafe' }]}>
                <Users size={28} color="#2563eb" strokeWidth={2} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Colaboración</Text>
                <Text style={styles.featureText}>Gestiona equipos completos</Text>
              </View>
            </View>
            
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: '#dcfce7' }]}>
                <TrendingUp size={28} color="#16a34a" strokeWidth={2} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>En Tiempo Real</Text>
                <Text style={styles.featureText}>Balance actualizado siempre</Text>
              </View>
            </View>
            
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: '#fef3c7' }]}>
                <DollarSign size={28} color="#ca8a04" strokeWidth={2} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Reportes</Text>
                <Text style={styles.featureText}>Análisis mensuales detallados</Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View 
            style={[
              styles.buttonContainer,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <Link href="/login" asChild>
              <TouchableOpacity 
                style={styles.primaryButton}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#ffffff', '#f1f5f9']}
                  style={styles.primaryButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Link>

            <Link href="/register" asChild>
              <TouchableOpacity 
                style={styles.secondaryButton}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>
                  Crear Cuenta Nueva
                </Text>
              </TouchableOpacity>
            </Link>
            
            <Text style={styles.footerText}>
              Gestión financiera profesional para tu negocio
            </Text>
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'web' ? Math.min(width * 0.1, 60) : 24,
  },
  iconContainer: {
    position: 'relative',
    marginTop: 40,
    marginBottom: 24,
  },
  iconBackground: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  sparkle: {
    position: 'absolute',
  },
  sparkle1: {
    top: -5,
    right: 10,
  },
  sparkle2: {
    bottom: 5,
    left: -5,
  },
  title: {
    fontSize: 44,
    fontWeight: '800' as const,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    width: '100%',
    maxWidth: 500,
    gap: 16,
    marginBottom: 20,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 2,
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400' as const,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 500,
    gap: 14,
    marginBottom: 20,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1e40af',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#fff',
  },
  footerText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 8,
  },
});
