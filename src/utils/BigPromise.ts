import { NextFunction, Request, Response } from "express";

const BigPromise =
  (theFunc: Function) => (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(theFunc(req, res, next)).catch(next);
  };

export default BigPromise;
