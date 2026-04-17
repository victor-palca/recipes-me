import express from "express";
import cors from "cors";
import { authRoutes } from "./routes/authRoutes";
import { recipeRoutes } from "./routes/recipeRoutes";
import { shoppingListRoutes } from "./routes/shoppingListRoutes";
import { errorMiddleware } from "./middlewares/errorMiddleware";
import { setupSwagger } from "./swagger/setupSwagger";

export const app = express();

app.use(
  cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.options("/{*path}", cors());
app.use(express.json());

setupSwagger(app);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(authRoutes);
app.use("/recipes", recipeRoutes);
app.use("/shopping-list", shoppingListRoutes);

app.use(errorMiddleware);
