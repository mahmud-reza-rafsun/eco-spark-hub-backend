import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import qs from "qs";
import { cors } from "./config/cors";
import { logger } from "./config/logger";
import { limiter } from "./config/rate-limit";
import { apiRoutes } from "./routes";
import { notFound } from "./middlewares/not-found.middleware";
import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";
import path from "path";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { PaymentController } from "./modules/purchase/purchase.controller";

// app initialization
const app: Application = express();

// webhook
app.post(
  "/api/v1/payment/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.handleStripeWebhookEvent
);

// app settings
app.set("query parser", (str: string) => qs.parse(str));
app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/templates`));

// middlewares
app.use(express.json({ limit: '10mb' }));
app.use(helmet());
app.use(logger);
app.use(cors);
app.use(limiter);
app.use(cookieParser());
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// trust proxy when behind proxies (load balancers)
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Home page route
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    title: "Welcome to EcoSpark Hub",
    description: "A secure, production-ready backend engine built with TypeScript, ensuring high performance and scalable architecture.",
    version: "1.0.0",
    backendRepository: "https://github.com/mahmud-reza-rafsun/eco-spark-hub-backend",
  });
});

// API routes
app.use("/api/auth", (req, res) => {
  return toNodeHandler(auth)(req, res);
});
app.use("/api/v1", apiRoutes);

// unhandled routes
app.use(notFound);

// Global error handler
app.use(globalErrorHandler);

export { app };