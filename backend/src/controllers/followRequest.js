import User from "../models/user.js";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";  // Import mongoose to validate ObjectId

export const followRequest = asyncHandler(async (req, res) => {
    const { followRequestUserId } = req.body;
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: "Unauthorized: No token found" });
    }

    try {
        // Verify the JWT and extract the user ID
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const mainUserId = decoded?.userId;

        if (!mainUserId) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        console.log("Main user ID:", mainUserId);
        console.log("Follow request for user ID:", followRequestUserId);

        // Check if IDs are valid MongoDB ObjectIds
        const isValidMainUserId = mongoose.Types.ObjectId.isValid(mainUserId);
        const isValidFollowRequestUserId = mongoose.Types.ObjectId.isValid(followRequestUserId);

        let mainUser, requestedUser;

        if (isValidMainUserId) {
            mainUser = await User.findById(mainUserId);
        } else {
            mainUser = await User.findOne({ userId: mainUserId }); // If not an ObjectId, search by userId
        }

        if (isValidFollowRequestUserId) {
            requestedUser = await User.findById(followRequestUserId);
        } else {
            requestedUser = await User.findOne({ userId: followRequestUserId });
        }

        if (!mainUser) {
            return res.status(404).json({ message: "Authenticated user not found" });
        }

        if (!requestedUser) {
            return res.status(404).json({ message: "Requested user not found" });
        }

        console.log(`Follow request API called from ${mainUser.userId} to ${requestedUser.userId}`);

        if (mainUser._id.equals(requestedUser._id)) {
            return res.status(400).json({ message: "Cannot follow yourself" });
        }

        if (requestedUser.isPrivate) {
            // Send follow request only if it's not already in the list
            if (!requestedUser.followRequests?.includes(mainUser._id)) {
                await User.findByIdAndUpdate(requestedUser._id, {
                    $push: {
                        followerRequests: mainUser._id,
                        notifications: {
                            type: "followRequest",
                            message: ` wants to follow you.`,
                            senderId: mainUser._id,
                            isRead: false,
                            createdAt: new Date(),
                        },
                    },
                });
            }
            return res.status(200).json({ message: "Follow request sent" });
        } else {
            // Follow instantly for public profiles
            if (!requestedUser.followers?.includes(mainUser._id)) {
                await User.findByIdAndUpdate(requestedUser._id, {
                    $push: {
                        followers: mainUser._id,
                        notifications: {
                            type: "following",
                            message: ` followed you.`,
                            senderId: mainUser._id,
                            isRead: false,
                            createdAt: new Date(),
                        },
                    },
                });
            }
            if (!mainUser.following.includes(requestedUser._id)) {
                await User.findByIdAndUpdate(mainUser._id, { $push: { following: requestedUser._id } });
            }

            return res.status(200).json({ message: "Followed Successfully!" });
        }
    } catch (error) {
        console.error("Error while processing follow request:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
});
