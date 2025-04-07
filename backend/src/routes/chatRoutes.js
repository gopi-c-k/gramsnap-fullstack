import express from "express";
import { sendMessage, getMessages } from "../controllers/chatControls.js";
import { getUserConversations } from "../controllers/chatList.js";

const router = express.Router();

router.post("/send", sendMessage);
router.get("/messages", (req, res) => getMessages(req, res, req.io));
router.get("/conversations/:userId", getUserConversations);


export default router;
