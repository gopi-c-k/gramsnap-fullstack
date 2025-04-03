import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Typography, Avatar, Divider, Button, List, ListItem, CircularProgress, ListItemAvatar, ListItemText, TextField, IconButton } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { Menu, MenuItem } from "@mui/material";
import DrawOutlinedIcon from '@mui/icons-material/DrawOutlined';
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FacebookIcon from "@mui/icons-material/Facebook";
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import PersonIcon from "@mui/icons-material/Person";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import PostAddIcon from '@mui/icons-material/PostAdd';
import MessageIcon from '@mui/icons-material/Message';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import axios from 'axios';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SendIcon from '@mui/icons-material/Send';
import BookmarksOutlinedIcon from '@mui/icons-material/BookmarksOutlined';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { useMediaQuery, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { LOCAL_HOST } from './variable';
import UserProfile from './UserProfile';

const Home = ({ info }) => {
    const navigate = useNavigate();
    const [selectedUser, setSelectedUser] = useState(null);

    const { theme, prefersDarkMode } = info;
    const [selected, setSelected] = useState("Home");
    const muiTheme = useTheme();
    const isDesktop = useMediaQuery(muiTheme.breakpoints.up('lg'));
    //  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));


    const [comments, setComments] = useState({});
    const [commentText, setCommentText] = useState({});

    const handleCommentSubmit = async (postId) => {
        try {
            if (commentText[postId]?.trim()) {
                const res = await axios.post(`https://gramsnap-backend-bj65.onrender.com/${postId}/comment`, { text: commentText[postId] }, { withCredentials: true });
                if (res.status === 201) {
                    setComments((prev) => ({
                        ...prev,
                        [postId]: [...(prev[postId] || []), res.data.comment], // Append new comment
                    }));
                    setCommentText((prev) => ({ ...prev, [postId]: "" })); // Clear input
                    showCommentsToggle(postId);
                }

            }
        } catch (error) {
            console.log("Error in while posting comment", error);
        }
    };
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
    const [showComments, setShowComments] = useState({});

    const showCommentsToggle = async (postId) => {
        try {
            if (!comments[postId]) {
                const res = await axios.get(`https://gramsnap-backend-bj65.onrender.com/post/${postId}/comment`, { withCredentials: true });

                console.log(res.data.comments);
                if (res.status === 200) {
                    setComments((prev) => ({
                        ...prev,
                        [postId]: res.data.comments
                    }));
                }
            }
            setShowComments((prev) => ({
                ...prev,
                [postId]: !prev[postId], // Toggle the state for the specific postId
            }));
        } catch (error) {
            console.log("Error in fetching comment", error);
        }
    };

    const [users, setUser] = useState(null);



    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const { userId, name, email, profilePicture } = userInfo;
    const menuItems = [
        { name: "Home", icon: <HomeIcon />, route: "/home" },
        { name: "Search", icon: <SearchIcon />, route: "/search" },
        { name: "Add Post", icon: <PostAddIcon />, route: "/addpost" },
        { name: "Chats", icon: <MessageIcon />, route: "/message" },
        {
            name: "Profile", icon: <Avatar
                alt="User Profile"
                src={profilePicture}
                sx={{
                    width: 30,  // Adjust size as necessary
                    height: 30,
                    borderRadius: '50%',
                    border: prefersDarkMode ? "1px solid white" : "1px solid black"
                }}
            />, route: "/profile"
        },
        { name: "Settings", icon: <SettingsIcon />, route: "/settings" },
        { name: "Log Out", icon: <LogoutIcon />, route: "/home", isLogout: true },
    ];
    const stories = [
        { username: "user1", img: "https://via.placeholder.com/100" },
        { username: "user2", img: "https://via.placeholder.com/100" },
        { username: "user3", img: "https://via.placeholder.com/100" },
        { username: "user4", img: "https://via.placeholder.com/100" },
        { username: "user5", img: "https://via.placeholder.com/100" },
        { username: "user1", img: "https://via.placeholder.com/100" },
        { username: "user2", img: "https://via.placeholder.com/100" },
        { username: "user3", img: "https://via.placeholder.com/100" },
        { username: "user4", img: "https://via.placeholder.com/100" },
        { username: "user5", img: "https://via.placeholder.com/100" },
    ];

    const [homePost, setHomePost] = useState([]);

    // Post Share
    const [anchorElMap, setAnchorElMap] = useState({});


    const handleShareClick = (event, postId) => {
        setAnchorElMap((prev) => ({ ...prev, [postId]: event.currentTarget }));
    };


    const handleClose = (postId) => {
        setAnchorElMap((prev) => ({ ...prev, [postId]: null }));
    };


    const handleCopyLink = async (postId) => {
        try {
            await navigator.clipboard.writeText(`https://gram-snap.vercel.app/post/${postId}`);
            alert("Link copied to clipboard!");
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };


    const parentRef = useRef(null);
    const [parentWidth, setParentWidth] = useState(0);

    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                setParentWidth(entry.contentRect.width);
            }
        });

        if (parentRef.current) {
            observer.observe(parentRef.current);
        }

        return () => observer.disconnect();
    }, [])
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);
    const [notifications, setNotifications] = useState([]);
    const [recommendedUsers, setRecommendedUsers] = useState([]);
    const [homePostLoading, setHomePostLoading] = useState(true);
    useEffect(() => {
        const fetchHomePosts = async () => {
            try {
                console.log("Fetching home posts...");
                const res = await axios.get("https://gramsnap-backend-bj65.onrender.com/home", { withCredentials: true });

                if (res.status === 200 && res.data?.homePosts) {
                    console.log("Home posts fetched:", res.data.homePosts);
                    setHomePost(res.data.homePosts);
                    setHomePostLoading(false);
                } else {
                    console.error("Invalid response from server:", res);
                    navigate("/signin");
                }
            } catch (error) {
                console.error("Error fetching home posts:", error);
                navigate("/signin");
            }
        };

        fetchHomePosts();
    }, [navigate]); // ✅ Added `navigate` as a dependency to prevent stale references


    /// Post Section
    const toggleLike = (posts, postId, likesCount) => {
        return posts.map(post =>
            post.postId === postId
                ? { ...post, isLiked: !post.isLiked, likes: likesCount } // Toggle isLiked for the matched post
                : post // Keep other posts unchanged
        );
    };
    const toggleSave = (posts, postId) => {
        return posts.map(post =>
            post.postId === postId
                ? { ...post, isSaved: !post.isSaved } // Toggle isLiked for the matched post
                : post // Keep other posts unchanged
        );
    };
    const putLike = async (postId) => {
        try {
            const res = await axios.put(
                `https://gramsnap-backend-bj65.onrender.com/${postId}/like`,
                {}, // Empty body for PUT request
                { withCredentials: true } // Ensure cookies are sent
            );
            // const res = await axios.put(`https://gramsnap-backend-bj65.onrender.com/${postId}/like`, { withCredentials: true });
            if (res.status === 200) {
                setHomePost(toggleLike(homePost, postId, res.data.likesCount));
            }
        } catch (error) {
            console.error("Error liking post:", error);
        }
    }
    const savePost = async (postId) => {
        try {
            const res = await axios.put(
                `https://gramsnap-backend-bj65.onrender.com/${postId}/save`,
                {}, // Empty body for PUT request
                { withCredentials: true } // Ensure cookies are sent
            );
            // const res = await axios.put(`https://gramsnap-backend-bj65.onrender.com/${postId}/like`, { withCredentials: true });
            if (res.status === 200) {
                setHomePost(toggleSave(homePost, postId));
            }
        } catch (error) {
            console.error("Error Saving post:", error);
        }
    }


    // ✅ Fetch notifications function
    const fetchNotifications = useCallback(async () => {
        try {
            const res = await axios.get(`https://gramsnap-backend-bj65.onrender.com/notifications`, { withCredentials: true });
            //console.log(res.data);
            setNotifications(res.data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    }, []);

    // ✅ Fetch recommended users function
    const fetchRecommendedUsers = useCallback(async () => {
        try {
            const res = await axios.get(`https://gramsnap-backend-bj65.onrender.com/suggestions`, { withCredentials: true });
            // console.log(res.data)
            setRecommendedUsers(res.data.suggestions);
        } catch (error) {
            console.error("Error fetching recommended users:", error);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        fetchRecommendedUsers();
    }, [fetchNotifications, fetchRecommendedUsers]);

    const handleConfirm = async (senderId) => {
        try {
            await axios.post(`https://gramsnap-backend-bj65.onrender.com/accept-follow`, { senderId }, { withCredentials: true });

            // 🔄 Remove the accepted follow request from state
            // setNotifications(notifications.filter((n) => n.senderId.userId !== senderId));
            fetchNotifications();
            console.log("Follow request accepted!");
        } catch (error) {
            console.error("Error accepting follow request:", error);
        }

    };

    return (
        <Box sx={{ display: "flex", flexDirection: "row", width: "100%", height: "100vh" }}>
            {/* Sidebar for Desktop */}
            {isDesktop && (
                <Box sx={{
                    width: "15%",
                    height: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    padding: "20px",
                    borderRight: "1px solid #ddd"
                }}>
                    <Box sx={{ textAlign: "center", mb: 4 }}>
                        <img src={`${process.env.PUBLIC_URL}/assets/Images/Logo.png`} alt="Logo" style={{ width: "80%", maxWidth: "150px" }} />
                    </Box>
                    {menuItems.map((item) => (
                        <Box key={item.name} onClick={() => { setSelected(item.name); navigate(item.route); }}
                            sx={{
                                display: "flex", alignItems: "center", gap: 2, padding: "10px",
                                borderRadius: "8px", cursor: "pointer", transition: "background 0.3s",
                                backgroundColor: selected === item.name ? "#7b6cc2" : "transparent",
                                color: selected === item.name ? "#fff" : "#f",
                                '&:hover': { backgroundColor: "#e0e0e0" },
                                marginTop: item.isLogout ? "auto" : ""
                            }}

                        >
                            {item.icon}
                            <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: "bold" }}>{item.name}</Typography>
                        </Box>
                    ))}
                </Box>
            )}

            {/* Main Content */}
            <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "row" }}>
                {selectedUser ? (<><UserProfile userId={selectedUser.userId} /></>) : (

                    <>
                        <Box sx={{
                            maxWidth: isDesktop ? "60vw" : "100vw",
                            width: isDesktop ? "70vw" : "100vw",
                            height: isDesktop ? "100vh" : "85vh",
                            display: "flex",
                            alignItems: "center",
                            flexDirection: "column",
                            overflowY: "auto",
                            scrollbarWidth: "none",
                            "&::-webkit-scrollbar": { display: "none" },
                        }}>
                            {/* Story */}
                            <Box
                                sx={{
                                    width: isDesktop ? "45vw" : "100vw",
                                    maxWidth: "700px",
                                    height: "210px",
                                    minHeight: "210px",
                                    display: "flex",
                                    flexDirection: "row",
                                    gap: 2,
                                    padding: "10px",
                                    overflowX: "auto",
                                    scrollbarWidth: "none",
                                    "&::-webkit-scrollbar": { display: "none" },
                                }}
                            >
                                <Box
                                    key={"o1"}
                                    sx={{
                                        width: "160px",
                                        height: "190px",
                                        backgroundColor: prefersDarkMode ? "#333" : "white", // Dark or Light mode
                                        color: prefersDarkMode ? "#fff" : "#222", // Text color adjustment
                                        borderRadius: "12px",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        boxShadow: prefersDarkMode
                                            ? "0px 6px 12px rgba(255, 255, 255, 0.1)" // Softer shadow for dark mode
                                            : "0px 6px 12px rgba(0, 0, 0, 0.15)", // Normal shadow for light mode
                                        padding: "10px",
                                        transition: "transform 0.2s ease-in-out",
                                        "&:hover": { transform: "scale(1.05)" }, // Zoom effect on hover
                                    }}
                                >
                                    <DrawOutlinedIcon
                                        sx={{
                                            width: "140px",
                                            height: "140px",
                                            borderRadius: "12px",
                                            objectFit: "cover",
                                            marginBottom: "10px",
                                            boxShadow: !prefersDarkMode
                                                ? "0px 4px 8px rgba(255, 255, 255, 0.31)" // Softer shadow for dark mode
                                                : "0px 4px 8px rgba(0, 0, 0, 0.1)", // Default shadow
                                        }}
                                    />
                                    {/* User Info */}
                                    <Box sx={{ display: "flex", flexDirection: "row", gap: "6px" }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: prefersDarkMode ? "#fff" : "#222" }}>
                                            Add Yours
                                        </Typography>
                                    </Box>
                                </Box>
                                {stories.map((story, idx) => (
                                    <Box
                                        key={idx}
                                        sx={{
                                            width: "160px",
                                            height: "190px",
                                            backgroundColor: prefersDarkMode ? "#333" : "white", // Dark or Light mode
                                            color: prefersDarkMode ? "#fff" : "#222", // Text color adjustment
                                            borderRadius: "12px",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            boxShadow: prefersDarkMode
                                                ? "0px 6px 12px rgba(255, 255, 255, 0.1)" // Softer shadow for dark mode
                                                : "0px 6px 12px rgba(0, 0, 0, 0.15)", // Normal shadow for light mode
                                            padding: "10px",
                                            transition: "transform 0.2s ease-in-out",
                                            "&:hover": { transform: "scale(1.05)" }, // Zoom effect on hover
                                        }}
                                    >
                                        {/* Story Image */}
                                        <img
                                            src={``}
                                            alt="Story"
                                            style={{
                                                width: "140px",
                                                height: "140px",
                                                borderRadius: "12px",
                                                objectFit: "cover",
                                                marginBottom: "10px",
                                                boxShadow: !prefersDarkMode
                                                    ? "0px 4px 8px rgba(255, 255, 255, 0.31)" // Softer shadow for dark mode
                                                    : "0px 4px 8px rgba(0, 0, 0, 0.1)", // Default shadow
                                            }}
                                        />

                                        {/* User Info */}
                                        <Box sx={{ display: "flex", flexDirection: "row", gap: "6px" }}>
                                            <Box
                                                sx={{
                                                    display: "inline-block",
                                                    padding: "3px", // Adjust the gap size
                                                    border: `3px solid ${prefersDarkMode ? "#7b6cc2" : "#777"}`, // Outer border
                                                    borderRadius: "50%" // Ensures the border is circular
                                                }}
                                            >
                                                <Avatar
                                                    src={''}
                                                    alt="User Avatar"
                                                    sx={{
                                                        fontSize: 10,
                                                        // color: prefersDarkMode ? "#bbb" : "#777",
                                                        width: 20, // Adjust size as needed
                                                        height: 20, // Adjust size as needed
                                                        // backgroundColor: "white" // Optional: keeps avatar background clean
                                                    }}
                                                />
                                            </Box>


                                            <Typography variant="body2" sx={{ fontWeight: 600, color: prefersDarkMode ? "#fff" : "#222" }}>
                                                {story.username}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                            {/* Post  */}
                            <Box ref={parentRef} sx={{
                                display: "flex",
                                flexDirection: "column",
                                width: "500px",
                                maxWidth: isDesktop ? "50vw" : "100vw",
                                justifyContent: "center",
                                alignItems: "center",
                                padding: isDesktop && "10px",
                                gap: isDesktop ? 2 : 1
                            }}>
                                {!homePostLoading ? (
                                    homePost.map((posts, index) => (
                                        <Box
                                            key={posts.postId}
                                            sx={{
                                                minHeight: isDesktop ? `${parentWidth * 0.8}px` : `${parentWidth * 0.9}px`,
                                                width: isDesktop ? `${parentWidth * 0.8}px` : `${parentWidth * 0.9}px`,
                                                borderRadius: "2%",
                                                display: "flex",
                                                flexDirection: "column",
                                                padding: "10px",
                                                backgroundColor: prefersDarkMode ? "#333" : "white",
                                                boxShadow: !prefersDarkMode && "0px 4px 8px rgba(0, 0, 0, 0.1)",
                                            }}
                                        >
                                            {/* User Profile Section */}
                                            <Box sx={{ display: "flex", flexDirection: "row", gap: "6px", alignItems: "center" }}>
                                                <Avatar src={posts.profilePicture} sx={{ fontSize: 24, color: prefersDarkMode ? "#bbb" : "#777" }} />
                                                <Box sx={{ display: "flex", flexDirection: "column", gap: "3px", alignItems: "center" }}>
                                                    <Typography
                                                        variant="body1"
                                                        sx={{ fontWeight: 600, color: prefersDarkMode ? "#fff" : "#222", cursor: "pointer" }}
                                                        onClick={() => setSelectedUser(posts)}
                                                    >
                                                        {posts.userId}
                                                    </Typography>

                                                    <Typography sx={{ fontWeight: 400, color: prefersDarkMode ? "#fff" : "#222" }}>
                                                        {posts.name}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" sx={{ fontWeight: 200, color: "#0077cc", cursor: "pointer" }}>
                                                    Follow
                                                </Typography>
                                            </Box>

                                            {/* Post Image */}
                                            <img
                                                src={posts.postPic ? posts.postPic : `${process.env.PUBLIC_URL}/assets/Images/default.jpg`}
                                                alt="Post"
                                                style={{
                                                    width: isDesktop ? `${parentWidth * 0.75}px` : `${parentWidth * 0.85}px`,
                                                    height: isDesktop ? `${parentWidth * 0.75}px` : `${parentWidth * 0.85}px`,
                                                    objectFit: "cover",
                                                    marginBottom: "10px",
                                                    padding: "10px 0px",
                                                }}
                                            />

                                            {/* Post Actions (Like, Share, Bookmark) */}
                                            <Box sx={{ display: "flex", flexDirection: "row", gap: "6px", alignItems: "center" }}>
                                                <IconButton onClick={() => putLike(posts.postId)}>
                                                    {posts.isLiked ? (
                                                        <FavoriteIcon sx={{ fontSize: 24, color: "red" }} />
                                                    ) : (
                                                        <FavoriteBorderIcon sx={{ fontSize: 24, color: prefersDarkMode ? "#bbb" : "#777" }} />
                                                    )}
                                                </IconButton>

                                                <Typography sx={{ fontWeight: 400, color: prefersDarkMode ? "#fff" : "#222" }}>
                                                    {posts.likes}
                                                </Typography>
                                                <Box sx={{ display: "flex", flexDirection: "row", gap: "6px", alignItems: "center", ml: "auto", mr: "0px" }}>
                                                    <IconButton onClick={(event) => handleShareClick(event, posts.postId)}>
                                                        <SendIcon sx={{ fontSize: 24, color: prefersDarkMode ? "#bbb" : "#777" }} />
                                                    </IconButton>
                                                    <Menu
                                                        anchorEl={anchorElMap[posts.postId]}
                                                        open={Boolean(anchorElMap[posts.postId])}
                                                        onClose={() => handleClose(posts.postId)}
                                                        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                                                    >
                                                        <MenuItem onClick={() => handleCopyLink(posts.postId)}>
                                                            <ContentCopyIcon sx={{ mr: 1 }} />
                                                            Copy Link
                                                        </MenuItem>
                                                        <MenuItem onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`https://gram-snap.vercel.app/post/${posts.postId}`)}`, "_blank")}>
                                                            <WhatsAppIcon sx={{ mr: 1, color: "green" }} />
                                                            Share on WhatsApp
                                                        </MenuItem>
                                                        <MenuItem onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://gram-snap.vercel.app/post/${posts.postId}`)}`, "_blank")}>
                                                            <FacebookIcon sx={{ mr: 1, color: "#1877F2" }} />
                                                            Share on Facebook
                                                        </MenuItem>
                                                    </Menu>

                                                    <IconButton onClick={() => savePost(posts.postId)}>{
                                                        posts.isSaved ? <BookmarksIcon sx={{ fontSize: 24, color: prefersDarkMode ? "#bbb" : "#777" }} /> : <BookmarksOutlinedIcon sx={{ fontSize: 24, color: prefersDarkMode ? "#bbb" : "#777" }} />
                                                    }
                                                    </IconButton>
                                                </Box>
                                            </Box>

                                            {/* Post Caption */}
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: prefersDarkMode ? "#ddd" : "#333",
                                                    fontSize: "14px",
                                                    marginTop: "8px",
                                                    lineHeight: 1.5,
                                                }}
                                            >
                                                <strong>{posts.name}</strong> {posts.caption}
                                            </Typography>

                                            {/* Comments Section */}
                                            <Typography
                                                variant="text"
                                                sx={{ color: prefersDarkMode ? "#bbb" : "#0077cc", marginTop: "8px", ml: "0px", cursor: "pointer" }}
                                                onClick={() => showCommentsToggle(posts.postId)} // Toggle comment visibility
                                            >
                                                {showComments[posts.postId] ? "Hide Comments" : "Show Comments"}
                                            </Typography>

                                            {/* Comments Section */}
                                            {showComments[posts.postId] && comments[posts.postId]?.length !== 0 && comments[posts.postId]?.map((comment, index) => (
                                                <Box key={index} sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1, padding: "2px" }}>
                                                    <Avatar src={comment.userId.profilePicture} sx={{ fontSize: 18 }} />
                                                    <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                                        <Typography variant="body2" sx={{ color: prefersDarkMode ? "#ddd" : "#444" }}>
                                                            <strong>
                                                                <span
                                                                    onClick={() => setSelectedUser(comment.userId.userId)}
                                                                    style={{ color: "#0095f6", cursor: "pointer" }}
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
                                            ))}

                                            {/* Add Comment Input */}
                                            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                                                <TextField
                                                    variant="outlined"
                                                    size="small"
                                                    placeholder="Add a comment..."
                                                    value={commentText[posts.postId] || ""} // Prevent undefined error
                                                    onChange={(e) => setCommentText((prev) => ({
                                                        ...prev,
                                                        [posts.postId]: e.target.value, // Update text for the correct postId
                                                    }))}
                                                    sx={{
                                                        flex: 1,
                                                        backgroundColor: prefersDarkMode ? "#444" : "#f0f0f0",
                                                        borderRadius: "5px",
                                                        "& fieldset": { border: "none" },
                                                    }}
                                                />
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    onClick={() => handleCommentSubmit(posts.postId)} // Correct function call
                                                    disabled={!commentText[posts.postId]?.trim()} // Prevents empty comments
                                                    sx={{
                                                        backgroundColor: "#0095f6",
                                                        color: "#fff",
                                                        "&:hover": { backgroundColor: "#0077cc" },
                                                    }}
                                                >
                                                    Post
                                                </Button>
                                            </Box>
                                        </Box>
                                    ))
                                ) : (
                                    <CircularProgress color="inherit" />
                                )}

                            </Box>

                        </Box>
                        {isDesktop && (<Box
                            sx={{
                                maxWidth: '40%',
                                width: '40%',
                                height: '100vh',
                                padding: '20px',
                                overflowY: 'auto',
                                borderLeft: '1px solid #ddd',
                            }}
                        >
                            {/* Notifications Section */}

                            {notifications.length > 0 ? (<List>{notifications.map((notification) => (
                                <ListItem
                                    key={notification._id}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        mb: 1,
                                        p: 1,
                                        borderRadius: '8px',
                                        '&:hover': {
                                            backgroundColor: prefersDarkMode ? "#2a2d32" : "#e9ecef"
                                        },
                                        transition: "background-color 0.2s ease-in-out"
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar src={notification.senderId.profilePicture} />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography variant="body1">
                                                <strong
                                                    style={{
                                                        cursor: "pointer",
                                                        textDecoration: "none"
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                                                    onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                                                    onClick={() => setSelectedUser(notification.senderId)}
                                                >
                                                    {notification.senderId.name}
                                                </strong> {notification.message}
                                            </Typography>
                                        }
                                    />
                                    {/* Icon based on notification type */}
                                    {notification.type === 'like' && <FavoriteIcon color="error" />}
                                    {notification.type === 'followRequest' && <> <PersonAddIcon color="primary" /><Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleConfirm(notification.senderId.userId)}
                                    >
                                        Confirm
                                    </Button></>}
                                    {notification.type === 'follow' && <PersonIcon color="success" />}
                                    {notification.type === 'comment' && <PersonIcon color="primary" />}
                                </ListItem>
                            ))} </List>) : (<Typography>No Notifications</Typography>)}


                            {/* Divider */}
                            <Divider sx={{ my: 3 }} />

                            {/* Recommended Users Section */}
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                People You May Know
                            </Typography>
                            <List>
                                {recommendedUsers.map((user) => (
                                    <ListItem
                                        key={user.userId}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            mb: 1,
                                            p: 1,
                                            borderRadius: '8px',
                                            '&:hover': {
                                                backgroundColor: prefersDarkMode ? "#2a2d32" : "#e9ecef"
                                            },
                                            transition: "background-color 0.2s ease-in-out"
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar src={user.profilePicture} />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body1">
                                                    <strong style={{
                                                        cursor: "pointer",
                                                        textDecoration: "none"
                                                    }} onClick={() => setSelectedUser(user.userId)}
                                                        onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                                                        onMouseLeave={(e) => e.target.style.textDecoration = "none"}>{user.name}</strong>
                                                </Typography>
                                            }
                                        />
                                        <Button
                                            variant="contained"
                                            size="small"
                                            startIcon={<AddCircleOutlineIcon />}
                                            sx={{ textTransform: 'none', borderRadius: '20px' }}
                                        >
                                            Follow
                                        </Button>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>)}
                    </>


                )}
            </Box>
            {/* Bottom Navbar for Mobile/Tablets/Laptops */}
            {
                !isDesktop && (
                    <>
                        <Box sx={{
                            position: "fixed",
                            top: 0,
                            width: "100%",
                            display: "flex",
                            flexDirection: "row",
                            padding: "0 20px",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            {/* Logo */}
                            <Box>
                                <img
                                    src={`${process.env.PUBLIC_URL}/assets/Images/Logo.png`}
                                    alt="Logo"
                                    style={{ width: "100px", maxWidth: "150px" }}
                                />
                            </Box>

                            {/* Notification Icon */}
                            <Box>
                                <NotificationsNoneIcon sx={{ cursor: "pointer" }} onClick={() => navigate("/notifications")} />
                            </Box>
                        </Box>
                        <Box sx={{
                            position: "fixed",
                            bottom: 0,
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-around",
                            backgroundColor: prefersDarkMode ? "black" : "#fff",
                            padding: "10px 0",
                            borderTop: "1px solid #ddd"
                        }}>
                            {menuItems.slice(0, 5).map((item) => (
                                <Box key={item.name} onClick={() => { setSelected(item.name); navigate(item.route); }}
                                    sx={{
                                        display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer",
                                        color: selected === item.name ? "#7b6cc2" : prefersDarkMode ? "ffff" : "000"
                                    }}>
                                    {item.icon}
                                </Box>
                            ))}
                        </Box>
                    </>
                )
            }
        </Box >
    );
}

export default Home;