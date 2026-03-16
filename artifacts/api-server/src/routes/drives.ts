import { Router, type IRouter } from "express";
import multer from "multer";
import { db, sevaDriversTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { cloudinary } from "../lib/cloudinary.js";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { files: 10, fileSize: 10 * 1024 * 1024 } });

async function uploadImageToCloudinary(buffer: Buffer, mimetype: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "sevasrot/drives", resource_type: "image" },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

router.get("/drives", async (_req, res): Promise<void> => {
  const drives = await db.select().from(sevaDriversTable).orderBy(sevaDriversTable.createdAt);
  res.json(drives.reverse());
});

router.get("/drives/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const [drive] = await db.select().from(sevaDriversTable).where(eq(sevaDriversTable.id, id));
  if (!drive) {
    res.status(404).json({ error: "Seva drive not found" });
    return;
  }
  res.json(drive);
});

router.post("/drives/create", verifyToken, isAdmin, upload.array("images", 10), async (req, res): Promise<void> => {
  const { title, description, location, date } = req.body;
  if (!title || !description || !location || !date) {
    res.status(400).json({ error: "Title, description, location and date are required" });
    return;
  }
  const files = req.files as Express.Multer.File[] | undefined;
  let imageUrls: string[] = [];
  if (files && files.length > 0) {
    imageUrls = await Promise.all(files.map(f => uploadImageToCloudinary(f.buffer, f.mimetype)));
  }
  const [drive] = await db.insert(sevaDriversTable).values({
    title,
    description,
    location,
    date: new Date(date),
    images: imageUrls,
    createdBy: req.user!.id,
  }).returning();
  res.status(201).json(drive);
});

router.put("/drives/:id", verifyToken, isAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const { title, description, location, date, images } = req.body;
  const updateData: Record<string, unknown> = {};
  if (title) updateData["title"] = title;
  if (description) updateData["description"] = description;
  if (location) updateData["location"] = location;
  if (date) updateData["date"] = new Date(date);
  if (images) updateData["images"] = images;
  const [drive] = await db.update(sevaDriversTable).set(updateData).where(eq(sevaDriversTable.id, id)).returning();
  if (!drive) {
    res.status(404).json({ error: "Seva drive not found" });
    return;
  }
  res.json(drive);
});

router.delete("/drives/:id", verifyToken, isAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const [drive] = await db.delete(sevaDriversTable).where(eq(sevaDriversTable.id, id)).returning();
  if (!drive) {
    res.status(404).json({ error: "Seva drive not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
