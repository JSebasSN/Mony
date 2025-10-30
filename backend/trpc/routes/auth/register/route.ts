import { publicProcedure } from '@/backend/trpc/create-context';
import { dataStore } from '@/backend/data/store';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { AuthResponse } from '@/types';

export const registerAdminProcedure = publicProcedure
  .input(
    z.object({
      name: z.string().min(1, 'El nombre es requerido').trim(),
      email: z.string().email('Email inválido').trim().toLowerCase(),
      password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
      companyName: z.string().min(1, 'El nombre de la empresa es requerido').trim(),
    })
  )
  .mutation(async ({ input }): Promise<AuthResponse> => {
    console.log('[Backend] Register attempt for:', input.email);
    console.log('[Backend] Company name:', input.companyName);
    
    const normalizedEmail = input.email.trim().toLowerCase();
    
    if (!normalizedEmail || !input.name || !input.companyName || !input.password) {
      console.error('[Backend] Missing required fields');
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Todos los campos son requeridos',
      });
    }
    
    const existingUser = dataStore.getUserByEmail(normalizedEmail);

    if (existingUser) {
      console.log('[Backend] Email already exists:', normalizedEmail);
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Este correo electrónico ya está registrado',
      });
    }

    try {
      const newGroup = dataStore.createGroup({
        name: input.companyName.trim(),
        createdAt: new Date().toISOString(),
      });
      
      console.log('[Backend] Group created:', newGroup.id, newGroup.name);

      const newUser = dataStore.createUser({
        name: input.name.trim(),
        email: normalizedEmail,
        password: input.password,
        role: 'admin',
        groupId: newGroup.id,
      });
      
      console.log('[Backend] Admin user created:', newUser.id, newUser.email);

      const { password: _, ...userWithoutPassword } = newUser;

      console.log('[Backend] Registration successful for:', normalizedEmail);

      return {
        user: userWithoutPassword,
        group: newGroup,
      };
    } catch (error) {
      console.error('[Backend] Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Error al registrar la empresa: ${errorMessage}`,
      });
    }
  });
