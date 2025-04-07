import Post from "../../models/post.js";
import User from "../../models/user.js";
import Comment from "../../models/comment.js";
import asyncHandler from "express-async-handler";

export const commentPost = asyncHandler(async (req, res) => {
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
        const { postId } = req.params;
        const post = await Post.findById(postId)
        const { text } = req.body;

        if (!text.trim()) {
            res.status(400);
            throw new Error("Comment text cannot be empty");
        }
        const newComment = new Comment({
            userId: user._id,
            postId: post._id,
            text: text
        });

        await newComment.save();
        post.comments.push(newComment._id);
        await post.save();

        // Populate user details in the response
        const populatedComment = await Comment.findById(newComment._id)
            .populate("userId", "userId name profilePicture")
            .lean();
        if (populatedComment?.userId?.profilePicture) {
            const profilePic = populatedComment.userId.profilePicture;
            if (typeof profilePic === "string") {
                // Already in base64 format, use as is
                populatedComment.userId.profilePicture = profilePic;
            } else if (profilePic?.data && profilePic?.contentType) {
                // Convert buffer to base64
                populatedComment.userId.profilePicture = `data:${profilePic.contentType};base64,${profilePic.data.toString("base64")}`;
            }
        }


        res.status(201).json({ message: "Comment added", comment: populatedComment });

    } catch (error) {
        console.log("Error occured while commenting", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
})