import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    image: {
      data: Buffer, // Stores image as a buffer (Base64)
      contentType: String
    },
    views: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], default: [] }, // Unique user views
    createdAt: { type: Date, default: Date.now, expires: 86400 } // Auto-delete after 24 hours
  },
  { timestamps: true }
);

const Story = mongoose.model("Story", storySchema);
export default Story;
