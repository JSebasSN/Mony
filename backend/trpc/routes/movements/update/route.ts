import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { firebaseStore } from "@/backend/data/firebase-store";
import { TRPCError } from "@trpc/server";

export const updateMovementProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      updates: z.object({
        date: z.string().optional(),
        type: z.enum(["income", "expense"]).optional(),
        concept: z.string().optional(),
        amount: z.number().optional(),
      }),
    })
  )
  .mutation(async ({ input }) => {
    const movement = await firebaseStore.updateMovement(input.id, input.updates);
    
    if (!movement) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Movimiento no encontrado",
      });
    }

    return { movement };
  });
