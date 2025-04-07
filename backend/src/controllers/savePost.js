import User from "../models/user.js";
import Post from "../models/post.js";
import asyncHandler from "express-async-handler";

export const savePost = asyncHandler(async (req, res) => {
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
        const alreadyLiked = user.savedPosts.includes(post._id);
        if (alreadyLiked) {
            // Unlike the post
            user.savedPosts = user.savedPosts.filter((id) => id.toString() !== post._id.toString());
        } else {
            // Like the post
            user.savedPosts.push(post._id);
        }


        await user.save();
        res.status(200).json({
            message: alreadyLiked ? "Post unsaved" : "Post saved",
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
