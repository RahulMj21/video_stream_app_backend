import mongoose from "mongoose";
import logger from "./logger";
import config from "config";

const dbUrl = config.get<string>("dbUrl");

const connectDatabase = async () => {
  try {
    await mongoose.connect(dbUrl);
    logger.info("db connected..");
  } catch (error: any) {
    logger.error("db connection error--->", error);
    process.exit(1);
  }
};

export async function disconnctedDatabase() {
  await mongoose.connection.close();
  return logger.info("db connection closed");
}

export default connectDatabase;
