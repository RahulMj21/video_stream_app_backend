import { boolean, object, string, TypeOf } from "zod";

export const UpdateVideoSchema = object({
  body: object({
    videoTitle: string({ required_error: "please provide video title" })
      .min(3, "video title must contain atleast 3 characters")
      .max(40, "video title must be smaller than 40 character"),
    videoDescription: string({
      required_error: "please provide video description",
    })
      .min(3, "video title must contain atleast 3 characters")
      .max(200, "video title must be smaller than 2000 character"),
    published: boolean({
      required_error: "please provide video published status",
    }),
  }),
});

export type UpdateVideoInput = TypeOf<typeof UpdateVideoSchema>;
