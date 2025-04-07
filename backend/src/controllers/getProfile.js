import User from "../models/user.js";
import asyncHandler from "express-async-handler";
import Post from "../models/post.js";
import { followRequest } from "./followRequest.js";

export const getProfile = asyncHandler(async (req, res) => {

    const { userId } = req.params;
    const refreshToken = req.cookies.refreshToken;
    if (!userId && !refreshToken) {
        return res.status(400).json({ message: "User ID or refresh token is required" });
    }

    const basedOnUserId = userId ? await User.findOne({ userId }).populate("uploadedPosts") : null;
    const basedOnRefreshToken = refreshToken ? await User.findOne({ refreshToken }) : null;

    if (!basedOnUserId) {
        return res.status(404).json({ message: "User not found" });
    }
    if (!basedOnRefreshToken) {
        return res.status(404).json({ message: "Inavlid access try to sign in again" });
    }
    // console.log(basedOnUserId._id.toString());
    // console.log(basedOnRefreshToken?._id.toString());
    console.log("Get Profile API called from " + basedOnRefreshToken.userId + " to " + userId)
    const sameUser = basedOnUserId._id.toString() === basedOnRefreshToken?._id.toString();
    const isFollowing = basedOnRefreshToken
        ? basedOnUserId.followers.some(follower => follower.toString() === basedOnRefreshToken._id.toString())
        : false;

    const profilePicture = basedOnUserId.profilePicture?.data
        ? `data:${basedOnUserId.profilePicture.contentType};base64,${basedOnUserId.profilePicture.data.toString("base64")}`
        : null;

    // Fetch images for all posts asynchronously
    const formattedPosts = await Promise.all(
        basedOnUserId.uploadedPosts.map(async (post) => {
            const postForImage = await Post.findById(post._id);
            return {
                postId: post._id,
                image: postForImage?.image?.data
                    ? `data:${postForImage.image.contentType};base64,${postForImage.image.data.toString("base64")}`
                    : null
            };
        })
    );
    const request = basedOnRefreshToken && !isFollowing ? basedOnUserId.followerRequests.some(requester => requester.toString() === basedOnRefreshToken._id.toString()) : false;

    const response = {
        userId: basedOnUserId.userId,
        name: basedOnUserId.name,
        bio: basedOnUserId.bio,
        followingSize: basedOnUserId.following.length,
        followersSize: basedOnUserId.followers.length,
        postSize: basedOnUserId.uploadedPosts.length,
        profilePicture,
        isRequestSent: request,
        isFollow: isFollowing,
        isSame: sameUser
    };

    if (!sameUser && basedOnUserId.isPrivate && !isFollowing) {
        response.isPrivate = true;
    } else {
        response.posts = formattedPosts;
    }

    res.status(200).json(response);
});
