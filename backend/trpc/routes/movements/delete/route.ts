import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { dataStore } from "@/backend/data/store";
import { TRPCError } from "@trpc/server";

export const deleteMovementProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ input }) => {
    const success = dataStore.deleteMovement(input.id);
    
    if (!success) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Movimiento no encontrado",
      });
    }

    return { success: true, message: "Movimiento eliminado correctamente" };
  });
