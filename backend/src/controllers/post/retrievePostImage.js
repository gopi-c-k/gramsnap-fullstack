import Post from "../../models/post.js";
import asyncHandler from "express-async-handler";

export const retrievePostImage = asyncHandler(async (req,res) => {
    try {
        const { postId } = req.params;
        const post = await Post.findById(postId);

        if (!post || !post.image || !post.image.data) {
            return res.status(404).send("Image not found");
        }

        res.set("Content-Type", post.image.contentType);
        res.send(post.image.data);
    } catch (error) {
        res.status(500).send("Error retrieving image");
    }
})
// Route to serve post images
// router.get("/:postId/image", async (req, res) => {
   
// });

