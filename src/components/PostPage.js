import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Avatar, Typography, TextField, Button, IconButton } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import SendIcon from "@mui/icons-material/Send";
import { useMediaQuery } from "@mui/material";
import BookmarksOutlinedIcon from "@mui/icons-material/BookmarksOutlined";
import updateMetaTags from "./updateMetaTag";

export default function PostPage({ postId: propPostId, prefersDarkModes }) {
    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
    const { postId: urlPostId } = useParams();
    const postId = propPostId || urlPostId;
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);
    
    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth > 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const fetchPost = useCallback(async () => {
        if (!postId) return;
        try {
            const res = await axios.get(`https://gramsnap-backend.onrender.com/post/${postId}`, { withCredentials: true });
            setPost(res.data);
            setComments(res.data.comments || []);
            updateMetaTags(`${res.data.title} | GramSnap`, res.data.description || "Check out this post on GramSnap", res.data.image);
        } catch (error) {
            console.error("Error fetching post:", error);
        }
    }, [postId]);

    useEffect(() => {
        fetchPost();
    }, [fetchPost]);

    const handleCommentSubmit = async () => {
        if (!commentText.trim()) return;
        try {
            const res = await axios.post(`https://gramsnap-backend.onrender.com/post/${postId}/comment`, { text: commentText }, { withCredentials: true });
            setComments(res.data.comments);
            setCommentText("");
        } catch (error) {
            console.error("Error posting comment:", error);
        }
    };

    if (!post) {
        return (
            <Box sx={{ textAlign: "center", mt: 4 }}>
                <Typography variant="h6">Post Not Found</Typography>
                <Button variant="contained" color="primary" onClick={() => navigate("/home")} sx={{ mt: 2 }}>
                    Go to Home
                </Button>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: isDesktop ? "row" : "column",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "90vh",
                width: isDesktop ? "70vw" : "90vw",
                margin: "auto",
                borderRadius: "10px",
                backgroundColor: prefersDarkMode ? "#222" : "#fff",
                boxShadow: !prefersDarkMode && "0px 4px 8px rgba(0, 0, 0, 0.1)",
                overflow: "hidden",
            }}
        >
            {/* Left Side - Post Image & Interactions */}
            <Box
                sx={{
                    width: isDesktop ? "60%" : "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: isDesktop ? "20px" : "10px",
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: "10px", mb: 1, width: "100%" }}>
                    <Avatar src={post.profilePic} />
                    <Typography sx={{ fontWeight: 600, color: prefersDarkMode ? "#fff" : "#222" }}>
                        {post.username}
                    </Typography>
                </Box>

                <img
                    src={post.image}
                    alt="Post"
                    style={{
                        width: "100%",
                        height: "auto",
                        maxHeight: "500px",
                        objectFit: "cover",
                        borderRadius: "5px",
                    }}
                />

                {/* Likes & Actions */}
                <Box sx={{ display: "flex", alignItems: "center", gap: "6px", mt: 1 }}>
                    <IconButton>
                        {post.isLiked ? <FavoriteIcon sx={{ color: "red" }} /> : <FavoriteBorderIcon sx={{ color: prefersDarkMode ? "#bbb" : "#777" }} />}
                    </IconButton>
                    <Typography sx={{ fontWeight: 400, color: prefersDarkMode ? "#fff" : "#222" }}>{post.likes}</Typography>
                    <Box sx={{ display: "flex", gap: "6px", ml: "auto" }}>
                        <SendIcon sx={{ fontSize: 24, color: prefersDarkMode ? "#bbb" : "#777" }} />
                        <BookmarksOutlinedIcon sx={{ fontSize: 24, color: prefersDarkMode ? "#bbb" : "#777" }} />
                    </Box>
                </Box>

                {/* Caption */}
                <Typography variant="body2" sx={{ color: prefersDarkMode ? "#ddd" : "#333", mt: 1, width: "100%" }}>
                    <strong>{post.username}</strong> {post.caption}
                </Typography>
            </Box>

            {/* Right Side - Comments */}
            <Box
                sx={{
                    width: isDesktop ? "40%" : "100%",
                    minHeight: isDesktop ? "500px" : "auto",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    backgroundColor: prefersDarkMode ? "#333" : "#fafafa",
                    borderLeft: isDesktop ? (prefersDarkMode ? "1px solid #555" : "1px solid #ddd") : "none",
                    padding: "15px",
                    overflowY: "auto",
                }}
            >
                {/* Comments */}
                <Box sx={{ flex: 1, overflowY: "auto", maxHeight: "400px", paddingBottom: "10px" }}>
                    {comments.length > 0 ? (
                        comments.map((comment, index) => (
                            <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                <Typography variant="body2" sx={{ color: prefersDarkMode ? "#ddd" : "#444" }}>
                                    <strong>{comment.username}</strong> {comment.text}
                                </Typography>
                            </Box>
                        ))
                    ) : (
                        <Typography sx={{ textAlign: "center", color: prefersDarkMode ? "#bbb" : "#777", mt: 2 }}>
                            No comments yet. Be the first to comment!
                        </Typography>
                    )}
                </Box>

                {/* Comment Input Box */}
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        sx={{
                            flex: 1,
                            backgroundColor: prefersDarkMode ? "#444" : "#f0f0f0",
                            borderRadius: "5px",
                        }}
                    />
                    <Button variant="contained" size="small" onClick={handleCommentSubmit} disabled={!commentText.trim()}>
                        Post
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
