import app from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/db";
import { logger } from "./config/logger";

async function bootstrap() {
    await connectDB();

    app.listen(env.PORT, () => {
        logger.info(`Server running on port ${env.PORT}`);
    })
}

bootstrap();