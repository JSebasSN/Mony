import { useAuth } from '@/contexts/AuthContext';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { User, Users, LogOut } from 'lucide-react-native';
import { useCustomAlert } from '@/components/CustomAlert';

export default function ProfileTabScreen() {
  const router = useRouter();
  const { currentUser, isAdmin, logout } = useAuth();
  const { showAlert } = useCustomAlert();

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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <User size={56} color="#2d4a7c" strokeWidth={2} />
        </View>
        <Text style={styles.userName}>{currentUser?.name}</Text>
        <Text style={styles.userEmail}>{currentUser?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>
            {isAdmin ? 'Administrador' : 'Usuario'}
          </Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        {menuItems
          .filter((item) => item.visible)
          .map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <item.icon size={24} color="#2d4a7c" />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </View>
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>
          ))}
      </View>

      <View style={styles.logoutSection}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <View style={styles.menuItemLeft}>
            <LogOut size={24} color="#FF3B30" />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
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
  userName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleBadgeText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#2d4a7c',
  },
  menuSection: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 17,
    color: '#1C1C1E',
  },
  menuItemArrow: {
    fontSize: 28,
    color: '#C7C7CC',
    fontWeight: '300' as const,
  },
  logoutSection: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 40,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  logoutText: {
    fontSize: 17,
    color: '#FF3B30',
    fontWeight: '600' as const,
  },
});
