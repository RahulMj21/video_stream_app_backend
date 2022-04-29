import { NextFunction, Response, Request } from "express";
import { get } from "lodash";
import sessionService from "../services/session.service";
import userService from "../services/user.service";
import BigPromise from "../utils/BigPromise";
import CustomErrorHandler from "../utils/CustomErrorHandler";
import omit from "../utils/omit";
import { UpdatePasswordInput } from "../schemas/updatePassword.schema";

class UserController {
  getCurrentUser = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {
      const decodedUser = get(res, "locals.user");
      const user = await userService.findUser({ _id: get(decodedUser, "_id") });
      if (!user) return next(CustomErrorHandler.notFound("user not found"));

      return res.status(200).json({
        success: true,
        user: omit(user.toJSON(), ["__v", "password"]),
      });
    }
  );

  getAllUsers = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {
      const users = await userService.findAllUsers();
      if (!users) return next(CustomErrorHandler.notFound("users not found"));

      res.status(200).json({
        success: true,
        users,
      });
    }
  );

  getsingleUser = BigPromise(
    async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
      const _id = get(req, "params.id");
      const user = await userService.findUser({ _id });
      if (!user) return next(CustomErrorHandler.notFound("user not found"));

      return res.status(200).json({
        success: true,
        user: omit(user.toJSON(), ["__v", "password", "typegooseName"]),
      });
    }
  );

  updateProfile = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {}
  );

  updatePassword = BigPromise(
    async (
      req: Request<{}, {}, UpdatePasswordInput["body"]>,
      res: Response,
      next: NextFunction
    ) => {
      const { currentPassword, newPassword } = req.body;
      if (currentPassword === newPassword)
        return next(CustomErrorHandler.badRequest("nothing to update"));

      const user = await userService.findUser({
        _id: get(res, "locals.user._id"),
      });
      if (!user) return next(CustomErrorHandler.unauthorized());

      const isPasswordMatched = user.comparePassword(currentPassword);
      if (!isPasswordMatched) return next(CustomErrorHandler.unauthorized());

      user.password = newPassword;
      user.save();

      return res.status(200).json({
        success: true,
        message: "password updated",
      });
    }
  );

  forgotPassword = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {}
  );

  resetPassword = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {}
  );

  deleteCurrentUser = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {
      const decodedUser = get(res, "locals.user");
      const user = await userService.findUser({ _id: get(decodedUser, "_id") });
      if (!user) return next(CustomErrorHandler.notFound("user not found"));

      const sessions = await sessionService.findAllSessions(user._id);
      if (!sessions || sessions.length < 1)
        return next(CustomErrorHandler.unauthorized());

      sessions.forEach((session) => session.remove());

      user.remove();

      return res.status(200).json({
        success: true,
        message: "user deleted",
      });
    }
  );
}

export default new UserController();
