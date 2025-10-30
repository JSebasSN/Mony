import { publicProcedure } from '@/backend/trpc/create-context';
import { firebaseStore } from '@/backend/data/firebase-store';
import { z } from 'zod';

export const getUsersProcedure = publicProcedure
  .input(z.object({ groupId: z.string() }))
  .query(async ({ input }) => {
    const users = await firebaseStore.getUsers(input.groupId);
    return users.map(({ password, ...user }) => user);
  });
