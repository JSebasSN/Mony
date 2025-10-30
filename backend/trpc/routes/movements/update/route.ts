import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { dataStore } from "@/backend/data/store";
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
  .mutation(({ input }) => {
    const movement = dataStore.updateMovement(input.id, input.updates);
    
    if (!movement) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Movimiento no encontrado",
      });
    }

    return { movement };
  });
