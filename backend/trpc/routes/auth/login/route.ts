import { publicProcedure } from '@/backend/trpc/create-context';
import { firebaseStore } from '@/backend/data/firebase-store';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { AuthResponse } from '@/types';

export const loginProcedure = publicProcedure
  .input(
    z.object({
      email: z.string().email('Email inválido').trim().toLowerCase(),
      password: z.string().min(1, 'La contraseña es requerida'),
    })
  )
  .mutation(async ({ input }): Promise<AuthResponse> => {
    console.log('[Backend] Login attempt for:', input.email);
    
    if (!input.email || !input.password) {
      console.error('[Backend] Missing email or password');
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Email y contraseña son requeridos',
      });
    }
    
    const normalizedEmail = input.email.trim().toLowerCase();
    const user = await firebaseStore.getUserByEmail(normalizedEmail);

    if (!user) {
      console.log('[Backend] User not found:', normalizedEmail);
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Email o contraseña incorrectos',
      });
    }

    if (user.password !== input.password.trim()) {
      console.log('[Backend] Invalid password for:', normalizedEmail);
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Email o contraseña incorrectos',
      });
    }

    const group = await firebaseStore.getGroupById(user.groupId);
    
    if (!group) {
      console.error('[Backend] Group not found for user:', user.groupId);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al cargar los datos de la empresa',
      });
    }

    const { password: _, ...userWithoutPassword } = user;

    console.log('[Backend] Login successful for:', normalizedEmail, 'User ID:', user.id);

    return {
      user: userWithoutPassword,
      group,
    };
  });
