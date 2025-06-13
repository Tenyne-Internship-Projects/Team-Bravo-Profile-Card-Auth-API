import express from "express";
import session from "express-session";
import cors from "cors";
import 'dotenv/config';
import { notFoundHandler, globalErrorHandler } from './Middleware/errorhandler.js'
import { connectDB } from "./config/connectDb.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoutes.js";
import  profileRouter  from "./routes/profileRoute.js";
import swaggerUi from "swagger-ui-express"
import fs from "fs";
import yaml from "js-yaml";

const app = express();
const port = process.env.PORT || 5000;

connectDB();
const swaggerDocument = yaml.load(fs.readFileSync('./documentation.yaml', 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: 'http://localhost:3000' })); // Adjust origin as needed

app.use(session({
  secret: 'session_secret_key',
  resave: false,
  saveUninitialized: true,
}));




app.get("/", (req, res) => {
  res.send("API is working fine");
});

app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);

// app.use(notFoundHandler);


// app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
