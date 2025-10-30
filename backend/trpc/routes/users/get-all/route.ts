import { publicProcedure } from '@/backend/trpc/create-context';
import { dataStore } from '@/backend/data/store';
import { z } from 'zod';

export const getUsersProcedure = publicProcedure
  .input(z.object({ groupId: z.string() }))
  .query(async ({ input }) => {
    const users = dataStore.getUsers(input.groupId);
    return users.map(({ password, ...user }) => user);
  });
