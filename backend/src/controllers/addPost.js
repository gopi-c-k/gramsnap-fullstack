import User from "../models/user.js";
import asyncHandler from "express-async-handler";
import fs from "fs";
import path from "path";
import multer from "multer";
import Post from "../models/post.js";

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    },
});

const uploadPost = multer({ storage: storage });

// @desc    Create a new post
// @route   POST /api/posts/create
// @access  Private
export const createPost = asyncHandler(async (req, res) => {
    const { userId, caption } = req.body;
    const refreshToken = req.cookies.refreshToken;

    try {
        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token provided" });
        }

        // Verify refresh token in the database
        const userForVerify = await User.findOne({ refreshToken });
        const userForPost = await User.findOne({ userId });

        if (!userForPost || !userForVerify) {
            return res.status(404).json({ message: "User not found" });
        }

        // Ensure the logged-in user is the same as the post creator
        if (userForVerify._id.toString() !== userForPost._id.toString()) {
            return res.status(403).json({ message: "Unauthorized action" });
        }

        // Create new post
        const newPost = new Post({
            userId: userForPost,
            caption
        });

        if (req.file) {
            newPost.image = {
                data: fs.readFileSync(req.file.path),
                contentType: req.file.mimetype,
            };

            // **Delete the uploaded file after saving to MongoDB**
            fs.unlinkSync(req.file.path);
        }

        // Save the post
        await newPost.save();

        // Add post ID to user's uploadedPosts array
        userForPost.uploadedPosts.push(newPost._id);
        await userForPost.save();

        res.status(201).json({ message: "Post created successfully!", post: newPost });
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ message: "Error creating post", error: error.message });
    }
});

export { uploadPost };
