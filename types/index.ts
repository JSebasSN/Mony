export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  groupId: string;
}

export interface UserWithoutPassword {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  groupId: string;
}

export interface Group {
  id: string;
  name: string;
  createdAt: string;
}

export type MovementType = 'income' | 'expense';

export interface Movement {
  id: string;
  groupId: string;
  userId: string;
  date: string;
  type: MovementType;
  concept: string;
  amount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface MonthlyBalance {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  byUser: {
    userId: string;
    userName: string;
    income: number;
    expenses: number;
    balance: number;
  }[];
}

export interface AuthResponse {
  user: UserWithoutPassword;
  group: Group;
}
