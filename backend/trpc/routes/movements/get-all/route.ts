import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { firebaseStore } from "@/backend/data/firebase-store";

export const getMovementsProcedure = publicProcedure
  .input(z.object({ groupId: z.string() }))
  .query(async ({ input }) => {
    const movements = await firebaseStore.getMovements(input.groupId);
    return { movements };
  });
