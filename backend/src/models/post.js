import mongoose from "mongoose";
import User from "./user.js"; // Import the User model

const postSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    caption: { type: String, maxLength: 500 },
    image: {
      data: Buffer,
      contentType: String
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    tags: [{ type: String }],
    location: { type: String }
  },
  { timestamps: true }
);

// Middleware to remove post from the user's uploadedPosts when deleted
postSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await User.updateOne(
      { _id: doc.userId }, // Find the user by userId
      { $pull: { uploadedPosts: doc._id } } // Remove the post ID from uploadedPosts
    );
  }
});

const Post = mongoose.model("Post", postSchema);
export default Post;
