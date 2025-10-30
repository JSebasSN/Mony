import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomAlert } from '@/components/CustomAlert';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { MovementType } from '@/types';
import { trpc } from '@/lib/trpc';

export default function MovementFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { currentUser } = useAuth();
  const { showAlert } = useCustomAlert();

  const movementsQuery = trpc.movements.getAll.useQuery(
    { groupId: currentUser?.groupId || '' },
    { enabled: !!currentUser?.groupId && !!id }
  );

  const existingMovement = id
    ? movementsQuery.data?.movements.find((m) => m.id === id)
    : null;

  const [type, setType] = useState<MovementType>('expense');
  const [concept, setConcept] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (existingMovement) {
      setType(existingMovement.type);
      setConcept(existingMovement.concept);
      setAmount(existingMovement.amount.toString());
      setDate(existingMovement.date);
    }
  }, [existingMovement]);

  const createMovementMutation = trpc.movements.create.useMutation({
    onSuccess: () => {
      showAlert('Éxito', 'Movimiento creado correctamente', undefined, 'success');
      router.back();
    },
    onError: (error) => {
      showAlert('Error', error.message || 'Error al crear movimiento', undefined, 'error');
    },
  });

  const updateMovementMutation = trpc.movements.update.useMutation({
    onSuccess: () => {
      showAlert('Éxito', 'Movimiento actualizado correctamente', undefined, 'success');
      router.back();
    },
    onError: (error) => {
      showAlert('Error', error.message || 'Error al actualizar movimiento', undefined, 'error');
    },
  });

  const handleSubmit = () => {
    if (!concept.trim()) {
      showAlert('Error', 'El concepto es requerido', undefined, 'error');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showAlert('Error', 'El monto debe ser un número positivo', undefined, 'error');
      return;
    }

    if (!currentUser) {
      showAlert('Error', 'Usuario no encontrado', undefined, 'error');
      return;
    }

    if (existingMovement) {
      updateMovementMutation.mutate({
        id: existingMovement.id,
        updates: {
          type,
          concept: concept.trim(),
          amount: numAmount,
          date,
        },
      });
    } else {
      createMovementMutation.mutate({
        groupId: currentUser.groupId,
        userId: currentUser.id,
        type,
        concept: concept.trim(),
        amount: numAmount,
        date,
      });
    }
  };

  const isLoading = createMovementMutation.isPending || updateMovementMutation.isPending;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: existingMovement ? 'Editar Movimiento' : 'Nuevo Movimiento',
          presentation: 'modal',
        }}
      />

      <ScrollView contentContainerStyle={styles.form}>
        <View style={styles.section}>
          <Text style={styles.label}>Tipo</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
              onPress={() => setType('income')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  type === 'income' && styles.typeButtonTextActiveIncome,
                ]}
              >
                Ingreso
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
              onPress={() => setType('expense')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  type === 'expense' && styles.typeButtonTextActiveExpense,
                ]}
              >
                Gasto
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Concepto</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Pago de servicio"
            value={concept}
            onChangeText={setConcept}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Monto</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Fecha</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={setDate}
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {existingMovement ? 'Actualizar' : 'Crear'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  form: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1C1C1E',
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  typeButtonActive: {
    borderColor: '#007AFF',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#666',
  },
  typeButtonTextActiveIncome: {
    color: '#10B981',
  },
  typeButtonTextActiveExpense: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
