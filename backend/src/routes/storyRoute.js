import express from "express";
import { createStory,uploadStory } from "../controllers/story/createStory.js";
import { getStories } from "../controllers/story/getStories.js";
import { getStory } from "../controllers/story/getStory.js";
const router = express.Router();

router.post("/create",uploadStory.single("image"), createStory);
router.get("/get",getStories);
router.get("/:storyId", getStory);


export default router;
