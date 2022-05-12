import { object, string, TypeOf } from "zod";

export const UpdatePasswordSchema = object({
  body: object({
    currentPassword: string({ required_error: "current password is required" })
      .min(6, "current password cannot be smaller than 6 characters")
      .max(30, "current password cannot be longer than 30 characters"),
    newPassword: string({ required_error: "new password is required" })
      .min(6, "new password cannot be smaller than 6 characters")
      .max(30, "new password cannot be longer than 30 characters"),
    confirmPassword: string({ required_error: "confirm password is required" }),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "confirm new password and new password not same",
    path: ["confirmNewPassword"],
  }),
});

export type UpdatePasswordInput = TypeOf<typeof UpdatePasswordSchema>;
