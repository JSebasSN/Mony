import { publicProcedure } from '@/backend/trpc/create-context';
import { dataStore } from '@/backend/data/store';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

const FIREBASE_API_KEY = 'AIzaSyAsDjxmtOSs0CJS3M01zs92qXXFDvbTDKc';

export const createUserProcedure = publicProcedure
  .input(
    z.object({
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(6),
      role: z.enum(['admin', 'user']),
      groupId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('[Backend] Creating user:', input.email);
    
    const existingUser = dataStore.getUserByEmail(input.email);

    if (existingUser) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Este email ya está registrado',
      });
    }

    try {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: input.email,
            password: input.password,
            displayName: input.name,
            returnSecureToken: true,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[Backend] Firebase error:', errorData);
        
        if (errorData.error?.message === 'EMAIL_EXISTS') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Este email ya está registrado en Firebase',
          });
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: errorData.error?.message || 'Error al crear el usuario en Firebase',
        });
      }

      const firebaseData = await response.json();
      console.log('[Backend] Firebase user created:', firebaseData.localId);

      const newUser = dataStore.createUser({
        name: input.name,
        email: input.email,
        password: input.password,
        role: input.role,
        groupId: input.groupId,
      });
      
      const { password, ...userWithoutPassword } = newUser;
      
      console.log('[Backend] User created successfully in dataStore');
      
      return userWithoutPassword;
    } catch (error: any) {
      console.error('[Backend] Error creating user:', error);
      
      if (error instanceof TRPCError) {
        throw error;
      }
      
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Error al crear el usuario',
      });
    }
  });
