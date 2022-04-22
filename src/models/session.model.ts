import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { User } from "./user.model";
export class Session {
  @prop({ required: true, ref: () => User })
  public userId: Ref<User>;

  @prop({ required: true })
  public userAgent: string;
}

const sessionModel = getModelForClass(Session, {
  schemaOptions: {
    timestamps: true,
  },
});

export default sessionModel;
