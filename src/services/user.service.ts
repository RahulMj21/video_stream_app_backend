import { FilterQuery } from "mongoose";
import userModel, { User } from "../models/user.model";
import { LoginInput } from "../schemas/login.schema";
import { RegisterInput } from "../schemas/register.schema";
import omit from "../utils/omit";

class UserServices {
  createUser = async (
    input: Omit<RegisterInput["body"], "confirmPassword">
  ) => {
    try {
      const user = await userModel.create(input);
      return omit(user.toJSON(), [
        "__v",
        "updatedAt",
        "password",
      ] as (keyof User)[]);
    } catch (error: any) {
      console.log(error);
      return false;
    }
  };

  findUser = async (query: FilterQuery<User>) => {
    try {
      return await userModel.findOne(query);
    } catch (error: any) {
      return false;
    }
  };

  findAllUsers = async () => {
    try {
      const users = await userModel.find();
      return users.map((user) => {
        return omit(user.toJSON(), [
          "__v",
          "password",
          "updatedAt",
        ] as (keyof User)[]);
      });
    } catch (error: any) {
      return false;
    }
  };

  validateUser = async (data: LoginInput["body"]) => {
    try {
      const user = await this.findUser({ email: data.email });
      if (!user) return false;

      const isPasswordMatched = await user.comparePassword(data.password);
      if (!isPasswordMatched) return false;

      return omit(user.toJSON(), [
        "__v",
        "updatedAt",
        "password",
      ] as (keyof User)[]);
    } catch (error: any) {
      return false;
    }
  };
}
export default new UserServices();
