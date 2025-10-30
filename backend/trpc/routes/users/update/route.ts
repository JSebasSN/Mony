import { publicProcedure } from '@/backend/trpc/create-context';
import { dataStore } from '@/backend/data/store';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { UserWithoutPassword } from '@/types';

export const updateUserProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string().min(1, 'ID de usuario requerido'),
      name: z.string().min(1, 'El nombre es requerido').trim().optional(),
      email: z.string().email('Email inválido').trim().toLowerCase().optional(),
      password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
      role: z.enum(['admin', 'user']).optional(),
    })
  )
  .mutation(async ({ input }): Promise<UserWithoutPassword> => {
    const { userId, ...updates } = input;
    
    console.log('[Backend] Update user request:', userId, updates);

    if (updates.email) {
      const normalizedEmail = updates.email.trim().toLowerCase();
      const existingUser = dataStore.getUserByEmail(normalizedEmail);
      if (existingUser && existingUser.id !== userId) {
        console.log('[Backend] Email already in use:', normalizedEmail);
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Este email ya está en uso',
        });
      }
      updates.email = normalizedEmail;
    }

    if (updates.name) {
      updates.name = updates.name.trim();
    }

    const updatedUser = dataStore.updateUser(userId, updates);

    if (!updatedUser) {
      console.error('[Backend] User not found:', userId);
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Usuario no encontrado',
      });
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    
    console.log('[Backend] User updated successfully:', userWithoutPassword.id);
    
    return userWithoutPassword;
  });
