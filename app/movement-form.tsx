import { useState, useEffect, useRef } from 'react';
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
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { MovementType } from '@/types';
import { trpc } from '@/lib/trpc';
import { LinearGradient } from 'expo-linear-gradient';
import { DollarSign, FileText, Calendar, TrendingUp, TrendingDown } from 'lucide-react-native';

const { width } = Dimensions.get('window');

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
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (existingMovement) {
      setType(existingMovement.type);
      setConcept(existingMovement.concept);
      setAmount(existingMovement.amount.toString());
      setDate(existingMovement.date);
    }
  }, [existingMovement]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

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
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTitleStyle: {
            fontWeight: '700' as const,
            fontSize: 18,
          },
        }}
      />

      <ScrollView 
        contentContainerStyle={styles.form}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.section}>
          <Text style={styles.label}>Tipo de Movimiento</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeButton, type === 'income' && styles.typeButtonActiveIncome]}
              onPress={() => setType('income')}
              activeOpacity={0.8}
            >
              <View style={[styles.typeIconContainer, type === 'income' && styles.typeIconActiveIncome]}>
                <TrendingUp size={22} color={type === 'income' ? '#ffffff' : '#10b981'} strokeWidth={2.5} />
              </View>
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
              style={[styles.typeButton, type === 'expense' && styles.typeButtonActiveExpense]}
              onPress={() => setType('expense')}
              activeOpacity={0.8}
            >
              <View style={[styles.typeIconContainer, type === 'expense' && styles.typeIconActiveExpense]}>
                <TrendingDown size={22} color={type === 'expense' ? '#ffffff' : '#ef4444'} strokeWidth={2.5} />
              </View>
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
          <View style={styles.inputContainer}>
            <FileText size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ej: Pago de servicio"
              value={concept}
              onChangeText={setConcept}
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Monto</Text>
          <View style={styles.inputContainer}>
            <DollarSign size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Fecha</Text>
          <View style={styles.inputContainer}>
            <Calendar size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={date}
              onChangeText={setDate}
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#2563eb', '#1d4ed8']}
            style={styles.submitButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {existingMovement ? 'Actualizar Movimiento' : 'Crear Movimiento'}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  form: {
    padding: Platform.OS === 'web' ? Math.min(width * 0.05, 24) : 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 26,
  },
  label: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#0f172a',
    marginBottom: 10,
    marginLeft: 4,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 14,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  typeButtonActiveIncome: {
    borderColor: '#10b981',
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOpacity: 0.25,
    elevation: 4,
  },
  typeButtonActiveExpense: {
    borderColor: '#ef4444',
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOpacity: 0.25,
    elevation: 4,
  },
  typeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#f1f5f9',
  },
  typeIconActiveIncome: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  typeIconActiveExpense: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#64748b',
  },
  typeButtonTextActiveIncome: {
    color: '#ffffff',
  },
  typeButtonTextActiveExpense: {
    color: '#ffffff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
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
    paddingVertical: 16,
    fontSize: 16,
    color: '#0f172a',
  },
  submitButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 16,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#ffffff',
  },
});
