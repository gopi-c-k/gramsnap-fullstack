import mongoose from "mongoose";
import CryptoJS from "crypto-js";
import Message from "../models/msgModel.js";
import User from "../models/user.js";

const SECRET_KEY = process.env.SECRET_KEY || "mysecretkey123"; // Store securely

export const getUserConversations = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Chat list function called. UserID:", userId);

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // ✅ Fetch latest message per conversation
    const conversations = await Message.aggregate([
      {
        $match: { $or: [{ senderId: userId }, { receiverId: userId }] },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$senderId", userId] }, "$receiverId", "$senderId"],
          },
          lastMessage: { $first: "$message" },
          status: { $first: "$status" },
          createdAt: { $first: "$createdAt" },
        },
      },
    ]);

    // ✅ Fetch user details including profile pictures
    const userIds = conversations.map((conv) => conv._id);
    const users = await User.find({ userId: { $in: userIds } }, "userId name profilePicture online lastSeen");

    // ✅ Convert users array into an object for quick lookup
    const userMap = {};
    users.forEach((user) => {
      userMap[user.userId] = {
        username: user.name,
        online: user.online,
        lastSeen: user.lastSeen,
        profilePicture:
          user.profilePicture?.data
            ? `data:${user.profilePicture.contentType};base64,${user.profilePicture.data.toString("base64")}`
            : null,
      };
    });

    // ✅ Decrypt last messages and attach user details
    const decryptedConversations = conversations.map((conv) => {
      let decryptedMessage = "Message could not be decrypted";
      try {
        const bytes = CryptoJS.AES.decrypt(conv.lastMessage, SECRET_KEY);
        decryptedMessage = bytes.toString(CryptoJS.enc.Utf8) || decryptedMessage;
      } catch (error) {
        console.error("Decryption failed for message:", conv.lastMessage);
      }
        // ✅ Convert UTC to GMT+5:30 (IST)
    const utcDate = new Date(conv.createdAt);
    const istDate = new Date(utcDate.getTime()); // ✅ Add 5 hours 30 minutes

      return {
        userId: conv._id,
        username: userMap[conv._id]?.username || "Unknown User",
        profilePicture: userMap[conv._id]?.profilePicture || null,
        lastMessage: decryptedMessage,
        online: userMap[conv._id]?.online || false,
        lastSeen: userMap[conv._id]?.lastSeen || istDate,
        status: conv.status,
        createdAt: istDate, // ✅ Now in GMT+5:30
        formattedDate: istDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
      };
    }).sort((a, b) => b.createdAt - a.createdAt);

    console.log("Conversations founds");
    res.status(200).json(decryptedConversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Failed to retrieve conversations", error });
  }
};
