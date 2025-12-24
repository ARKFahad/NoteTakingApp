import express from "express";
import Note from "../models/Note.js";

const router = express.Router();

// GET all notes
router.get("/", async (req, res) => {
  const notes = await Note.find().sort({ createdAt: -1 });
  res.json(notes);
});

// CREATE a note
router.post("/", async (req, res) => {
  const { title, content } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Title is required" });
  }

  const note = await Note.create({
    title: title.trim(),
    content: (content || "").trim()
  });

  res.status(201).json(note);
});

// DELETE a note
router.delete("/:id", async (req, res) => {
  const deleted = await Note.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Note not found" });
  res.json({ message: "Deleted" });
});

export default router;
