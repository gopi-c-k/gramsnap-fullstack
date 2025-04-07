import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  type: { type: String, enum: ["followRequest", "like", "comment","following"], required: true },
  message: { type: String, required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const gramSnapUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    profilePicture: {
      data: Buffer,
      contentType: String
    },
    bio: { type: String, maxLength: 200 },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followerRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    uploadedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    isPrivate: { type: Boolean, default:false},
    online: { type: Boolean, default: false }, // ✅ Track online status
    lastSeen: { type: Date, default: null }, 
    refreshToken: { type: String },
    notifications: [NotificationSchema]
  },
  { timestamps: true }
);

const gramSnapUser = mongoose.model("User", gramSnapUserSchema);
export default gramSnapUser;
