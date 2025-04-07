import CryptoJS from "crypto-js";
import Message from "../models/msgModel.js";
import User from "../models/user.js";

const SECRET_KEY = process.env.SECRET_KEY || "mysecretkey123"; // Store securely

export const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;

    // ✅ Encrypt message before storing
    const encryptedMessage = CryptoJS.AES.encrypt(message, SECRET_KEY).toString();
    const receiver = await User.findOne({ userId: receiverId });
    const newMessage = new Message({
      senderId,
      receiverId,
      message: encryptedMessage,
      status: receiver.online ? "delivered" : "sent",
    });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Failed to send message", error });
  }
};
export const getMessages = async (req, res) => {
  try {
    const { senderId, receiverId, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit; // ✅ Pagination Logic

    // ✅ Fetch latest messages first
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    })
      .sort({ createdAt: -1 }) // 🔥 Latest messages first
      .skip(skip)
      .limit(parseInt(limit));

    // ✅ Decrypt messages before sending
    const decryptedMessages = messages.map((msg) => {
      const bytes = CryptoJS.AES.decrypt(msg.message, SECRET_KEY);
      const originalMessage = bytes.toString(CryptoJS.enc.Utf8);
      return { ...msg._doc, message: originalMessage };
    });

    // ✅ Mark all "delivered" messages as "seen"
    await Message.updateMany(
      { senderId: receiverId, receiverId: senderId, status: "delivered" },
      { $set: { status: "seen" } }
    );

    res.status(200).json({
      messages: decryptedMessages.reverse(), // Now ordered from newest to oldest
      currentPage: page,
      totalPages: Math.ceil((await Message.countDocuments()) / limit),
    });

  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve messages", error });
  }
};
