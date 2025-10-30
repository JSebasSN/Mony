import { User, Group, Movement } from '@/types';

class DataStore {
  private users: User[] = [];
  private groups: Group[] = [];
  private movements: Movement[] = [];

  getUsers(groupId?: string): User[] {
    if (groupId) {
      return this.users.filter(u => u.groupId === groupId);
    }
    return this.users;
  }

  getUserByEmail(email: string): User | undefined {
    const normalizedEmail = email.trim().toLowerCase();
    return this.users.find(u => u.email.toLowerCase() === normalizedEmail);
  }

  getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  createUser(user: Omit<User, 'id'>): User {
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    this.users.push(newUser);
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    
    this.users[index] = { ...this.users[index], ...updates };
    return this.users[index];
  }

  deleteUser(id: string): boolean {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    
    this.users.splice(index, 1);
    return true;
  }

  getGroupById(id: string): Group | undefined {
    return this.groups.find(g => g.id === id);
  }

  createGroup(group: Omit<Group, 'id'>): Group {
    const newGroup: Group = {
      ...group,
      id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    this.groups.push(newGroup);
    return newGroup;
  }

  getMovements(groupId: string): Movement[] {
    return this.movements.filter(m => m.groupId === groupId);
  }

  createMovement(movement: Omit<Movement, 'id' | 'createdAt'>): Movement {
    const newMovement: Movement = {
      ...movement,
      id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    this.movements.push(newMovement);
    return newMovement;
  }

  updateMovement(id: string, updates: Partial<Movement>): Movement | null {
    const index = this.movements.findIndex(m => m.id === id);
    if (index === -1) return null;
    
    this.movements[index] = { 
      ...this.movements[index], 
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.movements[index];
  }

  deleteMovement(id: string): boolean {
    const index = this.movements.findIndex(m => m.id === id);
    if (index === -1) return false;
    
    this.movements.splice(index, 1);
    return true;
  }
}

export const dataStore = new DataStore();
