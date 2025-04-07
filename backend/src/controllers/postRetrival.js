import Post from "../models/post.js";
import User from "../models/user.js";
import asyncHandler from "express-async-handler";

// Home posts endpoint: Combine posts from following and suggested (public) users.
export const getHomePosts = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res.status(401);
    throw new Error("Unauthorized: No token found");
  }
  try {
    // Find the logged in user.
    const user = await User.findOne({ refreshToken });
    if (!user) {
      res.status(401);
      throw new Error("Unauthorized: User not found, please sign in again");
    }

    // 1. Fetch posts from users that the logged-in user is following.
    const followingPosts = await Post.find({ userId: { $in: user.following } }).lean();

    // 2. Determine suggested users.
    // Suggested users are those that are followed by your followers but you do not follow,
    // and whose accounts are public (isPrivate === false).
    let suggestedUsersSet = new Set();
    for (const followerId of user.followers) {
      const follower = await User.findById(followerId).populate("following", "userId name profilePicture isPrivate");
      if (follower && follower.following) {
        follower.following.forEach(follow => {
          // Use the string form of the id for comparison.
          if (
            !user.following.includes(follow._id) &&
            follow._id.toString() !== user._id.toString() &&
            follow.isPrivate === false
          ) {
            suggestedUsersSet.add(follow._id.toString());
          }
        });
      }
    }
    // Fallback: if no suggestions, use some default public users.
    if (suggestedUsersSet.size === 0) {
      const defaultUserIds = ["sivakarthikeyan", "gramsnap", "viratkohli"];
      const defaultUsers = await User.find({ userId: { $in: defaultUserIds }, isPrivate: false }, "userId");
      defaultUsers.forEach(u => {
        suggestedUsersSet.add(u._id.toString());
      });
    }
    const suggestedUserObjectIds = Array.from(suggestedUsersSet);

    // 3. Fetch posts from the suggested users.
    const suggestedPosts = await Post.find({ userId: { $in: suggestedUserObjectIds } }).lean();

    // 4. Merge the two sets of posts and sort them descending by creation date.
    const allPosts = [...followingPosts, ...suggestedPosts];
    allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // 5. Populate user details for each post.
    const postsWithUserDetails = await Promise.all(
      allPosts.map(async post => {
        const postUser = await User.findById(post.userId, "userId name profilePicture");
        return {
          postId: post._id,
          userId: postUser?.userId,
          name: postUser?.name,
          isLiked: post.likes.some(id => id.toString() === user._id.toString()),
          isSaved: user.savedPosts.some(id => id.toString()=== post._id.toString()),
          profilePicture:
            postUser?.profilePicture && postUser.profilePicture.data
              ? `data:${postUser.profilePicture.contentType};base64,${postUser.profilePicture.data.toString("base64")}`
              : null,
          caption: post.caption,
          likes: post.likes ? post.likes.length : 0,
          postPic:
            post.image && post.image.data
              ? `data:${post.image.contentType};base64,${post.image.data.toString("base64")}`
              : null,
          createdAt: post.createdAt,
        };
      })
    );

    res.status(200).json({ homePosts: postsWithUserDetails });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Endpoint to return suggested user accounts (for posts or follow suggestions)
// Only public accounts (isPrivate === false) are returned.
export const suggestedPosts = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  try {
    if (!refreshToken) {
      res.status(401);
      throw new Error("Unauthorized: No token found");
    }
    const user = await User.findOne({ refreshToken }).populate("followers", "following");
    let suggestedUsers = [];
    if (user) {
      const userFollowingIds = new Set(user.following.map(f => f.toString()));
      // Loop through each follower's following list.
      for (const follower of user.followers) {
        const followerDetails = await User.findById(follower._id)
          .select("following isPrivate")
          .populate("following", "userId profilePicture name isPrivate");
        if (followerDetails && followerDetails.following) {
          for (const follow of followerDetails.following) {
            if (
              !userFollowingIds.has(follow._id.toString()) &&
              follow._id.toString() !== user._id.toString() &&
              follow.isPrivate === false
            ) {
              suggestedUsers.push(follow);
            }
          }
        }
      }
      // Remove duplicate suggestions.
      const uniqueSuggested = {};
      suggestedUsers.forEach(u => {
        uniqueSuggested[u._id] = u;
      });
      suggestedUsers = Object.values(uniqueSuggested);
      // Fallback: if no suggestions, use default public users.
      if (suggestedUsers.length === 0) {
        const defaultUserIds = ["sivakarthikeyan", "gramsnap", "viratkohli"];
        suggestedUsers = await User.find({ userId: { $in: defaultUserIds }, isPrivate: false })
          .select("userId profilePicture name");
      }
      suggestedUsers = suggestedUsers.map((userDoc) => {
        const profilePicture = userDoc.profilePicture?.data
          ? `data:${userDoc.profilePicture.contentType};base64,${userDoc.profilePicture.data.toString("base64")}`
          : null;
        return {
          userId: userDoc.userId,
          name: userDoc.name,
          profilePicture,
        };
      });
    } else {
      res.status(401);
      throw new Error("User not found. Sign in again.");
    }
    res.status(200).json({ suggestedPosts: suggestedUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Endpoint to get a single post by its ID.
export const getPost = asyncHandler(async (req, res) => {
  const { postId } = req.body;
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res.status(401);
    throw new Error("Unauthorized: No token found");
  }
  try {
    const user = await User.findOne({ refreshToken });
    if (!user) {
      res.status(401);
      throw new Error("Unauthorized: Sign in again");
    }
    const fetchedPost = await Post.findById(postId).lean();
    if (!fetchedPost) {
      res.status(404);
      throw new Error("Post not found");
    }
    // Populate user details for the post.
    const postUser = await User.findById(fetchedPost.userId, "userId name profilePicture");
    const postData = {
      postId: fetchedPost._id,
      userId: postUser?.userId,
      name: postUser?.name,
      profilePicture:
        postUser?.profilePicture && postUser.profilePicture.data
          ? `data:${postUser.profilePicture.contentType};base64,${postUser.profilePicture.data.toString("base64")}`
          : null,
      caption: fetchedPost.caption,
      likes: fetchedPost.like ? fetchedPost.like.length : 0,
      postPic:
        fetchedPost.image && fetchedPost.image.data
          ? `data:${fetchedPost.image.contentType};base64,${fetchedPost.image.data.toString("base64")}`
          : null,
      createdAt: fetchedPost.createdAt,
    };
    res.status(200).json({ post: postData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
