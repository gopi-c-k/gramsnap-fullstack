import User from "../models/user.js";
import asyncHandler from "express-async-handler";

export const suggestedFollowers = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    
    try {
        if (!refreshToken) {
            res.status(401);
            throw new Error("Unauthorized: No token found");
        }

        // Find the logged-in user and populate their followers and following lists
        const user = await User.findOne({ refreshToken }).populate("followers", "following");
        if (!user) {
            res.status(401);
            throw new Error("User not found. Sign in again.");
        }

        const userFollowing = new Set(user.following.map(f => f.toString())); // Convert following list to a Set for quick lookup
        let suggestedUsers = new Set();

        // Loop through followers to find potential suggestions
        for (const follower of user.followers) {
            const followerDetails = await User.findById(follower._id)
                .select("following")
                .populate("following", "userId profilePicture name");

            for (const follow of followerDetails.following) {
                if (!userFollowing.has(follow._id.toString()) && follow._id.toString() !== user._id.toString()) {
                    suggestedUsers.add(JSON.stringify(follow)); // Store unique users
                }
            }
        }

        // Convert Set to an array of objects
        suggestedUsers = Array.from(suggestedUsers).map(user => JSON.parse(user));

        // If no suggestions are found, fetch details of default users
        if (suggestedUsers.length === 0) {
            const defaultUserIds = ["sivakarthikeyan", "gramsnap", "viratkohli"];
            suggestedUsers = await User.find({ userId: { $in: defaultUserIds } })
                .select("userId profilePicture name");
        }
        suggestedUsers = suggestedUsers.map((basedOnUserId) => {
            const profilePicture = basedOnUserId.profilePicture?.data
                ? `data:${basedOnUserId.profilePicture.contentType};base64,${basedOnUserId.profilePicture.data.toString("base64")}`
                : null;

            return {
                userId: basedOnUserId.userId,
                name: basedOnUserId.name,
                profilePicture,
            };
        });
        res.status(200).json({ suggestions: suggestedUsers });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
