import { useState, useMemo, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomAlert } from '@/components/CustomAlert';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, Trash2, Pencil, TrendingUp, TrendingDown, Search } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function MovementsScreen() {
  const router = useRouter();
  const { currentUser, isAdmin } = useAuth();
  const { showAlert } = useCustomAlert();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const movementsQuery = trpc.movements.getAll.useQuery(
    { groupId: currentUser?.groupId || '' },
    { enabled: !!currentUser?.groupId }
  );

  const usersQuery = trpc.users.getAll.useQuery(
    { groupId: currentUser?.groupId || '' },
    { enabled: !!currentUser?.groupId }
  );

  const deleteMovementMutation = trpc.movements.delete.useMutation({
    onSuccess: () => {
      movementsQuery.refetch();
      showAlert('Éxito', 'Movimiento eliminado correctamente', undefined, 'success');
    },
    onError: (error) => {
      showAlert('Error', error.message || 'Error al eliminar movimiento', undefined, 'error');
    },
  });

  const filteredMovements = useMemo(() => {
    const movements = movementsQuery.data?.movements || [];
    let filtered = movements;

    if (typeFilter !== 'all') {
      filtered = filtered.filter((m) => m.type === typeFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((m) => m.concept.toLowerCase().includes(query));
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [movementsQuery.data?.movements, typeFilter, searchQuery]);

  const handleDelete = (movementId: string) => {
    showAlert(
      'Confirmar',
      '¿Estás seguro de que quieres eliminar este movimiento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: () => deleteMovementMutation.mutate({ id: movementId }),
          style: 'destructive',
        },
      ],
      'warning'
    );
  };

  const getUserName = (userId: string) => {
    const users = usersQuery.data || [];
    return users.find((u: { id: string; name: string }) => u.id === userId)?.name || 'Unknown';
  };

  if (movementsQuery.isLoading || usersQuery.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={['#ffffff', '#f8fafc']} style={styles.loadingGradient}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Cargando movimientos...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Movimientos',
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTitleStyle: {
            fontWeight: '700' as const,
            fontSize: 20,
          },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/movement-form')}
              style={styles.addButton}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#2563eb', '#1d4ed8']}
                style={styles.addButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Plus size={22} color="#ffffff" strokeWidth={2.5} />
              </LinearGradient>
            </TouchableOpacity>
          ),
        }}
      />

      <Animated.View style={[styles.filtersContainer, { opacity: fadeAnim }]}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#64748b" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar movimientos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.typeFilters}>
          <TouchableOpacity
            style={[styles.filterButton, typeFilter === 'all' && styles.filterButtonActive]}
            onPress={() => setTypeFilter('all')}
          >
            <Text
              style={[styles.filterButtonText, typeFilter === 'all' && styles.filterButtonTextActive]}
            >
              Todos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, typeFilter === 'income' && styles.filterButtonActive]}
            onPress={() => setTypeFilter('income')}
          >
            <Text
              style={[
                styles.filterButtonText,
                typeFilter === 'income' && styles.filterButtonTextActive,
              ]}
            >
              Ingresos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, typeFilter === 'expense' && styles.filterButtonActive]}
            onPress={() => setTypeFilter('expense')}
          >
            <Text
              style={[
                styles.filterButtonText,
                typeFilter === 'expense' && styles.filterButtonTextActive,
              ]}
            >
              Gastos
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          data={filteredMovements}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <TrendingUp size={48} color="#cbd5e1" strokeWidth={2} />
              </View>
              <Text style={styles.emptyText}>No hay movimientos</Text>
              <Text style={styles.emptySubtext}>Presiona + para agregar tu primer movimiento</Text>
            </View>
          }
          renderItem={({ item }) => {
          const isIncome = item.type === 'income';
          const date = new Date(item.date);
          const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

          return (
            <TouchableOpacity
              activeOpacity={0.95}
              onPress={() => router.push(`/movement-form?id=${item.id}`)}
            >
              <View style={styles.movementCard}>
              <View style={styles.movementHeader}>
                <View style={[styles.typeIndicator, isIncome ? styles.incomeIndicator : styles.expenseIndicator]}>
                  {isIncome ? (
                    <TrendingUp size={16} color="#10B981" />
                  ) : (
                    <TrendingDown size={16} color="#EF4444" />
                  )}
                </View>
                <View style={styles.movementInfo}>
                  <Text style={styles.movementConcept}>{item.concept}</Text>
                  <Text style={styles.movementMeta}>
                    {getUserName(item.userId)} • {formattedDate}
                  </Text>
                </View>
                <Text style={[styles.movementAmount, isIncome ? styles.incomeAmount : styles.expenseAmount]}>
                  {isIncome ? '+' : '-'}${item.amount.toLocaleString()}
                </Text>
              </View>

              <View style={styles.movementActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push(`/movement-form?id=${item.id}`)}
                >
                  <Pencil size={16} color="#007AFF" />
                  <Text style={styles.actionButtonText}>Editar</Text>
                </TouchableOpacity>

                {isAdmin && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(item.id)}
                  >
                    <Trash2 size={16} color="#EF4444" />
                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Eliminar</Text>
                  </TouchableOpacity>
                )}
              </View>
              </View>
            </TouchableOpacity>
          );
        }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
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
  addButton: {
    marginRight: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: Platform.OS === 'web' ? Math.min(width * 0.05, 24) : 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0f172a',
  },
  typeFilters: {
    flexDirection: 'row',
    gap: 10,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#64748b',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  listContainer: {
    padding: Platform.OS === 'web' ? Math.min(width * 0.05, 24) : 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#334155',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
  },
  movementCard: {
    backgroundColor: '#ffffff',
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
  movementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeIndicator: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  incomeIndicator: {
    backgroundColor: '#d1fae5',
  },
  expenseIndicator: {
    backgroundColor: '#fee2e2',
  },
  movementInfo: {
    flex: 1,
  },
  movementConcept: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#0f172a',
    marginBottom: 5,
    letterSpacing: -0.3,
  },
  movementMeta: {
    fontSize: 14,
    color: '#64748b',
  },
  movementAmount: {
    fontSize: 20,
    fontWeight: '800' as const,
    marginLeft: 12,
    letterSpacing: -0.5,
  },
  incomeAmount: {
    color: '#10B981',
  },
  expenseAmount: {
    color: '#EF4444',
  },
  movementActions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 16,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#dbeafe',
    gap: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#2563eb',
  },
  deleteButtonText: {
    color: '#dc2626',
  },
});
