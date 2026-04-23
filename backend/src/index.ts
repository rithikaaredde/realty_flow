import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes";
import propertyRoutes from "./routes/propertyRoutes";
import applicationRoutes from "./routes/applicationRoutes";
import leaseRoutes from "./routes/leaseRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import tenantRoutes from "./routes/tenantRoutes";
import managerRoutes from "./routes/managerRoutes";
import userRoutes from "./routes/userRoutes";
import favoritesRoutes from "./routes/favoritesRoutes";

import { authenticate } from "./middleware/authMiddleware";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);

// ✅ MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ✅ PUBLIC ROUTES (important for Railway + browser)
app.get("/", (_req, res) => {
  res.send("API is running 🚀");
});

app.get("/health", (_req, res) => res.json({ ok: true }));

// ✅ AUTH ROUTES (no auth required)
app.use("/auth", authRoutes);

// ✅ PROTECTED ROUTES (apply auth here only)
app.use("/properties", authenticate, propertyRoutes);
app.use("/applications", authenticate, applicationRoutes);
app.use("/leases", authenticate, leaseRoutes);
app.use("/payments", authenticate, paymentRoutes);
app.use("/tenants", authenticate, tenantRoutes);
app.use("/managers", authenticate, managerRoutes);
app.use("/users", authenticate, userRoutes);
app.use("/favorites", authenticate, favoritesRoutes);

// ❌ REMOVED THIS (this was breaking everything)
// app.use(authenticate);

// ✅ ERROR HANDLER
app.use(errorHandler);

// ✅ START SERVER
app.listen(port, "0.0.0.0", () => {
  console.log(`server running on port ${port}`);
});
