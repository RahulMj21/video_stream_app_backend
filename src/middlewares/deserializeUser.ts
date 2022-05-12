import { NextFunction, Request, Response } from "express";
import { get } from "lodash";
import CustomErrorHandler from "../utils/CustomErrorHandler";
import jwt from "../utils/jwt";
import config from "config";

const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken =
      get(req, "cookies.accessToken") ||
      (get(req, "headers.authorization")
        ? get(req, "headers.authorization").replace(/^Bearer\s/, "")
        : null);

    const refreshToken =
      get(req, "cookies.refreshToken") ||
      (get(req, "headers.x-refresh")
        ? get(req, "headers.authorization")
        : null);

    if (!(accessToken && refreshToken))
      return next(CustomErrorHandler.unauthorized());

    const decoded = jwt.verifyJwt(
      accessToken,
      config.get<string>("accessTokenPublicKey")
    );
    if (decoded) {
      res.locals.user = decoded;
      next();
    } else {
      const newAccessToken = await jwt.reIssueAccessToken(
        refreshToken,
        config.get<string>("refreshTokenPublicKey"),
        config.get<string>("accessTokenPrivateKey"),
        req.get("user-agent") || ""
      );
      if (newAccessToken) {
        const decodedNewAccessToken = jwt.verifyJwt(
          newAccessToken,
          config.get<string>("accessTokenPublicKey")
        );
        if (!decodedNewAccessToken)
          return next(CustomErrorHandler.unauthorized());

        res.locals.user = decodedNewAccessToken;
        res.cookie("accessToken", newAccessToken, {
          maxAge: config.get<number>("cookieMaxAge"),
          httpOnly: true,
          secure: false,
          path: "/",
        });
        res.setHeader("x-access-token", newAccessToken);
        next();
      } else {
        return next(CustomErrorHandler.unauthorized());
      }
    }
  } catch (error: any) {
    // console.log("err->>", error);
    return next(CustomErrorHandler.unauthorized());
  }
};

export default deserializeUser;
