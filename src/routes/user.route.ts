import { Router } from "express";
import deserializeUser from "../middlewares/deserializeUser";
import userController from "../controllers/user.controller";
import validateResources from "../middlewares/validateResources";
import { UpdatePasswordSchema } from "../schemas/updatePassword.schema";
import { ResetPasswordSchema } from "../schemas/resetPassword.schema";

const router = Router();

router.route("/me").get(deserializeUser, userController.getCurrentUser);

router.route("/users").get(deserializeUser, userController.getAllUsers);

router.route("/user/:id").get(deserializeUser, userController.getsingleUser);

router
  .route("/user/updateprofile")
  .put(deserializeUser, userController.updateProfile);

router
  .route("/user/updatepassword")
  .put(
    deserializeUser,
    validateResources(UpdatePasswordSchema),
    userController.updatePassword
  );

router.route("/user/forgotpassword").post(userController.forgotPassword);

router
  .route("/user/resetpassword/:token")
  .put(validateResources(ResetPasswordSchema), userController.resetPassword);
router
  .route("/user/delete")
  .delete(deserializeUser, userController.deleteCurrentUser);

export default router;
