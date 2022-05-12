import dotenv from "dotenv";
dotenv.config();
import config from "config";
import { createServer } from "http";
import app from "./app";
import logger from "./utils/logger";
import connectDatabase from "./utils/connectDatabase";

const PORT = config.get<string>("port");
const server = createServer(app);

server.listen(PORT, async () => {
  logger.info(`server is running on port--> ${PORT}`);
  await connectDatabase();
});
