import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { prisma } from "./src/prisma/prismaClient.js";
import session from "express-session";
import pgSession from "connect-pg-simple";
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
<<<<<<< HEAD
import metricsRoutes from "./src/routes/metricsRoutes.js";
=======
import testOtpRoute from "./src/routes/testOtpRoute.js";
>>>>>>> main
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import yaml from "js-yaml";
import path from "path";
import { fileURLToPath } from "url";


const app = express();
const port = process.env.PORT || 5000;

app.use(helmet()); //  Protects from common HTTP vulnerabilities

// Required if using ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PgSession = pgSession(session);

const swaggerDocument = yaml.load(
  fs.readFileSync("./documentation.yaml", "utf8")
);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(morgan("combined")); //  HTTP request logging

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173", // Dev
  process.env.FRONTEND_URL?.trim(), // Prod from .env
].filter(Boolean);

console.log("Allowed CORS origins:", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
         console.error(`Blocked by CORS: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(
  session({
    store: new PgSession({
      conString: process.env.DATABASE_URL, // PostgreSQL URL
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
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
app.use("/api/", applicationRouter);
<<<<<<< HEAD
app.use("/api/auth", oauthRoutes);
app.use("/api", metricsRoutes);
=======
app.use("/api/oauth", oauthRoutes);
app.use("/api/test", testOtpRoute);
>>>>>>> main

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
