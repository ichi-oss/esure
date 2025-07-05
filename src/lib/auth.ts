import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import connectToDatabase from "./mongodb";
import User from "./models/User";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface UserPayload {
  userId: string;
  email: string;
  role: "admin" | "sub-admin" | "user";
  fullName: string;
}

export function generateToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch (error) {
    return null;
  }
}

export async function getAuthUser(
  request: NextRequest
): Promise<UserPayload | null> {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    // Verify user still exists and is active
    await connectToDatabase();
    const user = await User.findById(payload.userId);

    if (!user || !user.isActive) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}

export function requireAuth(allowedRoles?: string[]) {
  return async (request: NextRequest) => {
    const user = await getAuthUser(request);

    if (!user) {
      return { error: "Unauthorized", status: 401 };
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return { error: "Forbidden", status: 403 };
    }

    return { user };
  };
}
