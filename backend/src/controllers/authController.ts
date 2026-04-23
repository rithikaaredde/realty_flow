import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { Role } from "@prisma/client";

export const syncUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const cognitoId = String(req.headers["x-user-id"] ?? "");
    const headerRole = String(req.headers["x-user-role"] ?? "");
    const rawRole = String(req.headers["x-user-role-raw"] ?? "");
    const { email, name } = (req.body ?? {}) as {
      email?: string;
      name?: string;
    };

    if (!cognitoId) {
      res.status(400).json({ error: "Missing x-user-id" });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { cognitoId } });
    if (existing) {
      // If Cognito provides fresher identity fields later, update them safely.
      if ((email && email !== existing.email) || (name && name !== existing.name)) {
        const updated = await prisma.user.update({
          where: { cognitoId },
          data: {
            ...(email ? { email } : {}),
            ...(name ? { name } : {}),
          },
        });
        res.json(updated);
        return;
      }

      res.json(existing);
      return;
    }

    const isAdmin =
      rawRole === "admin" ||
      rawRole === "owner" ||
      headerRole === "admin" ||
      headerRole === "MANAGER" ||
      headerRole === "OWNER";

    const user = await prisma.user.create({
      data: {
        cognitoId,
        email: email ?? `${cognitoId}@cognito.local`,
        name: name ?? "User",
        role: isAdmin ? Role.MANAGER : Role.TENANT,
      },
    });

    res.json(user);
  } catch {
    res.status(500).json({ error: "Failed to sync user" });
  }
};
