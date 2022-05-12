import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";
import CustomErrorHandler from "../utils/CustomErrorHandler";

const validateResources =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (error: any) {
      const err = JSON.parse(error.message);
      return next(CustomErrorHandler.missingCredentials(err[0].message));
    }
  };

export default validateResources;
