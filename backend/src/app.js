import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import apiRoutes from "./api/index.js";

const app = express();

const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "http://localhost:3000", "https://milk-tracker-s4i1.onrender.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow REST tools like Postman (no origin)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 204
  })
);



app.use(express.json());
app.use(cookieParser());
app.use("/api", apiRoutes);

export default app;
