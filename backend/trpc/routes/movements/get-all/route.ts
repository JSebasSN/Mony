import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { dataStore } from "@/backend/data/store";

export const getMovementsProcedure = publicProcedure
  .input(z.object({ groupId: z.string() }))
  .query(({ input }) => {
    const movements = dataStore.getMovements(input.groupId);
    return { movements };
  });
