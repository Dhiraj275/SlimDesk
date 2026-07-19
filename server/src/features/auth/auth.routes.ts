import { Router } from "express";
import * as AuthController from "./auth.controller"
const authRouter = Router();
authRouter.post("/register", AuthController.registerUser);
// authRouter.post("/login", AuthController.);

export default authRouter;  