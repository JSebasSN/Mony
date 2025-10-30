import { useAuth } from '@/contexts/AuthContext';
import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { TrendingUp, TrendingDown, Wallet, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';

const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export default function BalanceScreen() {
  const { isAdmin, currentUser } = useAuth();
  const now = new Date();
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth() + 1);

  const movementsQuery = trpc.movements.getAll.useQuery(
    { groupId: currentUser?.groupId || '' },
    { enabled: !!currentUser?.groupId }
  );

  const usersQuery = trpc.users.getAll.useQuery(
    { groupId: currentUser?.groupId || '' },
    { enabled: !!currentUser?.groupId }
  );

  const balance = useMemo(() => {
    const movements = movementsQuery.data?.movements || [];
    const users = usersQuery.data || [];

    const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const monthEnd = `${year}-${String(month).padStart(2, '0')}-31`;

    const monthMovements = movements.filter(
      (m) => m.date >= monthStart && m.date <= monthEnd
    );

    const totalIncome = monthMovements
      .filter((m) => m.type === 'income')
      .reduce((sum, m) => sum + m.amount, 0);

    const totalExpenses = monthMovements
      .filter((m) => m.type === 'expense')
      .reduce((sum, m) => sum + m.amount, 0);

    const byUser = users.map((user) => {
      const userMovements = monthMovements.filter((m) => m.userId === user.id);
      const income = userMovements
        .filter((m) => m.type === 'income')
        .reduce((sum, m) => sum + m.amount, 0);
      const expenses = userMovements
        .filter((m) => m.type === 'expense')
        .reduce((sum, m) => sum + m.amount, 0);

      return {
        userId: user.id,
        userName: user.name,
        income,
        expenses,
        balance: income - expenses,
      };
    });

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      byUser,
    };
  }, [movementsQuery.data?.movements, usersQuery.data, year, month]);

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Balance' }} />
        <View style={styles.noAccessContainer}>
          <Text style={styles.noAccessText}>Acceso restringido</Text>
          <Text style={styles.noAccessSubtext}>Solo administradores pueden ver el balance</Text>
        </View>
      </View>
    );
  }

  if (movementsQuery.isLoading || usersQuery.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'Balance Mensual' }} />
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Balance Mensual' }} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.monthButton}>
            <ChevronLeft size={24} color="#007AFF" />
          </TouchableOpacity>

          <View style={styles.monthContainer}>
            <Text style={styles.monthText}>{MONTHS[month - 1]}</Text>
            <Text style={styles.yearText}>{year}</Text>
          </View>

          <TouchableOpacity onPress={handleNextMonth} style={styles.monthButton}>
            <ChevronRight size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={[styles.iconCircle, styles.incomeCircle]}>
                <TrendingUp size={20} color="#10B981" />
              </View>
              <Text style={styles.summaryLabel}>Ingresos</Text>
              <Text style={[styles.summaryValue, styles.incomeValue]}>
                ${balance.totalIncome.toLocaleString()}
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <View style={[styles.iconCircle, styles.expenseCircle]}>
                <TrendingDown size={20} color="#EF4444" />
              </View>
              <Text style={styles.summaryLabel}>Gastos</Text>
              <Text style={[styles.summaryValue, styles.expenseValue]}>
                ${balance.totalExpenses.toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={styles.balanceContainer}>
            <View style={[styles.iconCircle, styles.balanceCircle]}>
              <Wallet size={20} color="#007AFF" />
            </View>
            <Text style={styles.balanceLabel}>Balance Neto</Text>
            <Text
              style={[
                styles.balanceValue,
                balance.balance >= 0 ? styles.positiveBalance : styles.negativeBalance,
              ]}
            >
              ${balance.balance.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Por Usuario</Text>
          {balance.byUser.map((userBalance) => (
            <View key={userBalance.userId} style={styles.userCard}>
              <Text style={styles.userName}>{userBalance.userName}</Text>

              <View style={styles.userStats}>
                <View style={styles.userStat}>
                  <Text style={styles.userStatLabel}>Ingresos</Text>
                  <Text style={[styles.userStatValue, styles.incomeValue]}>
                    ${userBalance.income.toLocaleString()}
                  </Text>
                </View>

                <View style={styles.userStat}>
                  <Text style={styles.userStatLabel}>Gastos</Text>
                  <Text style={[styles.userStatValue, styles.expenseValue]}>
                    ${userBalance.expenses.toLocaleString()}
                  </Text>
                </View>

                <View style={styles.userStat}>
                  <Text style={styles.userStatLabel}>Balance</Text>
                  <Text
                    style={[
                      styles.userStatValue,
                      userBalance.balance >= 0 ? styles.positiveBalance : styles.negativeBalance,
                    ]}
                  >
                    ${userBalance.balance.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
  },
  noAccessContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noAccessText: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#1C1C1E',
    marginBottom: 8,
  },
  noAccessSubtext: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  monthButton: {
    padding: 8,
  },
  monthContainer: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1C1C1E',
  },
  yearText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  incomeCircle: {
    backgroundColor: '#D1FAE5',
  },
  expenseCircle: {
    backgroundColor: '#FEE2E2',
  },
  balanceCircle: {
    backgroundColor: '#DBEAFE',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700' as const,
  },
  incomeValue: {
    color: '#10B981',
  },
  expenseValue: {
    color: '#EF4444',
  },
  balanceContainer: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F7',
  },
  balanceLabel: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: '700' as const,
  },
  positiveBalance: {
    color: '#10B981',
  },
  negativeBalance: {
    color: '#EF4444',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    marginBottom: 12,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1C1C1E',
    marginBottom: 12,
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userStat: {
    flex: 1,
  },
  userStatLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
  },
  userStatValue: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
