import express from "express";
import Note from "../models/Note.js";

const router = express.Router();

// GET all notes
router.get("/", async (req, res) => {
  const userId = (req.query.userId || "").trim();
  if (!userId) {
    return res.status(400).json({ message: "User id required" });
  }

  const notes = await Note.find({ userId }).sort({ createdAt: -1 });
  res.json(notes);
});

// CREATE a note
router.post("/", async (req, res) => {
  const { title, content, userId } = req.body;

  if (!userId || !String(userId).trim()) {
    return res.status(400).json({ message: "User id required" });
  }

  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Title is required" });
  }

  const note = await Note.create({
    title: title.trim(),
    content: (content || "").trim(),
    userId: String(userId).trim()
  });

  res.status(201).json(note);
});

// DELETE a note
router.delete("/:id", async (req, res) => {
  const userId = (req.query.userId || "").trim();
  if (!userId) {
    return res.status(400).json({ message: "User id required" });
  }

  const deleted = await Note.findOneAndDelete({
    _id: req.params.id,
    userId
  });
  if (!deleted) return res.status(404).json({ message: "Note not found" });
  res.json({ message: "Deleted" });
});

export default router;
