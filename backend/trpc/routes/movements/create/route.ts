import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { dataStore } from "@/backend/data/store";

export const createMovementProcedure = publicProcedure
  .input(
    z.object({
      groupId: z.string(),
      userId: z.string(),
      date: z.string(),
      type: z.enum(["income", "expense"]),
      concept: z.string(),
      amount: z.number(),
    })
  )
  .mutation(({ input }) => {
    const movement = dataStore.createMovement(input);
    return { movement };
  });
