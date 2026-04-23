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
// ✅ CREATE APP FIRST
const app = (0, express_1.default)();
const port = Number(process.env.PORT || 3001);
// ✅ MIDDLEWARE
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
// ✅ AUTH (AFTER app is created)
app.use(authMiddleware_1.authenticate);
// ✅ ROUTES
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/auth", authRoutes_1.default);
app.use("/properties", propertyRoutes_1.default);
app.use("/applications", applicationRoutes_1.default);
app.use("/leases", leaseRoutes_1.default);
app.use("/payments", paymentRoutes_1.default);
app.use("/tenants", tenantRoutes_1.default);
app.use("/managers", managerRoutes_1.default);
app.use("/users", userRoutes_1.default);
app.use("/favorites", favoritesRoutes_1.default);
// ✅ ERROR HANDLER
app.use(errorHandler_1.errorHandler);
// ✅ START SERVER
app.listen(port, () => {
    console.log(`server running on http://localhost:${port}`);
});
