import { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    cognitoId: string;
    role: "TENANT" | "MANAGER";
  };
}

// ✅ THIS NAME FIXES EVERYTHING
export const authenticate = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  const userId = req.headers["x-user-id"] as string;
  const rawRole = String(req.headers["x-user-role"] ?? "").toUpperCase();
  const role: "TENANT" | "MANAGER" | undefined =
    rawRole === "MANAGER" || rawRole === "ADMIN" || rawRole === "OWNER"
      ? "MANAGER"
      : rawRole === "TENANT" || rawRole === "USER"
        ? "TENANT"
        : undefined;

  if (userId && role) {
    req.user = { cognitoId: userId, role };
  }

  next();
};