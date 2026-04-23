"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const propertyRoutes_1 = __importDefault(require("./routes/propertyRoutes"));
const applicationRoutes_1 = __importDefault(require("./routes/applicationRoutes"));
const leaseRoutes_1 = __importDefault(require("./routes/leaseRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const tenantRoutes_1 = __importDefault(require("./routes/tenantRoutes"));
const managerRoutes_1 = __importDefault(require("./routes/managerRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const favoritesRoutes_1 = __importDefault(require("./routes/favoritesRoutes"));
const authMiddleware_1 = require("./middleware/authMiddleware");
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = Number(process.env.PORT || 3000);
// ✅ MIDDLEWARE
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
// ✅ PUBLIC ROUTES (important for Railway + browser)
app.get("/", (_req, res) => {
    res.send("API is running 🚀");
});
app.get("/health", (_req, res) => res.json({ ok: true }));
// ✅ AUTH ROUTES (no auth required)
app.use("/auth", authRoutes_1.default);
// ✅ PROTECTED ROUTES (apply auth here only)
app.use("/properties", authMiddleware_1.authenticate, propertyRoutes_1.default);
app.use("/applications", authMiddleware_1.authenticate, applicationRoutes_1.default);
app.use("/leases", authMiddleware_1.authenticate, leaseRoutes_1.default);
app.use("/payments", authMiddleware_1.authenticate, paymentRoutes_1.default);
app.use("/tenants", authMiddleware_1.authenticate, tenantRoutes_1.default);
app.use("/managers", authMiddleware_1.authenticate, managerRoutes_1.default);
app.use("/users", authMiddleware_1.authenticate, userRoutes_1.default);
app.use("/favorites", authMiddleware_1.authenticate, favoritesRoutes_1.default);
// ❌ REMOVED THIS (this was breaking everything)
// app.use(authenticate);
// ✅ ERROR HANDLER
app.use(errorHandler_1.errorHandler);
// ✅ START SERVER
app.listen(port, "0.0.0.0", () => {
    console.log(`server running on port ${port}`);
});
