import { NextFunction, Request, Response } from "express";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let status = 500;
  let message = "internal server error";

  // console.error("err->>", err.toString());

  if (err.status) {
    status = err.status;
    message = err.message;
  }

  return res.status(status).json({
    success: false,
    message,
  });
};

export default errorHandler;
