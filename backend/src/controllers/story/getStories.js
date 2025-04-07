import Story from "../../models/story.js";
import User from "../../models/user.js";
import asyncHandler from "express-async-handler";

// @desc    Get stories from following users
// @route   GET /api/stories
// @access  Private
export const getStories = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    console.log("getStories Function Called");
    // console.log(refreshToken);
    try {
        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token provided" });
        }

        // Find user by refresh token
        const user = await User.findOne({ refreshToken }).populate("following");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get userIds of following users
        const followingIds = user.following.map(follow => follow._id);

        // Include logged-in user's story (if exists)
        followingIds.push(user._id);

        // Fetch stories from users in the following list
        let stories = await Story.find({ userId: { $in: followingIds } })
            .populate("userId", "userId name profilePicture")
            .select("image createdAt userId views");

        // Transform response with isViewed flag
        let response = stories.map(story => ({
            storyId: story._id,
            userId: story.userId.userId,
            userName: story.userId.name,
            userProfilePic: story.userId?.profilePicture?.data ? `data:${story.userId?.profilePicture?.contentType};base64,${story.userId.profilePicture.data.toString("base64")}`: null,
            storyImage: `data:${story.image.contentType};base64,${story.image.data.toString("base64")}`,
            createdAt: story.createdAt,
            isViewed : story.views.some(viewerId => viewerId.toString() === user._id.toString())
// Check if the user has already viewed it
        }));

        // Sort stories:
        // 1. User's own story first (if exists)
        // 2. Unviewed stories (newest first)
        // 3. Viewed stories (oldest first)
        response.sort((a, b) => {
            if (a.userId.toString() === user.userId.toString()) return -1; // User's own story first
            if (b.userId.toString() === user.userId.toString()) return 1;
            if (a.isViewed === b.isViewed) return new Date(b.createdAt) - new Date(a.createdAt); // Sort by newest
            return a.isViewed ? 1 : -1; // Unviewed first
        });

        res.status(200).json(response);
    } catch (error) {
        console.error("Error fetching stories:", error);
        res.status(500).json({ message: "Error fetching stories", error: error.message });
    }
});
