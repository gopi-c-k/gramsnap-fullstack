import User from "../models/user.js";
import asyncHandler from "express-async-handler";

export const Search = asyncHandler(async (req, res) => {
    const { searchTerms } = req.params;

    if (!searchTerms) {
        return res.status(400).json({ message: "Search term is required" });
    }

    try {
        const users = await User.find({
            $or: [
                { userId: { $regex: `^${searchTerms}`, $options: "i" } },  // Match from start
                { name: { $regex: `^${searchTerms}`, $options: "i" } }    // Match from start
            ]
        });
        const resultUsers = users.map((use) => {
            return {
                userId: use.userId,
                name: use.name,
                profilePicture: use?.profilePicture?.data
                    ? `data:${use.profilePicture.contentType};base64,${use.profilePicture.data.toString("base64")}`
                    : null
            }
        })
        res.status(200).json(resultUsers);
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
});
