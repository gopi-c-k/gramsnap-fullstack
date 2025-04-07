import Post from "../../models/post.js";
import User from "../../models/user.js";
import Comment from "../../models/comment.js";
import asyncHandler from "express-async-handler";

export const commentRetrieve = asyncHandler(async (req, res) => {
    try {
        const { postId } = req.params;

        // Find the post and get the comments array (which contains comment IDs)
        const post = await Post.findById(postId);
        if (!post) {
            res.status(404);
            throw new Error("Post not found");
        }

        // Retrieve and populate all comments
        const populatedComments = await Promise.all(
            post.comments.map(async (commentId) => {
                const comment = await Comment.findById(commentId)
                    .populate("userId", "userId name profilePicture")
                    .lean();

                // Convert profilePicture to base64 if it exists
                if (comment?.userId?.profilePicture?.data) {
                    comment.userId.profilePicture = `data:${comment.userId.profilePicture.contentType};base64,${comment.userId.profilePicture.data.toString("base64")}`;
                }

                return comment;
            })
        );

        res.status(200).json({ message: "Comments retrieved", comments: populatedComments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
