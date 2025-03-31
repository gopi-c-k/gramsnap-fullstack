import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Avatar, Typography, TextField, Button } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import SendIcon from "@mui/icons-material/Send";
import BookmarksOutlinedIcon from "@mui/icons-material/BookmarksOutlined";
import updateMetaTags from "./updateMetaTag";

export default function PostPage({ postId: propPostId, prefersDarkMode }) {
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
                alignItems: "center",
                justifyContent: "center",
                width: "100vw",
                minHeight: "90vh",
                backgroundColor: prefersDarkMode ? "#222" : "#f5f5f5",
                padding: 2,
                gap: 2,
            }}
        >
            {/* Left Side - Post Image */}
            <Box
                sx={{
                    width: isDesktop ? "60%" : "100%",
                    maxWidth: "600px",
                    backgroundColor: prefersDarkMode ? "#333" : "white",
                    padding: "10px",
                    borderRadius: "10px",
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Avatar src={post.profilePic} />
                    <Typography variant="body1" sx={{ fontWeight: 600, color: prefersDarkMode ? "#fff" : "#222" }}>{post.username}</Typography>
                </Box>

                <img
                    src={post.image}
                    alt="Post"
                    style={{ width: "100%", height: "auto", objectFit: "cover", borderRadius: "10px", margin: "10px 0" }}
                />

                <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {post.isLiked ? <FavoriteIcon sx={{ color: "red" }} /> : <FavoriteBorderIcon sx={{ color: prefersDarkMode ? "#bbb" : "#777" }} />}
                    <Typography>{post.likes}</Typography>
                    <Box sx={{ ml: "auto" }}>
                        <SendIcon sx={{ color: prefersDarkMode ? "#bbb" : "#777" }} />
                        <BookmarksOutlinedIcon sx={{ color: prefersDarkMode ? "#bbb" : "#777" }} />
                    </Box>
                </Box>
                <Typography variant="body2" sx={{ mt: 1 }}><strong>{post.username}</strong> {post.caption}</Typography>
            </Box>

            {/* Right Side - Comments Section (Only on Desktop) */}
            {isDesktop && (
                <Box
                    sx={{
                        width: "40%",
                        maxWidth: "400px",
                        backgroundColor: prefersDarkMode ? "#333" : "white",
                        padding: "10px",
                        borderRadius: "10px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                    }}
                >
                    <Typography variant="h6">Comments</Typography>
                    <Box sx={{ maxHeight: "300px", overflowY: "auto" }}>
                        {comments.map((comment, index) => (
                            <Typography key={index} variant="body2" sx={{ mt: 1 }}>
                                <strong>{comment.username}</strong> {comment.text}
                            </Typography>
                        ))}
                    </Box>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <TextField
                            variant="outlined"
                            size="small"
                            placeholder="Add a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            sx={{ flex: 1, backgroundColor: prefersDarkMode ? "#444" : "#f0f0f0" }}
                        />
                        <Button variant="contained" size="small" onClick={handleCommentSubmit} disabled={!commentText.trim()}>
                            Post
                        </Button>
                    </Box>
                </Box>
            )}
        </Box>
    );
}
