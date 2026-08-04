import * as path from "path";
import * as fs from "fs";
import * as dotenv from "dotenv";

// Load environment configuration before loading NestJS modules
const envPaths = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../../.env"),
  path.resolve(__dirname, "../../../.env"),
  path.resolve(process.cwd(), "apps/api/.env"),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const production = process.env.NODE_ENV === "production";
  if (production) {
    const required = ["DATABASE_URL"];
    const missing = required.filter((name) => !process.env[name]?.trim());
    if (missing.length) throw new Error(`Missing required production environment variables: ${missing.join(", ")}`);
  }

  const app = await NestFactory.create(AppModule);
  app.getHttpAdapter().getInstance().set("trust proxy", 1);

  app.enableShutdownHooks();

  const configuredOrigins = process.env.CORS_ORIGINS
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const corsOrigins = configuredOrigins?.length
    ? configuredOrigins
    : production
      ? ["https://raza-stationers-web.vercel.app", "https://raza-stationers-admin-seven.vercel.app"]
      : ["http://localhost:3000", "http://localhost:3001"];

  app.enableCors({
    origin: (requestOrigin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!requestOrigin) return callback(null, true);
      if (corsOrigins.includes(requestOrigin)) return callback(null, true);
      if (requestOrigin.endsWith(".vercel.app") || requestOrigin.includes("localhost") || requestOrigin.includes("raza-stationers")) return callback(null, true);
      callback(new Error(`Origin ${requestOrigin} not allowed by CORS`));
    },
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle("Raza Stationers API")
    .setDescription("Backend API for Raza Stationers wholesale & retail management")
    .setVersion("0.1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const port = process.env.PORT || process.env.API_PORT || 4000;
  await app.listen(port, "0.0.0.0");
  console.log(`API running on http://0.0.0.0:${port}`);
  console.log(`Swagger docs at http://0.0.0.0:${port}/api/docs`);
}
bootstrap();
