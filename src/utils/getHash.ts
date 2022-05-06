import crypto from "crypto";
import config from "config";

export const getHash = (data: string) => {
  return crypto
    .createHmac("sha256", config.get<string>("forgotPasswordTokenSecret"))
    .update(data)
    .digest("hex");
};
