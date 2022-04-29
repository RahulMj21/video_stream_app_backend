import { pre, prop, getModelForClass } from "@typegoose/typegoose";
import argon from "argon2";

@pre<User>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await argon.hash(this.password);
  next();
})
export class User {
  @prop({ required: true, unique: true })
  public email: string;

  @prop({ required: true })
  public name: string;

  @prop({ required: true })
  public password: string;

  @prop({ default: "user" })
  public role: string;

  public async comparePassword(password: string) {
    return argon.verify(this.password, password);
  }
}

const userModel = getModelForClass(User, {
  schemaOptions: {
    timestamps: true,
  },
});

export default userModel;
