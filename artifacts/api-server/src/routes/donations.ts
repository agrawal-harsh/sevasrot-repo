import { Router, type IRouter } from "express";
import { db, donationsTable, usersTable } from "@workspace/db";
import { eq, sum } from "drizzle-orm";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router: IRouter = Router();

router.post("/donations/create", verifyToken, async (req, res): Promise<void> => {
  const { amount, isAnonymous, displayName } = req.body;
  if (!amount || typeof amount !== "number" || amount <= 0) {
    res.status(400).json({ error: "Valid amount is required" });
    return;
  }
  const [donation] = await db.insert(donationsTable).values({
    userId: req.user!.id,
    amount: String(amount),
    isAnonymous: Boolean(isAnonymous),
    displayName: isAnonymous ? null : (displayName || null),
    status: "pending",
  }).returning();
  res.status(201).json({
    ...donation,
    amount: Number(donation.amount),
  });
});

router.get("/donations/approved", async (_req, res): Promise<void> => {
  const donations = await db.select().from(donationsTable).where(eq(donationsTable.status, "approved"));
  const totalResult = await db.select({ total: sum(donationsTable.amount) }).from(donationsTable).where(eq(donationsTable.status, "approved"));
  const total = Number(totalResult[0]?.total ?? 0);
  res.json({
    donations: donations.map(d => ({ ...d, amount: Number(d.amount) })),
    total,
  });
});

router.get("/donations/my", verifyToken, async (req, res): Promise<void> => {
  const donations = await db.select().from(donationsTable).where(eq(donationsTable.userId, req.user!.id));
  res.json(donations.map(d => ({ ...d, amount: Number(d.amount) })));
});

router.get("/donations/pending", verifyToken, isAdmin, async (_req, res): Promise<void> => {
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
    .leftJoin(usersTable, eq(donationsTable.userId, usersTable.id))
    .where(eq(donationsTable.status, "pending"));
  res.json(donations.map(d => ({ ...d, amount: Number(d.amount) })));
});

router.patch("/donations/:id/approve", verifyToken, isAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const [donation] = await db.update(donationsTable)
    .set({ status: "approved", reviewedAt: new Date(), reviewedBy: req.user!.id })
    .where(eq(donationsTable.id, id))
    .returning();
  if (!donation) {
    res.status(404).json({ error: "Donation not found" });
    return;
  }
  res.json({ ...donation, amount: Number(donation.amount) });
});

router.patch("/donations/:id/reject", verifyToken, isAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const [donation] = await db.update(donationsTable)
    .set({ status: "rejected", reviewedAt: new Date(), reviewedBy: req.user!.id })
    .where(eq(donationsTable.id, id))
    .returning();
  if (!donation) {
    res.status(404).json({ error: "Donation not found" });
    return;
  }
  res.json({ ...donation, amount: Number(donation.amount) });
});

export default router;
