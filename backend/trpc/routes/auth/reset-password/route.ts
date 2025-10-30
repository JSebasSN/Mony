import { publicProcedure } from '@/backend/trpc/create-context';
import { firebaseStore } from '@/backend/data/firebase-store';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const resetPasswordProcedure = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      adminEmail: z.string().email(),
      adminPassword: z.string().min(1),
      newPassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    })
  )
  .mutation(async ({ input }) => {
    const admin = await firebaseStore.getUserByEmail(input.adminEmail);

    if (!admin) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Credenciales de administrador incorrectas',
      });
    }

    if (admin.password !== input.adminPassword) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Credenciales de administrador incorrectas',
      });
    }

    if (admin.role !== 'admin') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Solo los administradores pueden restablecer contraseñas',
      });
    }

    const user = await firebaseStore.getUserByEmail(input.email);

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Usuario no encontrado',
      });
    }

    if (user.groupId !== admin.groupId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Solo puedes restablecer contraseñas de usuarios de tu grupo',
      });
    }

    const updatedUser = await firebaseStore.updateUser(user.id, {
      password: input.newPassword,
    });

    if (!updatedUser) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al actualizar la contraseña',
      });
    }

    return { success: true, message: 'Contraseña actualizada correctamente' };
  });
