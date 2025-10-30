import { useAuth } from '@/contexts/AuthContext';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { User, Users, LogOut, ChevronRight, Shield } from 'lucide-react-native';
import { useCustomAlert } from '@/components/CustomAlert';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useEffect } from 'react';

const { width } = Dimensions.get('window');

export default function ProfileTabScreen() {
  const router = useRouter();
  const { currentUser, isAdmin, logout } = useAuth();
  const { showAlert } = useCustomAlert();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleLogout = async () => {
    showAlert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/welcome');
          },
        },
      ],
      'warning'
    );
  };

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  const menuItems = [
    {
      icon: User,
      label: 'Editar Perfil',
      onPress: handleEditProfile,
      visible: true,
    },
    {
      icon: Users,
      label: 'Gestionar Usuarios',
      onPress: () => router.push('/manage-users'),
      visible: isAdmin,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#2563eb', '#1d4ed8']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.avatarContainer}>
            <User size={64} color="#2563eb" strokeWidth={2.5} />
          </View>
          <Text style={styles.userName}>{currentUser?.name}</Text>
          <Text style={styles.userEmail}>{currentUser?.email}</Text>
          <View style={styles.roleBadge}>
            <Shield size={14} color={isAdmin ? '#2563eb' : '#64748b'} />
            <Text style={styles.roleBadgeText}>
              {isAdmin ? 'Administrador' : 'Usuario'}
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>

      <Animated.View style={[styles.menuSection, { opacity: fadeAnim }]}>
        {menuItems
          .filter((item) => item.visible)
          .map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemContent}>
                <View style={styles.menuIconContainer}>
                  <item.icon size={22} color="#2563eb" strokeWidth={2.5} />
                </View>
                <Text style={styles.menuItemText}>{item.label}</Text>
              </View>
              <ChevronRight size={20} color="#cbd5e1" strokeWidth={2} />
            </TouchableOpacity>
          ))}
      </Animated.View>

      <Animated.View style={[styles.logoutSection, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <View style={styles.logoutIconContainer}>
            <LogOut size={22} color="#ef4444" strokeWidth={2.5} />
          </View>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 60,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  userName: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  roleBadgeText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#0f172a',
  },
  menuSection: {
    marginTop: -36,
    marginHorizontal: Platform.OS === 'web' ? Math.min(width * 0.05, 20) : 16,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuItemText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#0f172a',
  },
  logoutSection: {
    marginTop: 20,
    marginHorizontal: Platform.OS === 'web' ? Math.min(width * 0.05, 20) : 16,
    marginBottom: 100,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  logoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  logoutText: {
    fontSize: 17,
    color: '#ef4444',
    fontWeight: '700' as const,
  },
});
