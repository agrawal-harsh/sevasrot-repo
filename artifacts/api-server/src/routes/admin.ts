import { Router, type IRouter } from "express";
import { db, donationsTable, usersTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router: IRouter = Router();

router.get("/admin/pending-count", verifyToken, isAdmin, async (_req, res): Promise<void> => {
  const [result] = await db.select({ count: count() }).from(donationsTable).where(eq(donationsTable.status, "pending"));
  res.json({ count: Number(result?.count ?? 0) });
});

router.get("/admin/all-donations", verifyToken, isAdmin, async (_req, res): Promise<void> => {
  const donations = await db
    .select({
      id: donationsTable.id,
      userId: donationsTable.userId,
      amount: donationsTable.amount,
      isAnonymous: donationsTable.isAnonymous,
      displayName: donationsTable.displayName,
      status: donationsTable.status,
      createdAt: donationsTable.createdAt,
      reviewedAt: donationsTable.reviewedAt,
      reviewedBy: donationsTable.reviewedBy,
      userName: usersTable.name,
      userEmail: usersTable.email,
    })
    .from(donationsTable)
    .leftJoin(usersTable, eq(donationsTable.userId, usersTable.id));
  res.json(donations.map(d => ({ ...d, amount: Number(d.amount) })));
});

export default router;
