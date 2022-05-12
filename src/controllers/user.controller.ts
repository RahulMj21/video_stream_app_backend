import { NextFunction, Response, Request } from "express";
import { get } from "lodash";
import sessionService from "../services/session.service";
import userService from "../services/user.service";
import BigPromise from "../utils/BigPromise";
import CustomErrorHandler from "../utils/CustomErrorHandler";
import omit from "../utils/omit";
import { UpdatePasswordInput } from "../schemas/updatePassword.schema";
import { z } from "zod";
import config from "config";
import { ResetPasswordInput } from "../schemas/resetPassword.schema";
import { getHash } from "../utils/getHash";
import cloudinary from "cloudinary";
import axios from "axios";

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
    async (req: Request, res: Response, next: NextFunction) => {
      const decodedUser = get(res, "locals.user");

      const avatar: string | null =
        get(req, "body.avatar") || get(req, "files.avatar") || null;
      const { email, name }: { email: string; name: string } = get(req, "body");
      if (!email && !name && !avatar)
        return next(CustomErrorHandler.badRequest("nothing to update"));

      const user = await userService.findUser({ _id: decodedUser._id });
      if (!user) return next(CustomErrorHandler.notFound("user not found"));

      if (avatar) {
        if (user.avatar.public_id) {
          const isDeleted = await cloudinary.v2.uploader.destroy(
            user.avatar.public_id
          );
          if (!isDeleted) return next(CustomErrorHandler.wentWrong());
        }
        const data = await cloudinary.v2.uploader.upload(avatar);
        if (!data) return next(CustomErrorHandler.wentWrong());
        user.avatar = {
          public_id: data.public_id,
          secure_url: data.secure_url,
        };
      }
      if (email) user.email = email;
      if (name) user.name = name;
      user.save({ validateBeforeSave: false });

      return res.status(200).json({
        success: true,
        user: omit(user.toJSON(), [
          "password",
          "__v",
          "updatedAt",
          "forgotPasswordToken",
          "forgotPasswordExpiry",
        ]),
      });
    }
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
    async (
      req: Request<{}, {}, { email: string }>,
      res: Response,
      next: NextFunction
    ) => {
      const mySchema = z.object({
        email: z
          .string({ required_error: "email is required" })
          .email("please provide an validemail"),
      });
      try {
        mySchema.parse(req.body);
      } catch (error: any) {
        const [err] = JSON.parse(error.message);
        return next(CustomErrorHandler.missingCredentials(err.message));
      }

      const user = await userService.findUser({ email: req.body.email });
      if (!user)
        return next(CustomErrorHandler.notFound("email not registered"));

      const token = user.getForgotPasswordToken();

      const data = {
        to: req.body.email,
        from: config.get<string>("mailFrom"),
        subject: "password reset link from Stream Hub",
        html: `<html>
                <body>
                  <p>Click below to reset password</p>
                  <p>👇👇👇👇</p>
                  <p><a href="${config.get<string>(
                    "frontendUrl"
                  )}/auth/resetpassword/${token}">Reset Password</a></p>
                    <p>Or copy the below url and paste in your browser</p>
                    <p>👇👇👇👇</p>
                    <p>${config.get<string>(
                      "frontendUrl"
                    )}/auth/resetpassword/${token}</p>
                    </body>
              </html>`,
      };

      axios
        .post(config.get<string>("mailApi"), data)
        .then(() => {
          return res.status(200).json({
            success: true,
            message: "Check your email to reset password",
          });
        })
        .catch(() =>
          next(CustomErrorHandler.badRequest("mail cannot be sent"))
        );
    }
  );

  resetPassword = BigPromise(
    async (
      req: Request<{ token: string }, {}, ResetPasswordInput["body"]>,
      res: Response,
      next: NextFunction
    ) => {
      const { token } = req.params;
      const { newPassword } = req.body;

      const user = await userService.findUser({
        forgotPasswordToken: getHash(token),
      });
      if (!user) {
        return next(CustomErrorHandler.badRequest("invalid token"));
      }

      if (user.forgotPasswordExpiry < Date.now()) {
        user.forgotPasswordToken = "";
        user.forgotPasswordExpiry = 0;
        user.save();
        return next(
          CustomErrorHandler.badRequest("password reset token expired")
        );
      }

      user.password = newPassword;
      user.save();

      res.status(200).json({
        success: true,
        message: "your password has been reset successfully",
      });
    }
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
