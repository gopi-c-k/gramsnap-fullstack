import User from "../models/user.js";
import asyncHandler from "express-async-handler";

export const getFollowers = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        res.status(401);
        throw new Error("Unauthorized: No token found");
    }
    try {
        const Check = await User.findOne({ refreshToken });
        if (!Check) {
            res.status(401);
            throw new Error("Unauthorized: User not found, please sign in again");
        }
        const { userId } = req.query;

        // Find user by userId
        const user = await User.findOne({ userId }).populate("followers", "userId name profilePicture");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const followersWithProfilePics = user.followers.map(follower => {
            let profilePictureBase64 = null;

            if (follower.profilePicture?.data) {
                profilePictureBase64 = `data:${follower.profilePicture.contentType};base64,${Buffer.from(follower.profilePicture.data).toString("base64")}`;
            }

            return {
                userId: follower.userId,
                name: follower.name,
                profilePicture: profilePictureBase64,
            };
        });

        res.status(200).json(followersWithProfilePics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
export const getFollowing = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        res.status(401);
        throw new Error("Unauthorized: No token founds");
    }
    try {
        const Check = await User.findOne({ refreshToken });
        if (!Check) {
            res.status(401);
            throw new Error("Unauthorized: User not found, please sign in again");
        }
        const { userId } = req.query;

        // Find user by userId
        const user = await User.findOne({ userId }).populate("following", "userId name profilePicture");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const followingWithProfilePics = user.following.map(follower => {
            let profilePictureBase64 = null;

            if (follower.profilePicture?.data) {
                profilePictureBase64 = `data:${follower.profilePicture.contentType};base64,${Buffer.from(follower.profilePicture.data).toString("base64")}`;
            }

            return {
                userId: follower.userId,
                name: follower.name,
                profilePicture: profilePictureBase64,
            };
        });

        res.status(200).json(followingWithProfilePics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
