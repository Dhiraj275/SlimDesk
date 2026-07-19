import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "./logger";

export async function connectDB() {
    try {
        await mongoose.connect(env.MONGO_URI);
        logger.info("MongoDB Connected");
    } catch (error) {
        logger.error("Failed to connect MongoDB");
        process.exit(1);
    }
}