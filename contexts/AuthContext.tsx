import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { UserWithoutPassword } from '@/types';

interface AuthContextValue {
  currentUser: UserWithoutPassword | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string, companyName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateCurrentUser: (updates: Partial<UserWithoutPassword>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [currentUser, setCurrentUser] = useState<UserWithoutPassword | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log('[Auth] Setting up Firebase auth listener');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('[Auth] Auth state changed:', user ? user.email : 'no user');
      
      if (user) {
        setFirebaseUser(user);
        
        const userData: UserWithoutPassword = {
          id: user.uid,
          email: user.email || '',
          name: user.displayName || 'Usuario',
          role: 'admin',
          groupId: user.uid,
        };
        
        setCurrentUser(userData);
      } else {
        setFirebaseUser(null);
        setCurrentUser(null);
      }
      
      setIsLoading(false);
    });

    return () => {
      console.log('[Auth] Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  const loginWithEmail = async (email: string, password: string): Promise<void> => {
    console.log('[Auth] Login with email:', email);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('[Auth] Login successful:', userCredential.user.email);
    } catch (error: any) {
      console.error('[Auth] Login error:', error);
      
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        errorMessage = 'Email o contraseña incorrectos';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos fallidos. Intenta más tarde';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Error de conexión. Verifica tu internet';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      }
      
      throw new Error(errorMessage);
    }
  };

  const registerWithEmail = async (
    email: string, 
    password: string, 
    name: string,
    companyName: string
  ): Promise<void> => {
    console.log('[Auth] Register with email:', email);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('[Auth] Registration successful:', userCredential.user.email);
      
      await updateProfile(userCredential.user, {
        displayName: name
      });
      
      console.log('[Auth] Profile updated with name:', name);
    } catch (error: any) {
      console.error('[Auth] Registration error:', error);
      
      let errorMessage = 'Error al registrarse';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email ya está registrado';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña es muy débil. Debe tener al menos 6 caracteres';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Error de conexión. Verifica tu internet';
      }
      
      throw new Error(errorMessage);
    }
  };

  const logout = async (): Promise<void> => {
    console.log('[Auth] Logout initiated');
    
    try {
      await signOut(auth);
      console.log('[Auth] Logout successful');
    } catch (error) {
      console.error('[Auth] Logout error:', error);
      throw new Error('Error al cerrar sesión');
    }
  };

  const updateCurrentUser = async (updates: Partial<UserWithoutPassword>): Promise<void> => {
    if (!currentUser || !firebaseUser) {
      console.warn('[Auth] Cannot update user: no user logged in');
      return;
    }
    
    try {
      console.log('[Auth] Updating user:', updates);
      
      if (updates.name && updates.name !== currentUser.name) {
        await updateProfile(firebaseUser, {
          displayName: updates.name
        });
      }
      
      const updatedUser: UserWithoutPassword = { 
        ...currentUser, 
        ...updates 
      };
      
      setCurrentUser(updatedUser);
      
      console.log('[Auth] User updated successfully');
    } catch (error) {
      console.error('[Auth] Error updating user:', error);
      throw new Error('Error al actualizar el usuario');
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    console.log('[Auth] Reset password for:', email);
    
    try {
      const actionCodeSettings = {
        url: 'https://controlingresos-45ec9.firebaseapp.com/',
        handleCodeInApp: false,
      };
      
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      console.log('[Auth] Password reset email sent successfully');
    } catch (error: any) {
      console.error('[Auth] Reset password error:', error);
      console.error('[Auth] Error code:', error.code);
      console.error('[Auth] Error message:', error.message);
      
      let errorMessage = 'Error al enviar el email';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No existe una cuenta con este email';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Error de conexión. Verifica tu internet';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiadas solicitudes. Intenta de nuevo más tarde';
      } else if (error.code === 'auth/missing-continue-uri') {
        errorMessage = 'Error de configuración. Contacta al soporte';
      }
      
      throw new Error(errorMessage);
    }
  };

  const value: AuthContextValue = {
    currentUser,
    firebaseUser,
    isLoading,
    isAuthenticated: currentUser !== null,
    isAdmin: currentUser?.role === 'admin',
    loginWithEmail,
    registerWithEmail,
    logout,
    updateCurrentUser,
    resetPassword,
  };

  return value;
});
