import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import { Box, Avatar, Typography, TextField, Button, IconButton } from "@mui/material";
import { Menu, MenuItem } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FacebookIcon from "@mui/icons-material/Facebook";
import ShareIcon from "@mui/icons-material/Share";
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
    const [anchorEl, setAnchorEl] = useState(null);
    const postLink = `https://gram-snap.vercel.app/post/${postId}`;
    const getTimeAgo = (timestamp) => {
        const now = new Date();
        const past = new Date(timestamp);
        const diffInSeconds = Math.floor((now - past) / 1000); // Difference in seconds

        if (diffInSeconds < 60) return "Just now"; // Less than 1 minute
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes} min ago`; // Less than 1 hour
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} hr ago`; // Less than 1 day
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} d ago`; // Less than a week
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} w ago`; // Less than a month
        if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} mo ago`; // Less than a year
        return `${Math.floor(diffInDays / 365)} yr ago`; // 1+ years ago
    };

    const handleShareClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(postLink);
            alert("Link copied to clipboard!");
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };
    const savePost = async () => {
        try {
            const res = await axios.put(
                `https://gramsnap-backend.onrender.com/${postId}/save`,
                {}, // Empty body for PUT request
                { withCredentials: true } // Ensure cookies are sent
            );
            // const res = await axios.put(`https://gramsnap-backend.onrender.com/${postId}/like`, { withCredentials: true });
            if (res.status === 200) {
                setTempSave(!tempSave);
            }
        } catch (error) {
            console.error("Error Saving post:", error);
        }
    }
    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth > 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    const [likesCount, setLikesCount] = useState(0)
    const [tempSave, setTempSave] = useState(false);
    const fetchPost = useCallback(async () => {
        if (!postId) return;
        try {
            const res = await axios.get(`https://gramsnap-backend.onrender.com/post/${postId}`, { withCredentials: true });
            setPost(res.data);
            setLikesCount(res.data.likes);
            setTempLike(res.data.isLiked);
            setTempSave(res.data.isSaved);
            const response = await axios.get(`https://gramsnap-backend.onrender.com/post/${postId}/comment`, { withCredentials: true });
            setComments(response.data.comment || []);
            // updateMetaTags(`${res.data.title} | GramSnap`, res.data.description || "Check out this post on GramSnap", res.data.image);
        } catch (error) {
            console.error("Error fetching post:", error);
        }
    }, [postId]);

    useEffect(() => {
        fetchPost();
    }, [fetchPost]);
    const putLike = async () => {
        try {
            setTempLike(!tempLike);
            const res = await axios.put(
                `https://gramsnap-backend.onrender.com/${postId}/like`,
                {}, // Empty body for PUT request
                { withCredentials: true } // Ensure cookies are sent
            );
            if (res.status === 200) {
                console.log("Like Success");
                setLikesCount(res.data.likesCount);
            }
        } catch (error) {
            console.error("Error liking post:", error);
        }
    };


    const handleCommentSubmit = async () => {
        if (!commentText.trim()) return;
        try {
            const res = await axios.post(`https://gramsnap-backend.onrender.com/${postId}/comment`, { text: commentText }, { withCredentials: true });
            if (res.status === 201) {
                setComments([...comments, ...res.data.comment]);
                setCommentText("");
            }
        } catch (error) {
            console.error("Error posting comment:", error);
        }
    };
    const [tempLike, setTempLike] = useState(false);


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
                    <Button variant="contained" color="primary" onClick={() => navigate("/home")} sx={{ mt: 2, ml: "auto", mr: "0px" }}>
                        Go to Home
                    </Button>
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
                <Box sx={{ display: "flex", flexDirection: "row", gap: "6px", alignItems: "center" }}>
                    <IconButton onClick={() => putLike()}>
                        {post.isLiked || tempLike ? (
                            <FavoriteIcon sx={{ fontSize: 24, color: "red" }} />
                        ) : (
                            <FavoriteBorderIcon sx={{ fontSize: 24, color: prefersDarkMode ? "#bbb" : "#777" }} />
                        )}
                    </IconButton>

                    <Typography sx={{ fontWeight: 400, color: prefersDarkMode ? "#fff" : "#222" }}>
                        {post.likes}
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "row", gap: "6px", alignItems: "center", ml: "auto", mr: "0px" }}>
                        <IconButton>
                            <SendIcon sx={{ fontSize: 24, color: prefersDarkMode ? "#bbb" : "#777" }} onClick={(event) => handleShareClick(event)} />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                        >
                            <MenuItem onClick={handleCopyLink}>
                                <ContentCopyIcon sx={{ mr: 1 }} />
                                Copy Link
                            </MenuItem>

                            <MenuItem
                                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(postLink)}`, "_blank")}
                            >
                                <WhatsAppIcon sx={{ mr: 1, color: "green" }} />
                                Share on WhatsApp
                            </MenuItem>

                            <MenuItem
                                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postLink)}`, "_blank")}
                            >
                                <FacebookIcon sx={{ mr: 1, color: "#1877F2" }} />
                                Share on Facebook
                            </MenuItem>
                        </Menu>
                        <IconButton onClick={() => savePost()}>{
                            post.isSaved || tempSave ? <BookmarksIcon sx={{ fontSize: 24, color: prefersDarkMode ? "#bbb" : "#777" }} /> : <BookmarksOutlinedIcon sx={{ fontSize: 24, color: prefersDarkMode ? "#bbb" : "#777" }} />
                        }
                        </IconButton>
                    </Box>
                </Box>

                {/* Caption */}
                <Typography variant="body2" sx={{ color: prefersDarkMode ? "#ddd" : "#333", mt: 1, width: "100%" }}>
                    <strong>{post.username}</strong> {post.title}
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
                    {comments.length < 0 ? (
                        comments.map((comment, index) => (
                            <Box key={index} sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1, padding: "2px" }}>
                                <Avatar src={comment.userId.profilePicture} sx={{ fontSize: 18 }} />
                                <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                    <Typography variant="body2" sx={{ color: prefersDarkMode ? "#ddd" : "#444" }}>
                                        <strong>
                                            <span
                                                style={{ color: "#0095f6" }}
                                            >
                                                {comment.userId.userId}
                                            </span>
                                        </strong>
                                        {` ${getTimeAgo(comment.createdAt)}`}
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontSize: "12px", color: prefersDarkMode ? "#aaa" : "#555" }}>
                                        {comment.text}
                                    </Typography>
                                </Box>
                                <IconButton sx={{ ml: "auto" }}>
                                    <FavoriteBorderIcon sx={{ fontSize: 18, color: prefersDarkMode ? "#bbb" : "#777" }} />
                                </IconButton>
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
