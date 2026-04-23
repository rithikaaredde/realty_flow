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

// ✅ CREATE APP FIRST
const app = express();
const port = Number(process.env.PORT || 3001);

// ✅ MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ✅ AUTH (AFTER app is created)
app.use(authenticate);

// ✅ ROUTES
app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/properties", propertyRoutes);
app.use("/applications", applicationRoutes);
app.use("/leases", leaseRoutes);
app.use("/payments", paymentRoutes);
app.use("/tenants", tenantRoutes);
app.use("/managers", managerRoutes);
app.use("/users", userRoutes);
app.use("/favorites", favoritesRoutes);

// ✅ ERROR HANDLER
app.use(errorHandler);

// ✅ START SERVER
app.listen(port, () => {
  console.log(`server running on http://localhost:${port}`);
});