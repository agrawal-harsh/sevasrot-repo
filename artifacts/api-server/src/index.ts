import app from "./app.js";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const rawPort = process.env["PORT"] || 3000;

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function promoteInitialAdmin() {
  const email = process.env["INITIAL_ADMIN_EMAIL"];
  if (!email) return;
  try {
    const result = await db
      .update(usersTable)
      .set({ role: "admin" })
      .where(eq(usersTable.email, email))
      .returning({ id: usersTable.id, email: usersTable.email, role: usersTable.role });
    if (result.length > 0) {
      console.log(`[startup] Promoted ${email} to admin`);
    }
  } catch (err) {
    console.error("[startup] Failed to promote admin:", err);
  }
}

app.listen(port, async () => {
  console.log(`Server listening on port ${port}`);
  await promoteInitialAdmin();
});
