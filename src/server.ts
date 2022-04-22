import dotenv from "dotenv";
dotenv.config();
import config from "config";
import { createServer } from "http";
import app from "./app";
import logger from "./utils/logger";
import connectDatabase, { disconnctedDatabase } from "./utils/connectDatabase";

const PORT = config.get<string>("port");
const server = createServer(app);

const appServer = server.listen(PORT, async () => {
  logger.info(`server is running on port--> ${PORT}`);
  await connectDatabase();
});

const signals = ["SIGTERM", "SIGING"];

function gracefulShutdown(signal: string) {
  process.on(signal, async () => {
    logger.info("good bye, signal--->>", signal);
    appServer.close();
    await disconnctedDatabase();
    logger.info("my work is done here");
    process.exit(0);
  });
}

for (let i = 0; i < signals.length; i++) {
  gracefulShutdown(signals[i]);
}
