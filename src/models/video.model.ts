import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { customAlphabet } from "nanoid";
import { User } from "./user.model";

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 10);

export class Video {
  @prop()
  public videoTitle: string;

  @prop()
  public videoDescription: string;

  @prop({ required: true, ref: () => User })
  public creator: Ref<User>;

  @prop({ enum: ["mp4"] })
  public extension: string;

  @prop({ unique: true, default: () => nanoid() })
  public videoId: string;

  @prop({ default: false })
  public published: Boolean;
}

const videoModel = getModelForClass(Video, {
  schemaOptions: {
    timestamps: true,
  },
});

export default videoModel;
