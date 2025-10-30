import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where
} from 'firebase/firestore';
import { User, Group, Movement } from '@/types';

const USERS_COLLECTION = 'users';
const GROUPS_COLLECTION = 'groups';
const MOVEMENTS_COLLECTION = 'movements';

export class FirebaseStore {
  async getUsers(groupId?: string): Promise<User[]> {
    try {
      const usersRef = collection(db, USERS_COLLECTION);
      let q = query(usersRef);
      
      if (groupId) {
        q = query(usersRef, where('groupId', '==', groupId));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
    } catch (error) {
      console.error('[FirebaseStore] Error getting users:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const usersRef = collection(db, USERS_COLLECTION);
      const q = query(usersRef, where('email', '==', normalizedEmail));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return undefined;
      }
      
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as User;
    } catch (error) {
      console.error('[FirebaseStore] Error getting user by email:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User | undefined> {
    try {
      const userRef = doc(db, USERS_COLLECTION, id);
      const snapshot = await getDoc(userRef);
      
      if (!snapshot.exists()) {
        return undefined;
      }
      
      return {
        id: snapshot.id,
        ...snapshot.data()
      } as User;
    } catch (error) {
      console.error('[FirebaseStore] Error getting user by id:', error);
      throw error;
    }
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    try {
      const usersRef = collection(db, USERS_COLLECTION);
      const docRef = await addDoc(usersRef, user);
      
      return {
        id: docRef.id,
        ...user
      };
    } catch (error) {
      console.error('[FirebaseStore] Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      const userRef = doc(db, USERS_COLLECTION, id);
      const snapshot = await getDoc(userRef);
      
      if (!snapshot.exists()) {
        return null;
      }
      
      await updateDoc(userRef, updates);
      
      const updatedSnapshot = await getDoc(userRef);
      return {
        id: updatedSnapshot.id,
        ...updatedSnapshot.data()
      } as User;
    } catch (error) {
      console.error('[FirebaseStore] Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const userRef = doc(db, USERS_COLLECTION, id);
      const snapshot = await getDoc(userRef);
      
      if (!snapshot.exists()) {
        return false;
      }
      
      await deleteDoc(userRef);
      return true;
    } catch (error) {
      console.error('[FirebaseStore] Error deleting user:', error);
      throw error;
    }
  }

  async getGroupById(id: string): Promise<Group | undefined> {
    try {
      const groupRef = doc(db, GROUPS_COLLECTION, id);
      const snapshot = await getDoc(groupRef);
      
      if (!snapshot.exists()) {
        return undefined;
      }
      
      return {
        id: snapshot.id,
        ...snapshot.data()
      } as Group;
    } catch (error) {
      console.error('[FirebaseStore] Error getting group by id:', error);
      throw error;
    }
  }

  async createGroup(group: Omit<Group, 'id'>): Promise<Group> {
    try {
      const groupsRef = collection(db, GROUPS_COLLECTION);
      const docRef = await addDoc(groupsRef, group);
      
      return {
        id: docRef.id,
        ...group
      };
    } catch (error) {
      console.error('[FirebaseStore] Error creating group:', error);
      throw error;
    }
  }

  async getMovements(groupId: string): Promise<Movement[]> {
    try {
      const movementsRef = collection(db, MOVEMENTS_COLLECTION);
      const q = query(movementsRef, where('groupId', '==', groupId));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Movement));
    } catch (error) {
      console.error('[FirebaseStore] Error getting movements:', error);
      throw error;
    }
  }

  async createMovement(movement: Omit<Movement, 'id' | 'createdAt'>): Promise<Movement> {
    try {
      const movementsRef = collection(db, MOVEMENTS_COLLECTION);
      const movementData = {
        ...movement,
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(movementsRef, movementData);
      
      return {
        id: docRef.id,
        ...movementData
      };
    } catch (error) {
      console.error('[FirebaseStore] Error creating movement:', error);
      throw error;
    }
  }

  async updateMovement(id: string, updates: Partial<Movement>): Promise<Movement | null> {
    try {
      const movementRef = doc(db, MOVEMENTS_COLLECTION, id);
      const snapshot = await getDoc(movementRef);
      
      if (!snapshot.exists()) {
        return null;
      }
      
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(movementRef, updateData);
      
      const updatedSnapshot = await getDoc(movementRef);
      return {
        id: updatedSnapshot.id,
        ...updatedSnapshot.data()
      } as Movement;
    } catch (error) {
      console.error('[FirebaseStore] Error updating movement:', error);
      throw error;
    }
  }

  async deleteMovement(id: string): Promise<boolean> {
    try {
      const movementRef = doc(db, MOVEMENTS_COLLECTION, id);
      const snapshot = await getDoc(movementRef);
      
      if (!snapshot.exists()) {
        return false;
      }
      
      await deleteDoc(movementRef);
      return true;
    } catch (error) {
      console.error('[FirebaseStore] Error deleting movement:', error);
      throw error;
    }
  }
}

export const firebaseStore = new FirebaseStore();
