import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

router.get("/check-username", async (req, res) => {
  const username = (req.query.username || "").trim();
  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  const exists = await User.exists({
    usernameLower: username.toLowerCase()
  });
  res.json({ available: !exists });
});

router.post("/register", async (req, res) => {
  try {
    const {
      fullName,
      dob,
      email,
      username,
      password,
      confirmPassword
    } = req.body || {};

    const cleanName = (fullName || "").trim();
    const cleanDob = (dob || "").trim();
    const cleanEmail = (email || "").trim();
    const cleanUsername = (username || "").trim();

    if (
      !cleanName ||
      !cleanDob ||
      !cleanEmail ||
      !cleanUsername ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const dobDate = new Date(cleanDob);
    if (Number.isNaN(dobDate.getTime())) {
      return res.status(400).json({ message: "Invalid date of birth" });
    }

    const emailLower = cleanEmail.toLowerCase();
    const usernameLower = cleanUsername.toLowerCase();

    const existing = await User.findOne({
      $or: [{ emailLower }, { usernameLower }]
    }).lean();

    if (existing) {
      return res.status(409).json({ message: "Email or username already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName: cleanName,
      dob: dobDate,
      email: cleanEmail,
      emailLower,
      username: cleanUsername,
      usernameLower,
      passwordHash
    });

    res.status(201).json({
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ message: "Email or username already in use" });
    }
    res.status(500).json({ message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body || {};
    const cleanIdentifier = (identifier || "").trim().toLowerCase();

    if (!cleanIdentifier || !password) {
      return res.status(400).json({ message: "Email or username and password required" });
    }

    const user = await User.findOne({
      $or: [{ emailLower: cleanIdentifier }, { usernameLower: cleanIdentifier }]
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});

export default router;
