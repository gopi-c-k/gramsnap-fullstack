import User from "../models/user.js";
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

const upload = multer({ storage: storage });

// @desc    Update user profile
// @route   PUT /api/users/update
// @access  Private
export const updateUser = asyncHandler(async (req, res) => {
    const { name, bio, isPrivate } = req.body;
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        res.status(401);
        throw new Error("No refresh token provided");
    }

    // Check if the refresh token exists in the database for the current user
    const user = await User.findOne({ refreshToken });
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    // Update fields if provided
    if (name) user.name = name;
    if (bio) user.bio = bio;
    user.isPrivate = isPrivate;
    if (req.body.newUserId) {
        const existingUser = await User.findOne({ userId: req.body.newUserId });
        if (existingUser) {
            res.status(400);
            throw new Error("User ID already exists");
        }
        user.userId = req.body.newUserId;
    }

    // Handle profile picture upload
    if (req.file) {
        user.profilePicture = {
            data: fs.readFileSync(req.file.path),
            contentType: req.file.mimetype,
        };
    }

    await user.save();

    res.status(200).json({
        message: "Profile updated successfully",
        userId: user.userId,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture ? `data:${user.profilePicture.contentType};base64,${user.profilePicture.data.toString("base64")}` : null,
    });
});

export { upload };
