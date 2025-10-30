import { publicProcedure } from '@/backend/trpc/create-context';
import { firebaseStore } from '@/backend/data/firebase-store';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const deleteUserProcedure = publicProcedure
  .input(z.object({ userId: z.string() }))
  .mutation(async ({ input }) => {
    const success = await firebaseStore.deleteUser(input.userId);

    if (!success) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Usuario no encontrado',
      });
    }

    return { success: true };
  });
