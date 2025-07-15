import express from "express";
import { prisma } from "./src/prisma/prismaClient.js";
import session from "express-session";
import passport from "passport";
import "./src/config/passport.js";
import cors from "cors";
import "dotenv/config";
import {
  notFoundHandler,
  globalErrorHandler,
} from "./src/middleware/errorhandler.js";
import cookieParser from "cookie-parser";
import authRouter from "./src/routes/authRoutes.js";
import oauthRoutes from "./src/routes/oauthRoutes.js";
import profileRouter from "./src/routes/profileRoute.js";
import projectRouter from "./src/routes/projectRoutes.js";
import applicationRouter from "./src/routes/applicationRoutes.js";
import metricsRoutes from "./src/routes/metricsRoutes.js";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import yaml from "js-yaml";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = process.env.PORT || 5000;

// Required if using ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerDocument = yaml.load(
  fs.readFileSync("./documentation.yaml", "utf8")
);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://team-bravo-profile-card-auth-app.vercel.app",
    ], // allow dev + prod
    credentials: true,
  })
); // Adjust origin as needed

app.use(
  session({
    secret: "session_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.send("API is working fine");
});

app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/projects", projectRouter);
app.use("/api", applicationRouter);
app.use("/api/auth", oauthRoutes);
app.use("/api/auth", metricsRoutes);

// serve the static uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(notFoundHandler);
app.use(globalErrorHandler);

async function startServer() {
  try {
    await prisma.$connect();
    console.log(" Connected to PostgreSQL via Prisma");

    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  } catch (error) {
    console.error(" Failed to connect to the database:", error);
    process.exit(1);
  }
}

startServer();

export default app;
