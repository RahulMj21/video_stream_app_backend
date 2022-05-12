import { pre, prop, getModelForClass } from "@typegoose/typegoose";
import argon from "argon2";
import crypto from "crypto";
import { getHash } from "../utils/getHash";

@pre<User>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await argon.hash(this.password);
  next();
})
export class User {
  [x: string]: any;

  @prop({ required: true, unique: true })
  public email: string;

  @prop({ required: true })
  public name: string;

  @prop({ required: true })
  public password: string;

  @prop({ default: { public_id: "", secure_url: "" } })
  public avatar: {
    public_id: string;
    secure_url: string;
  };

  @prop({ default: "user" })
  public role: string;

  @prop({ default: false })
  public isLoggedInWithGoogle: Boolean;

  @prop({ default: "" })
  public forgotPasswordToken: string;

  @prop({ default: 0 })
  public forgotPasswordExpiry: Number;

  public async comparePassword(password: string) {
    return argon.verify(this.password, password);
  }

  public getForgotPasswordToken() {
    const token = crypto.randomBytes(20).toString("hex");
    const time = Date.now() + 1000 * 60 * 10;

    this.forgotPasswordToken = getHash(token);
    this.forgotPasswordExpiry = +time;

    this.save();

    return token;
  }
}

const userModel = getModelForClass(User, {
  schemaOptions: {
    timestamps: true,
  },
});

export default userModel;
