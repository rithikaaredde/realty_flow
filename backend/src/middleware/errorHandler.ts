import { NextFunction, Request, Response } from "express";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(err?.stack || err);
  if (err?.name === "PrismaClientKnownRequestError") {
    if (err.code === "P2025") {
      res.status(404).json({ error: "Record not found" });
      return;
    }
    if (err.code === "P2002") {
      res.status(409).json({ error: "Duplicate record" });
      return;
    }
  }
  if (err?.name === "ValidationError") {
    res.status(400).json({ error: err.message });
    return;
  }
  res.status(err?.status || 500).json({ error: err?.message || "Internal server error" });
};
