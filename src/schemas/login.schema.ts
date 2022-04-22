import { object, string, TypeOf } from "zod";

const LoginSchema = object({
  body: object({
    email: string({ required_error: "email is required" }).email(
      "please provide a valid email"
    ),
    password: string({ required_error: "password is required" })
      .min(6, "password cannot be smaller than 6 characters")
      .max(30, "password cannot be longer than 30 characters"),
  }),
});

export type LoginInput = TypeOf<typeof LoginSchema>;
