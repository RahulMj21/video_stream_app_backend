import { Router } from "express";
import authController from "../controllers/auth.controller";
import deserializeUser from "../middlewares/deserializeUser";
import validateResources from "../middlewares/validateResources";
import { LoginSchema } from "../schemas/login.schema";
import { RegisterSchema } from "../schemas/register.schema";
const router = Router();

// post routes 👇👇👇👇👇
router
  .route("/register")
  .post(validateResources(RegisterSchema), authController.register);

router
  .route("/login")
  .post(validateResources(LoginSchema), authController.login);

// get routes 👇👇👇👇👇
router.route("/callback/google").get(authController.googleAuth);

router.route("/logout").get(deserializeUser, authController.logout);

export default router;
