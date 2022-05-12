import jwt from "jsonwebtoken";
import { get } from "lodash";
import { User } from "../models/user.model";
import sessionService from "../services/session.service";
import userService from "../services/user.service";
import omit from "./omit";

class JWT {
  signJwt = (payload: any, secret: string, options = {}) => {
    return jwt.sign(payload, Buffer.from(secret, "base64").toString("ascii"), {
      ...(options && options),
      algorithm: "RS256",
    });
  };

  verifyJwt = (token: string, secret: string) => {
    return jwt.verify(token, Buffer.from(secret, "base64").toString("ascii"));
  };

  reIssueAccessToken = async (
    refreshToken: string,
    refreshTokenSecret: string,
    accessTokenSecret: string,
    userAgent: string
  ) => {
    try {
      const decoded = this.verifyJwt(refreshToken, refreshTokenSecret);
      if (!decoded) return false;

      const user = await userService.findUser({ _id: get(decoded, "_id") });
      if (!user) return false;

      const session = await sessionService.findSession({
        userId: user._id,
        userAgent,
      });
      if (!session) return false;

      const payload = {
        ...omit(user.toJSON(), [
          "__v",
          "updatedAt",
          "password",
          "forgotPasswordToken",
          "forgotPasswordExpiry",
        ] as (keyof User)[]),
        session: session._id,
      };

      return this.signJwt(payload, accessTokenSecret);
    } catch (error: any) {
      return false;
    }
  };
}

export default new JWT();
