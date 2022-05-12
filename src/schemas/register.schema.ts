import { object, string, TypeOf } from "zod";

export const RegisterSchema = object({
  body: object({
    name: string({ required_error: "name is required" })
      .min(3, "name cannot be smaller than 3 characters")
      .max(30, "name cannot be longer than 30 characters"),
    email: string({ required_error: "email is required" }).email(
      "please provide a valid email"
    ),
    password: string({ required_error: "password is required" })
      .min(6, "password cannot be smaller than 6 characters")
      .max(30, "password cannot be longer than 30 characters"),
    confirmPassword: string({ required_error: "confirm password is required" }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "confirm password and password not same",
    path: ["confirmPassword"],
  }),
});

export type RegisterInput = TypeOf<typeof RegisterSchema>;
