import User from "../models/user.js"; // ✅ Correct
import asyncHandler from "express-async-handler";

export const getUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ userId }).select("online lastSeen");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      userId,
      online: user.online,
      lastSeen: user.lastSeen,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user status", error });
  }
};
