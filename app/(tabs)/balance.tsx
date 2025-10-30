import { useAuth } from '@/contexts/AuthContext';
import { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { TrendingUp, TrendingDown, Wallet, ChevronLeft, ChevronRight, Calendar } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

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
        <LinearGradient colors={['#ffffff', '#f8fafc']} style={styles.noAccessGradient}>
          <View style={styles.noAccessIconContainer}>
            <Wallet size={56} color="#cbd5e1" strokeWidth={2} />
          </View>
          <Text style={styles.noAccessText}>Acceso Restringido</Text>
          <Text style={styles.noAccessSubtext}>Solo administradores pueden ver el balance</Text>
        </LinearGradient>
      </View>
    );
  }

  if (movementsQuery.isLoading || usersQuery.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ 
          title: 'Balance Mensual',
          headerStyle: { backgroundColor: '#ffffff' },
          headerTitleStyle: { fontWeight: '700' as const, fontSize: 20 },
        }} />
        <LinearGradient colors={['#ffffff', '#f8fafc']} style={styles.loadingGradient}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Cargando balance...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Balance Mensual',
        headerStyle: { backgroundColor: '#ffffff' },
        headerTitleStyle: { fontWeight: '700' as const, fontSize: 20 },
      }} />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.monthSelector}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.monthButton} activeOpacity={0.7}>
              <ChevronLeft size={24} color="#2563eb" strokeWidth={2.5} />
            </TouchableOpacity>

            <View style={styles.monthContainer}>
              <View style={styles.calendarIconContainer}>
                <Calendar size={20} color="#2563eb" />
              </View>
              <Text style={styles.monthText}>{MONTHS[month - 1]}</Text>
              <Text style={styles.yearText}>{year}</Text>
            </View>

            <TouchableOpacity onPress={handleNextMonth} style={styles.monthButton} activeOpacity={0.7}>
              <ChevronRight size={24} color="#2563eb" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <LinearGradient
            colors={['#2563eb', '#1d4ed8']}
            style={styles.summaryCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={[styles.iconCircle, styles.whiteCircle]}>
                <TrendingUp size={20} color="#10B981" />
              </View>
              <Text style={styles.summaryLabel}>Ingresos</Text>
              <Text style={[styles.summaryValue, styles.whiteText]}>
                ${balance.totalIncome.toLocaleString()}
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <View style={[styles.iconCircle, styles.whiteCircle]}>
                <TrendingDown size={20} color="#EF4444" />
              </View>
              <Text style={styles.summaryLabel}>Gastos</Text>
              <Text style={[styles.summaryValue, styles.whiteText]}>
                ${balance.totalExpenses.toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={styles.balanceContainer}>
            <View style={[styles.iconCircle, styles.whiteCircle]}>
              <Wallet size={20} color="#007AFF" />
            </View>
            <Text style={styles.balanceLabel}>Balance Neto</Text>
            <Text style={[styles.balanceValue, styles.whiteText]}>
              ${balance.balance.toLocaleString()}
            </Text>
          </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
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
  noAccessGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  noAccessIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  noAccessText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#0f172a',
    marginBottom: 12,
  },
  noAccessSubtext: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 300,
  },
  scrollContent: {
    padding: Platform.OS === 'web' ? Math.min(width * 0.05, 24) : 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  monthButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  monthContainer: {
    alignItems: 'center',
    flex: 1,
  },
  calendarIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  monthText: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: '#0f172a',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  yearText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500' as const,
  },
  summaryCard: {
    borderRadius: 24,
    padding: 28,
    marginBottom: 28,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
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
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 20,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  whiteCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  summaryLabel: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 6,
    fontWeight: '500' as const,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  whiteText: {
    color: '#ffffff',
  },
  incomeValue: {
    color: '#10B981',
  },
  expenseValue: {
    color: '#EF4444',
  },
  balanceContainer: {
    alignItems: 'center',
    paddingTop: 24,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  balanceLabel: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    fontWeight: '500' as const,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: '800' as const,
    letterSpacing: -1,
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
    fontSize: 22,
    fontWeight: '800' as const,
    color: '#0f172a',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  userCard: {
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
  userName: {
    fontSize: 19,
    fontWeight: '700' as const,
    color: '#0f172a',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userStat: {
    flex: 1,
  },
  userStatLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 5,
    fontWeight: '500' as const,
  },
  userStatValue: {
    fontSize: 17,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
});
