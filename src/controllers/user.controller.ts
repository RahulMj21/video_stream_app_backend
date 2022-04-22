import { NextFunction, Response } from "express";
import BigPromise from "../utils/BigPromise";

class UserController {
  getCurrentUser = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {}
  );
  getAllUsers = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {}
  );
  getsingleUser = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {}
  );
  updateProfile = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {}
  );
  updatePassword = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {}
  );
  forgotPassword = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {}
  );
  resetPassword = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {}
  );
  deleteCurrentUser = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {}
  );
}

export default new UserController();
