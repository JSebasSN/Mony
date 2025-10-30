import { createTRPCRouter } from "./create-context";
import { loginProcedure } from "./routes/auth/login/route";
import { registerAdminProcedure } from "./routes/auth/register/route";
import { resetPasswordProcedure } from "./routes/auth/reset-password/route";
import { getUsersProcedure } from "./routes/users/get-all/route";
import { createUserProcedure } from "./routes/users/create/route";
import { updateUserProcedure } from "./routes/users/update/route";
import { deleteUserProcedure } from "./routes/users/delete/route";
import { getMovementsProcedure } from "./routes/movements/get-all/route";
import { createMovementProcedure } from "./routes/movements/create/route";
import { updateMovementProcedure } from "./routes/movements/update/route";
import { deleteMovementProcedure } from "./routes/movements/delete/route";

export const appRouter = createTRPCRouter({
  auth: createTRPCRouter({
    login: loginProcedure,
    register: registerAdminProcedure,
    resetPassword: resetPasswordProcedure,
  }),
  users: createTRPCRouter({
    getAll: getUsersProcedure,
    create: createUserProcedure,
    update: updateUserProcedure,
    delete: deleteUserProcedure,
  }),
  movements: createTRPCRouter({
    getAll: getMovementsProcedure,
    create: createMovementProcedure,
    update: updateMovementProcedure,
    delete: deleteMovementProcedure,
  }),
});

export type AppRouter = typeof appRouter;
