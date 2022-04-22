import { NextFunction, Request, Response } from "express";
import { RegisterInput } from "../schemas/register.schema";
import BigPromise from "../utils/BigPromise";
import { get } from "lodash";
import UserServices from "../services/user.service";
import CustomErrorHandler from "../utils/CustomErrorHandler";
import sessionService from "../services/session.service";
import createTokenAndSetCookie from "../utils/createTokenAndSetCookie";
import { LoginInput } from "../schemas/login.schema";

class AuthController {
  /*
    Todo -> Register flow 👇👇👇👇
      * 1) get the name,email,password from the req.body
      * 2) create the user  
      * 3) create session  
      * 4) set cookie  
      * 5) send response
  */
  register = BigPromise(
    async (
      req: Request<{}, {}, RegisterInput["body"]>,
      res: Response,
      next: NextFunction
    ) => {
      const { name, email, password } = get(req, "body");

      const user = await UserServices.createUser({ name, email, password });
      if (!user)
        return next(CustomErrorHandler.conflict("email already registered"));

      const session = await sessionService.createSession({
        userId: user._id,
        userAgent: req.get("user-agent") || "",
      });
      if (!session) return next(CustomErrorHandler.wentWrong());

      const isCookieSet = createTokenAndSetCookie(
        {
          ...user,
          session: session._id,
        },
        res
      );
      if (!isCookieSet) return next(CustomErrorHandler.wentWrong());

      return res.status(201).json({
        success: true,
        message: "registered successfully",
      });
    }
  );

  /*
    Todo -> Login flow 👇👇👇👇
      * 1) get the email,password from the req.body
      * 2) check if the email exists  
      * 3) create session  
      * 4) set cookie  
      * 5) send response
  */
  login = BigPromise(
    async (
      req: Request<{}, {}, LoginInput["body"]>,
      res: Response,
      next: NextFunction
    ) => {
      const user = await UserServices.validateUser(req.body);
      if (!user)
        return next(CustomErrorHandler.conflict("wrong email or password"));

      const session = await sessionService.upsertSession(
        {
          userId: user._id,
          userAgent: req.get("user-agent") || "",
        },
        {
          userId: user._id,
          userAgent: req.get("user-agent") || "",
        }
      );
      if (!session) return next(CustomErrorHandler.wentWrong());

      const isCookieSet = createTokenAndSetCookie(
        { ...user, session: session._id },
        res
      );
      if (!isCookieSet) return next(CustomErrorHandler.wentWrong());

      return res.status(200).json({
        success: true,
        message: "logged in successfully",
      });
    }
  );
  logout = BigPromise((req: Request, res: Response, next: NextFunction) => {});
}

export default new AuthController();
