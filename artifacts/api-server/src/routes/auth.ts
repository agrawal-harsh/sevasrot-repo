import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { verifyToken } from "../middlewares/verifyToken.js";

const router: IRouter = Router();

function signToken(user: { id: number; email: string; role: string; name: string }) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env["JWT_SECRET"] as string,
    { expiresIn: "7d" }
  );
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: "Name, email and password are required" });
    return;
  }
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }
  const hashed = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({ name, email, password: hashed, authProvider: "local" }).returning();
  const token = signToken(user);
  res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, authProvider: user.authProvider, createdAt: user.createdAt } });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user || !user.password) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = signToken(user);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, authProvider: user.authProvider, createdAt: user.createdAt } });
});

router.get("/auth/me", verifyToken, async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, authProvider: user.authProvider, createdAt: user.createdAt });
});

router.get("/auth/google", (req, res): void => {
  const clientId = process.env["GOOGLE_CLIENT_ID"];
  const domains = process.env["REPLIT_DOMAINS"] || "";
  const primaryDomain = domains.split(",")[0]?.trim();
  const redirectUri = `https://${primaryDomain}/api/auth/google/callback`;
  const scope = "openid email profile";
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;
  res.redirect(url);
});

router.get("/auth/google/callback", async (req, res): Promise<void> => {
  const { code } = req.query;
  if (!code || typeof code !== "string") {
    res.redirect("/?error=google_auth_failed");
    return;
  }
  const domains = process.env["REPLIT_DOMAINS"] || "";
  const primaryDomain = domains.split(",")[0]?.trim();
  const redirectUri = `https://${primaryDomain}/api/auth/google/callback`;

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env["GOOGLE_CLIENT_ID"]!,
        client_secret: process.env["GOOGLE_CLIENT_SECRET"]!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const tokenData = await tokenRes.json() as { access_token?: string };
    if (!tokenData.access_token) {
      res.redirect("/?error=google_auth_failed");
      return;
    }
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json() as { id: string; email: string; name: string };

    let [user] = await db.select().from(usersTable).where(eq(usersTable.googleId, profile.id));
    if (!user) {
      const [existingByEmail] = await db.select().from(usersTable).where(eq(usersTable.email, profile.email));
      if (existingByEmail) {
        [user] = await db.update(usersTable).set({ googleId: profile.id, authProvider: "google" }).where(eq(usersTable.id, existingByEmail.id)).returning();
      } else {
        [user] = await db.insert(usersTable).values({ name: profile.name, email: profile.email, googleId: profile.id, authProvider: "google" }).returning();
      }
    }
    const token = signToken(user);
    res.redirect(`/?token=${token}`);
  } catch (err) {
    console.error("Google OAuth error:", err);
    res.redirect("/?error=google_auth_failed");
  }
});

export default router;
