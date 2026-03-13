import { Router } from "express";
import {
  getMeHandler,
  recordActivityHandler,
  syncClerkUserHandler,
  updateZodiacHandler,
} from "./user.controller";
import { requireUser } from "../../middlewares/userAuth";

export const userRouter = Router();

userRouter.post("/sync-clerk-user", syncClerkUserHandler);
userRouter.get("/me", requireUser, getMeHandler);
userRouter.patch("/zodiac", requireUser, updateZodiacHandler);
userRouter.post("/activity", requireUser, recordActivityHandler);

