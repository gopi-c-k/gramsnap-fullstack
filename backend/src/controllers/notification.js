import User from "../models/user.js";
import asyncHandler from "express-async-handler";

export const getNotifications = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    try {
        if (!refreshToken) {
            res.status(401);
            throw new Error("Unauthorized: No token found");
        }

        const user = await User.findOne({ refreshToken })
            .populate("notifications.senderId", "name userId profilePicture");

        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }

        // Convert profilePicture to base64
        const notificationsWithProfilePics = user.notifications.map(notification => {
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

        res.status(200).json(notificationsWithProfilePics);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Error fetching notifications", error: error.message });
    }
});
