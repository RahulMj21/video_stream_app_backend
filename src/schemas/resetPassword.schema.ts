import { object, string, TypeOf } from "zod";

export const ResetPasswordSchema = object({
  body: object({
    newPassword: string({ required_error: "new password is required" })
      .min(6, "new password cannot be smaller than 6 characters")
      .max(30, "new password cannot be longer than 30 characters"),
    confirmNewPassword: string({
      required_error: "confirm new password is required",
    }),
  }).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "confirm new password mismatched with the new password",
    path: ["confirmNewPassword"],
  }),
});

export type ResetPasswordInput = TypeOf<typeof ResetPasswordSchema>;
