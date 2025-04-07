import Story from "../../models/story.js";
import User from "../../models/user.js";
import asyncHandler from "express-async-handler";
import fs from "fs";
import path from "path";
import multer from "multer";

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    },
});

const uploadStory = multer({ storage: storage });
export const createStory = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    // console.log("Create Story Function Called");
    // console.log(userId);
    // console.log(req.body);
    const refreshToken = req.cookies.refreshToken;
    // console.log(refreshToken);

    try {
        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token provided" });
        }

        // Verify user from refresh token
        const userForVerify = await User.findOne({ refreshToken });
        const userForStory = await User.findOne({ userId });

        if (!userForStory || !userForVerify) {
            return res.status(404).json({ message: "User not found" });
        }

        // Ensure the logged-in user is the same as the story creator
        if (userForVerify._id.toString() !== userForStory._id.toString()) {
            return res.status(403).json({ message: "Unauthorized action" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Story image is required" });
        }

        // Create new story
        const newStory = new Story({
            userId: userForStory._id,
            image: {
                data: fs.readFileSync(req.file.path),
                contentType: req.file.mimetype,
            },
        });

        // Delete the uploaded file after saving to MongoDB
        fs.unlinkSync(req.file.path);

        // Save the story
        await newStory.save();

        res.status(201).json({ message: "Story created successfully!", story: newStory });
    } catch (error) {
        console.error("Error creating story:", error);
        res.status(500).json({ message: "Error creating story", error: error.message });
    }
});

export { uploadStory };
