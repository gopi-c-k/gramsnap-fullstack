import mongoose from "mongoose";
import User from "../models/user.js";
import asyncHandler from "express-async-handler";

export const acceptFollowRequest = asyncHandler(async (req, res) => {
    const { senderId } = req.body; // senderId might be userId, not ObjectId
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: "Unauthorized: No token found" });
    }

    try {
        const user = await User.findOne({ refreshToken });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let senderUser;

        // ✅ Check if senderId is a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(senderId)) {
            senderUser = await User.findById(senderId);
        } else {
            senderUser = await User.findOne({ userId: senderId }); // Find by userId
        }

        if (!senderUser) {
            return res.status(404).json({ message: "Sender user not found" });
        }

        // ✅ Remove from followerRequests & Add to followers
        await User.findByIdAndUpdate(user._id, {
            $pull: { 
                followerRequests: senderUser._id,
                notifications: { senderId: senderUser._id, type: "followRequest" } // Remove old notification
            },
            $push: { followers: senderUser._id },
        });

        // ✅ Add current user to sender's following list & Send a new notification
        await User.findByIdAndUpdate(senderUser._id, {
            $push: {
                following: user._id,
                notifications: {
                    type: "following",
                    message: ` accepted your follow request!`,
                    senderId: user._id,
                    isRead: false,
                    createdAt: new Date(),
                },
            },
        });

        // ✅ Fetch updated notifications including profile pictures
        const updatedUser = await User.findById(senderUser._id)
            .populate("notifications.senderId", "name userId profilePicture");

        // ✅ Format notifications with base64 profile pictures
        const notificationsWithProfilePics = updatedUser.notifications.map(notification => {
            let profilePicture = null;
            if (notification.senderId.profilePicture?.data) {
                profilePicture = `data:${notification.senderId.profilePicture.contentType};base64,${notification.senderId.profilePicture.data.toString("base64")}`;
            }
            return {
                ...notification._doc,
                senderId: {
                    userId: notification.senderId.userId,
                    name: notification.senderId.name,
                    profilePicture,
                },
            };
        });

        res.status(200).json({
            message: "Follow request accepted, notification sent!",
            notifications: notificationsWithProfilePics,
        });

    } catch (error) {
        console.error("Error accepting follow request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
