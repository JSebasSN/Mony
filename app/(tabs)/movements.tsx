import { useState, useMemo } from 'react';
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
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, Trash2, Pencil, TrendingUp, TrendingDown } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';

export default function MovementsScreen() {
  const router = useRouter();
  const { currentUser, isAdmin } = useAuth();
  const { showAlert } = useCustomAlert();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

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
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Movimientos',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/movement-form')}
              style={styles.addButton}
            >
              <Plus size={24} color="#007AFF" />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.filtersContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por concepto..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />

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
      </View>

      <FlatList
        data={filteredMovements}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay movimientos</Text>
            <Text style={styles.emptySubtext}>Presiona + para agregar uno</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isIncome = item.type === 'income';
          const date = new Date(item.date);
          const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

          return (
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
          );
        }}
      />
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
  },
  addButton: {
    padding: 4,
    marginRight: 4,
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchInput: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    color: '#0f172a',
  },
  typeFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  filterButtonActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#64748b',
  },
  filterButtonTextActive: {
    color: '#2563eb',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#666',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  movementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  movementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  incomeIndicator: {
    backgroundColor: '#D1FAE5',
  },
  expenseIndicator: {
    backgroundColor: '#FEE2E2',
  },
  movementInfo: {
    flex: 1,
  },
  movementConcept: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1C1C1E',
    marginBottom: 4,
  },
  movementMeta: {
    fontSize: 13,
    color: '#8E8E93',
  },
  movementAmount: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginLeft: 12,
  },
  incomeAmount: {
    color: '#10B981',
  },
  expenseAmount: {
    color: '#EF4444',
  },
  movementActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F7',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#dbeafe',
    gap: 6,
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#2563eb',
  },
  deleteButtonText: {
    color: '#dc2626',
  },
});
