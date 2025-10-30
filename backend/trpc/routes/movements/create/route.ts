import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { firebaseStore } from "@/backend/data/firebase-store";

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
  .mutation(async ({ input }) => {
    const movement = await firebaseStore.createMovement(input);
    return { movement };
  });
