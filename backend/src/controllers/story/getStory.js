import Story from "../../models/story.js";
import User from "../../models/user.js";
import asyncHandler from "express-async-handler";

// @desc    Get a specific story by storyId and update views
// @route   GET /api/stories/:storyId
// @access  Private
export const getStory = asyncHandler(async (req, res) => {
    const { storyId } = req.params;
    const refreshToken = req.cookies.refreshToken;
    console.log("getStory Function Called");

    try {
        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token provided" });
        }

        // Find user by refresh token
        const user = await User.findOne({ refreshToken });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find the story by storyId
        const story = await Story.findById(storyId).populate("userId", "userId name profilePicture");

        if (!story) {
            return res.status(404).json({ message: "Story not found" });
        }

        // If the logged-in user is the story owner, return the viewer list
        if (story.userId._id.toString() === user._id.toString()) {
            const viewers = await User.find({ userId: { $in: Array.from(story.views) } })
                .select("userId name profilePicture");

            const viewersData = await Promise.all(story.views.map(async (viewerId) => {
                const users = await User.findById(viewerId);
                if (!users) return null; // Handle cases where the user is not found

                return {
                    userId: users.userId, // Fix: Correctly accessing user ID
                    userName: users.name,
                    userProfilePic: users?.profilePicture?.data
                        ? `data:${users?.profilePicture?.contentType};base64,${users?.profilePicture?.data.toString("base64")}`
                        : null // Handle missing profile picture
                };
            }));

            return res.status(200).json({
                userId: story.userId.userId, // Fix userId reference
                userName: story.userId.name,
                userProfilePic: story.userId?.profilePicture?.data ? `data:${story.userId?.profilePicture?.contentType};base64,${story.userId.profilePicture.data.toString("base64")}`: null,
                storyImage: `data:${story.image.contentType};base64,${story.image.data.toString("base64")}`,
                createdAt: story.createdAt,
                viewers: viewersData.filter(v => v !== null) // Remove null values
            });

        }

        // If the logged-in user is NOT the story owner, update views
        if (!story.views.some(viewerId => viewerId.toString() === user._id.toString())) {
            story.views.push(user._id); // Add userId to views
            await story.save();
        }


        // Prepare response for a normal user
        res.status(200).json({
            userId: story.userId.userId,
            userName: story.userId.name,
            userProfilePic: story.userId?.profilePicture?.data ? `data:${story.userId?.profilePicture?.contentType};base64,${story.userId.profilePicture.data.toString("base64")}`: null,
            storyImage: `data:${story.image.contentType};base64,${story.image.data.toString("base64")}`,
            createdAt: story.createdAt
        });

    } catch (error) {
        console.error("Error fetching story:", error);
        res.status(500).json({ message: "Error fetching story", error: error.message });
    }
});
