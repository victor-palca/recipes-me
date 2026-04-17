import express from "express";
import cors, { type CorsOptions } from "cors";
import { authRoutes } from "./routes/authRoutes";
import { recipeRoutes } from "./routes/recipeRoutes";
import { shoppingListRoutes } from "./routes/shoppingListRoutes";
import { errorMiddleware } from "./middlewares/errorMiddleware";
import { setupSwagger } from "./swagger/setupSwagger";
import { env } from "./config/env";

export const app = express();

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }
    callback(null, env.corsOrigins.includes(origin));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("/{*path}", cors(corsOptions));
app.use(express.json());

setupSwagger(app);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(authRoutes);
app.use("/recipes", recipeRoutes);
app.use("/shopping-list", shoppingListRoutes);

app.use(errorMiddleware);
