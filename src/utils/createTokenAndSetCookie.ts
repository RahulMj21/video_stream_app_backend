import jwt from "./jwt";
import config from "config";
import { Response } from "express";

const createTokenAndSetCookie = (payload = {}, res: Response) => {
  try {
    const accessToken = jwt.signJwt(
      payload,
      config.get<string>("accessTokenPrivateKey"),
      {
        expiresIn: config.get<number>("accessTokenExpiry"),
      }
    );
    const refreshToken = jwt.signJwt(
      payload,
      config.get<string>("refreshTokenPrivateKey"),
      {
        expiresIn: config.get<number>("refreshTokenExpiry"),
      }
    );

    const cookieOptions = {
      maxAge: config.get<number>("cookieMaxAge"),
      httpOnly: true,
      secure: false,
      path: "/",
    };

    res.cookie("accessToken", accessToken, { ...cookieOptions });
    res.cookie("refreshToken", refreshToken, { ...cookieOptions });

    return true;
  } catch (error: any) {
    return false;
  }
};

export default createTokenAndSetCookie;
