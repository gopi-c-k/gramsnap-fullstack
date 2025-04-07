import express from "express";
import { savePost } from "../controllers/savePost.js";
import { likePost } from "../controllers/likePost.js";
import { commentPost } from "../controllers/post/commentPost.js";
import { getUserStatus } from "../controllers/userController.js";
import { retrievePost } from "../controllers/post/retrievePost.js";
import { retrievePostImage } from "../controllers/post/retrievePostImage.js";
import { signIn, refreshToken } from "../controllers/signIn.js";
import { signUp, sendOTP } from "../controllers/signUp.js";
import { updateUser, upload } from "../controllers/profileUpdation.js";
import authMiddleware from "../middlewares/authMiddleWare.js";
import { getProfile } from "../controllers/getProfile.js";
import { uploadPost, createPost } from "../controllers/addPost.js";
import { Search } from "../controllers/search.js";
import { followRequest } from "../controllers/followRequest.js";
import { getNotifications } from "../controllers/notification.js";
import { acceptFollowRequest } from "../controllers/followRequestAccept.js";
import { suggestedFollowers } from "../controllers/suggestion.js";
import { getPost,getHomePosts,suggestedPosts } from "../controllers/postRetrival.js";
import { commentRetrieve } from "../controllers/post/commentRetrieve.js";
import { getFollowers,getFollowing } from "../controllers/fControl.js";
const router = express.Router();

// // Story
// router.post("/story/create", createStory);
// router.get("/story/get",getStories);
// router.get("/story/view", getStory);

// Register a new user
router.post("/signup", signUp);
router.get("/notifications", getNotifications);
router.get("/suggestions",suggestedFollowers);
router.get("/status/:userId", getUserStatus); 
router.get("/user/followers",getFollowers);
router.get("/user/following",getFollowing);


// Post Suggestion
router.get("/home",getHomePosts);

// Follow
router.post("/followRequest", followRequest);
router.post("/accept-follow", acceptFollowRequest)

//Profile
router.put("/update", upload.single("profilePicture"), updateUser);
router.get("/profile/:userId", getProfile);

//Posts
router.post("/createPost", uploadPost.single("image"), createPost);
router.get("/post/:postId", retrievePost );
router.get("/post/:postId/comment", commentRetrieve );
router.put("/:postId/like", likePost);
router.put("/:postId/save", savePost);
router.post("/:postId/comment", commentPost);
router.get("/:postId/image", retrievePostImage);


// Search
router.post("/search/:searchTerms", Search);

// Login user
router.post("/login", signIn);
router.post("/login-refresh", refreshToken);
router.post("/sendOTP", sendOTP);
router.get('/protected', authMiddleware, (req, res) => {
  res.status(200).json({
    message: 'This is protected data!',
    user: req.user, // This contains the decoded JWT data (e.g., userId, email, etc.)
  });
});


export default router;
