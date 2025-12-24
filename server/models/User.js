import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    dob: { type: Date, required: true },
    email: { type: String, required: true, trim: true, maxlength: 160 },
    emailLower: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      maxlength: 160
    },
    username: { type: String, required: true, trim: true, maxlength: 40 },
    usernameLower: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      maxlength: 40
    },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

userSchema.index({ emailLower: 1 }, { unique: true });
userSchema.index({ usernameLower: 1 }, { unique: true });

export default mongoose.model("User", userSchema);
