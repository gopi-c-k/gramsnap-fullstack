import User from "../models/user.js";
import Post from "../models/post.js";
import asyncHandler from "express-async-handler";

export const likePost = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        res.status(401);
        throw new Error("Unauthorized: No token found");
    }

    try {
        const user = await User.findOne({ refreshToken });
        if (!user) {
            res.status(401);
            throw new Error("Unauthorized: User not found, please sign in again");
        }

        const { postId } = req.params; // Get postId from URL
        const post = await Post.findById(postId);

        if (!post) {
            res.status(404);
            throw new Error("Post not found");
        }

        // Check if the user already liked the post
        const alreadyLiked = post.likes.includes(user._id);
        if (alreadyLiked) {
            // Unlike the post
            post.likes = post.likes.filter((id) => id.toString() !== user._id.toString());
        } else {
            // Like the post
            post.likes.push(user._id);
        }


        await post.save();
        res.status(200).json({
            message: alreadyLiked ? "Post unliked" : "Post liked",
            likesCount: post.likes.length,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
