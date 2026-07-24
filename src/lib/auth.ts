import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = () =>
  new TextEncoder().encode(
    process.env.AUTH_SECRET || "counselling-desk-dev-secret"
  );

export type AdminPayload = { role: "admin"; username: string };
export type TablePayload = {
  role: "table";
  tableId: string;
  tableNumber: number;
  sessionToken: string;
};

export async function signToken(payload: AdminPayload | TablePayload) {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret());
}

export async function verifyToken<T>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as T;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminPayload | null> {
  const jar = await cookies();
  const token = jar.get("admin_session")?.value;
  if (!token) return null;
  const payload = await verifyToken<AdminPayload>(token);
  return payload?.role === "admin" ? payload : null;
}

export async function getTableSession(): Promise<TablePayload | null> {
  const jar = await cookies();
  const token = jar.get("table_session")?.value;
  if (!token) return null;
  const payload = await verifyToken<TablePayload>(token);
  return payload?.role === "table" ? payload : null;
}
