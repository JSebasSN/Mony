import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { firebaseStore } from "@/backend/data/firebase-store";
import { TRPCError } from "@trpc/server";

export const deleteMovementProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    const success = await firebaseStore.deleteMovement(input.id);
    
    if (!success) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Movimiento no encontrado",
      });
    }

    return { success: true, message: "Movimiento eliminado correctamente" };
  });
