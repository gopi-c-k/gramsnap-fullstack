import Post from "../../models/post.js";
import User from "../../models/user.js";
import asyncHandler from "express-async-handler";

export const retrievePost = asyncHandler(async (req, res) => {
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
            .populate("userId", "userId name profilePicture") // Populate user details
            .lean();

        if (!post) {
            return res.status(404).json({ message: "Post Not Found" });
        }

        // Convert profile picture buffer to Base64 if available
        const profilePicBase64 = post.userId?.profilePicture?.data
            ? `data:${post.userId.profilePicture.contentType};base64,${post.userId.profilePicture.data.toString("base64")}`
            : "https://gram-snap.vercel.app/default-profile.png"; // Default image
        const temp = post.userId;

        res.status(200).json({
            _id: post._id,
            userId: temp?.userId || null,
            username: post.userId?.name || "Anonymous",
            profilePic: profilePicBase64,
            isLiked: post.likes.some(id => id.toString() === user._id.toString()),
            isSaved: user.savedPosts.some(id => id.toString()=== post._id.toString()),
            likes: post.likes ? post.likes.length : 0,
            title: post.caption || "Untitled Post",
            description: post.description || "",
            image: post.image
                ? `https://gramsnap-backend-bj65.onrender.com/${postId}/image`
                : "https://gram-snap.vercel.app/default-image.jpg",
            comments: post.comments || [],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
