import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Drawer, Dialog, IconButton, Typography, Box, Avatar, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import updateMetaTags from "./updateMetaTag";

export default function PostPage({ postId: propPostId, open, onClose, theme, prefersDarkMode }) {
    const { postId: urlPostId } = useParams();
    const postId = propPostId || urlPostId;
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const fetchPost = useCallback(async () => {
        if (!postId) return;

        try {
            const res = await axios.get(`https://gramsnap-backend.onrender.com/post/${postId}`, { withCredentials: true });
            setPost(res.data);

            // ✅ Update meta tags dynamically
            updateMetaTags(
                `${res.data.title} | GramSnap`,
                res.data.description || "Check out this post on GramSnap",
                res.data.image
            );
        } catch (error) {
            console.error("Error fetching post:", error);
        }
    }, [postId]);

    useEffect(() => {
        fetchPost();
    }, [fetchPost]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleClose = () => {
        onClose ? onClose() : navigate(-1);
    };

    if (!post) {
        return (
            <Box sx={{ textAlign: "center", mt: 4 }}>
                <Typography variant="h6">Post Not Found</Typography>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => navigate("/home")}
                    sx={{ mt: 2 }}
                >
                    Go to Home
                </Button>
            </Box>
        );
    }
    

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "row",
                height: "100vh",
                p: 2,
                bgcolor: prefersDarkMode ? "#121212" : "#ffffff",
                color: prefersDarkMode ? "#ffffff" : "#000000",
            }}
        >
            <IconButton sx={{ position: "absolute", top: 10, right: 10 }} onClick={handleClose}>
                {isMobile ? <ArrowBackIcon fontSize="large" /> : <CloseIcon fontSize="large" />}
            </IconButton>

            <Box sx={{ flex: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Avatar src={post.profilePic} sx={{ width: 50, height: 50 }} />
                    <Box>
                        <Typography variant="h6">{post.username}</Typography>
                        <Typography variant="body2" color="textSecondary">@{post.userId}</Typography>
                    </Box>
                </Box>
                <Typography variant="h5" sx={{ mb: 2 }}>{post.title}</Typography>
                <Box
                    component="img"
                    src={post.image}
                    alt="Post"
                    sx={{ width: "100%", borderRadius: "10px", maxHeight: "400px", objectFit: "cover" }}
                />
            </Box>

            <Box
                sx={{
                    flex: 1,
                    p: 2,
                    bgcolor: prefersDarkMode ? "#1E1E1E" : "#f8f8f8",
                    borderRadius: "10px",
                    maxHeight: "400px",
                    overflowY: "auto",
                    "&::-webkit-scrollbar": { display: "none" },
                }}
            >
                <Typography variant="h6" sx={{ mb: 2 }}>Comments</Typography>
                {post.comments?.length > 0 ? (
                    <Box component="ul" sx={{ p: 0, listStyle: "none" }}>
                        {post.comments.map((comment, index) => (
                            <Box component="li" key={index} sx={{ mb: 1 }}>
                                <Typography variant="body2">
                                    <strong>{comment.username}:</strong> {comment.text}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <Typography>No comments yet.</Typography>
                )}
            </Box>
        </Box>
    );
}
