import { publicProcedure } from '@/backend/trpc/create-context';
import { dataStore } from '@/backend/data/store';
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
    const existingUser = dataStore.getUserByEmail(input.email);

    if (existingUser) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Este email ya está registrado',
      });
    }

    const newUser = dataStore.createUser(input);
    const { password, ...userWithoutPassword } = newUser;
    
    return userWithoutPassword;
  });
