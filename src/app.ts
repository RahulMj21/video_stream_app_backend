import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import config from "config";
import helmet from "helmet";
import errorHandler from "./middlewares/errorHandler";

const app = express();

app.use(
  cors({
    origin: [config.get<string>("frontendUrl")],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

app.use(errorHandler);
export default app;
