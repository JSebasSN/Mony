import { publicProcedure } from '@/backend/trpc/create-context';
import { firebaseStore } from '@/backend/data/firebase-store';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

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
    
    const normalizedEmail = input.email.trim().toLowerCase();
    const existingUser = await firebaseStore.getUserByEmail(normalizedEmail);

    if (existingUser) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Este email ya está registrado',
      });
    }

    try {
      const newUser = await firebaseStore.createUser({
        name: input.name.trim(),
        email: normalizedEmail,
        password: input.password,
        role: input.role,
        groupId: input.groupId,
      });
      
      const { password, ...userWithoutPassword } = newUser;
      
      console.log('[Backend] User created successfully:', newUser.id);
      
      return userWithoutPassword;
    } catch (error: any) {
      console.error('[Backend] Error creating user:', error);
      
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Error al crear el usuario',
      });
    }
  });
