import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 60 },
    content: { type: String, default: "", trim: true, maxlength: 2000 }
  },
  { timestamps: true }
);

export default mongoose.model("Note", noteSchema);
