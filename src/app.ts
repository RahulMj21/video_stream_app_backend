import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import config from "config";
import helmet from "helmet";
import errorHandler from "./middlewares/errorHandler";
import testRoute from "./routes/test.route";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import videoRoutes from "./routes/video.route";

const app = express();

app.use(
  cors({
    origin: [config.get<string>("frontendUrl")],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(helmet());
// app.use(
//   express.urlencoded({
//     extended: true,
//     limit: "100mb",
//     parameterLimit: 1000000,
//   })
// );

app.use("/api/v1", testRoute);
app.use("/api/v1", authRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1/video", videoRoutes);

app.use(errorHandler);
export default app;
