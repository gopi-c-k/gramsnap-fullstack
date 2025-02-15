import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Avatar, Divider, Button, List, ListItem, ListItemAvatar, ListItemText, TextField } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonIcon from "@mui/icons-material/Person";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import PostAddIcon from '@mui/icons-material/PostAdd';
import MessageIcon from '@mui/icons-material/Message';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SendIcon from '@mui/icons-material/Send';
import BookmarksOutlinedIcon from '@mui/icons-material/BookmarksOutlined';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { useMediaQuery, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Home = ({ info }) => {
    const navigate = useNavigate();
    const { theme, prefersDarkMode } = info;
    const [selected, setSelected] = useState("Home");
    const muiTheme = useTheme();
    const isDesktop = useMediaQuery(muiTheme.breakpoints.up('lg'));
  //  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const handleCommentSubmit = () => {
        if (commentText.trim()) {
            setComments([...comments, commentText]);
            setCommentText(""); // Clear input
        }
    };

    const menuItems = [
        { name: "Home", icon: <HomeIcon />, route: "/home" },
        { name: "Search", icon: <SearchIcon />, route: "/search" },
        { name: "Add Post", icon: <PostAddIcon />, route: "/addpost" },
        { name: "Chats", icon: <MessageIcon />, route: "/message" },
        { name: "Profile", icon: <AccountCircleIcon />, route: "/profile" },
        { name: "Settings", icon: <SettingsIcon />, route: "/settings" },
        { name: "Log Out", icon: <LogoutIcon />, route: "/home",isLogout: true },
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
    const posts = [
        {
            username: "user1",
            profileImg: "https://via.placeholder.com/50",
            postImg: "https://via.placeholder.com/300",
            caption: "Enjoying the sunset! 🌅 #BeautifulView",
            likes: 120,
            comments: 10
        },
        {
            username: "user2",
            profileImg: "https://via.placeholder.com/50",
            postImg: "https://via.placeholder.com/300",
            caption: "Had an amazing brunch today! 🍽️ #Foodie",
            likes: 89,
            comments: 15
        },
        {
            username: "user3",
            profileImg: "https://via.placeholder.com/50",
            postImg: "https://via.placeholder.com/300",
            caption: "Throwback to my beach vacation! 🌊🏖️",
            likes: 200,
            comments: 25
        },
        {
            username: "user4",
            profileImg: "https://via.placeholder.com/50",
            postImg: "https://via.placeholder.com/300",
            caption: "Coding and coffee ☕💻 #DeveloperLife",
            likes: 150,
            comments: 20
        },
        {
            username: "user5",
            profileImg: "https://via.placeholder.com/50",
            postImg: "https://via.placeholder.com/300",
            caption: "Exploring new places 🏕️🌍",
            likes: 175,
            comments: 30
        },
        {
            username: "user6",
            profileImg: "https://via.placeholder.com/50",
            postImg: "https://via.placeholder.com/300",
            caption: "City lights and late-night drives 🚗💨",
            likes: 99,
            comments: 12
        },
        {
            username: "user7",
            profileImg: "https://via.placeholder.com/50",
            postImg: "https://via.placeholder.com/300",
            caption: "Best day of my life! ❤️🎉 #Memories",
            likes: 300,
            comments: 50
        },
    ];
    const notifications = [
        { id: 1, type: "like", user: "John Doe", avatar: "/assets/Images/user1.jpg", message: "liked your post" },
        { id: 2, type: "follow-request", user: "Jane Smith", avatar: "/assets/Images/user2.jpg", message: "sent you a follow request" },
        { id: 3, type: "follow", user: "Mike Johnson", avatar: "/assets/Images/user3.jpg", message: "started following you" },
    ];

    const recommendedUsers = [
        { id: 1, user: "Emily Carter", avatar: "/assets/Images/user4.jpg" },
        { id: 2, user: "Ryan Wilson", avatar: "/assets/Images/user5.jpg" }
    ];

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
                        <Box key={item.name} onClick={() => {setSelected(item.name);navigate(item.route);}}
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
                                        src={`${process.env.PUBLIC_URL}/assets/Images/sk.jpeg`}
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
                                        <AccountCircleIcon sx={{ fontSize: 22, color: prefersDarkMode ? "#bbb" : "#777" }} />
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
                            {posts.map((posts, index) => (
                                <Box sx={{
                                    minHeight: isDesktop ? `${parentWidth * 0.8}px` : `${parentWidth * 0.9}px`,
                                    width: isDesktop ? `${parentWidth * 0.8}px` : `${parentWidth * 0.9}px`,
                                    borderRadius: "2%",
                                    display: "flex",
                                    flexDirection: "column",
                                    padding: "10px",
                                    backgroundColor: prefersDarkMode ? "#333" : "white",
                                    boxShadow: !prefersDarkMode
                                        && "0px 4px 8px rgba(0, 0, 0, 0.1)",

                                }}>
                                    <Box sx={{ display: "flex", flexDirection: "row", gap: "6px", alignItems: "center" }}>
                                        <AccountCircleIcon sx={{ fontSize: 24, color: prefersDarkMode ? "#bbb" : "#777" }} />
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: prefersDarkMode ? "#fff" : "#222" }}>
                                            {posts.username}
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 200, color: "#0077cc", cursor: "pointer" }}>
                                            Follow
                                        </Typography>
                                    </Box>
                                    <img
                                        src={`${process.env.PUBLIC_URL}/assets/Images/sk.jpeg`}
                                        alt="Story"
                                        style={{
                                            width: isDesktop ? `${parentWidth * 0.75}px` : `${parentWidth * 0.85}px`,
                                            height: isDesktop ? `${parentWidth * 0.75}px` : `${parentWidth * 0.85}px`,
                                            objectFit: "cover",
                                            marginBottom: "10px",
                                            padding: "10px 0px"
                                        }}
                                    />
                                    <Box sx={{ display: "flex", flexDirection: "row", gap: "6px", alignItems: "center" }}>
                                        <FavoriteBorderIcon sx={{ fontSize: 24, color: prefersDarkMode ? "#bbb" : "#777" }} ></FavoriteBorderIcon>
                                        <Box sx={{ display: "flex", flexDirection: "row", gap: "6px", alignItems: "center", ml: "auto", mr: "0px" }}>
                                            <SendIcon sx={{ fontSize: 24, color: prefersDarkMode ? "#bbb" : "#777" }} ></SendIcon>
                                            <BookmarksOutlinedIcon sx={{ fontSize: 24, color: prefersDarkMode ? "#bbb" : "#777" }} ></BookmarksOutlinedIcon>
                                        </Box>
                                    </Box>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: prefersDarkMode ? "#ddd" : "#333",
                                            fontSize: "14px",
                                            marginTop: "8px",
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        <strong>{posts.username}</strong> {posts.caption}
                                    </Typography>
                                    {comments.length !== 0 && (comments.map((comment, index) => (
                                        <Box key={index} sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1, padding: "2px" }}>
                                            <AccountCircleIcon sx={{ fontSize: 22, color: prefersDarkMode ? "#bbb" : "#777" }} />
                                            <Typography variant="body2" sx={{ color: prefersDarkMode ? "#ddd" : "#444" }}>
                                                <strong>user{index + 1}</strong> {comment}
                                            </Typography>
                                            <FavoriteBorderIcon sx={{ fontSize: 22, color: prefersDarkMode ? "#bbb" : "#777", ml: "auto" }}></FavoriteBorderIcon>
                                        </Box>
                                    )))}
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
                                                "& fieldset": { border: "none" },
                                            }}
                                        />
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={handleCommentSubmit}
                                            disabled={!commentText.trim()}
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
                            ))}
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
                        <List>
                            {notifications.map((notification) => (
                                <ListItem
                                    key={notification.id}
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
                                        <Avatar src={notification.avatar} />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography variant="body1">
                                                <strong>{notification.user}</strong> {notification.message}
                                            </Typography>
                                        }
                                    />
                                    {/* Icon based on notification type */}
                                    {notification.type === 'like' && <FavoriteIcon color="error" />}
                                    {notification.type === 'follow-request' && <PersonAddIcon color="primary" />}
                                    {notification.type === 'follow' && <PersonIcon color="success" />}
                                </ListItem>
                            ))}
                        </List>

                        {/* Divider */}
                        <Divider sx={{ my: 3 }} />

                        {/* Recommended Users Section */}
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                            People You May Know
                        </Typography>
                        <List>
                            {recommendedUsers.map((user) => (
                                <ListItem
                                    key={user.id}
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
                                        <Avatar src={user.avatar} />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography variant="body1">
                                                <strong>{user.user}</strong>
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

            </Box>

            {/* Bottom Navbar for Mobile/Tablets/Laptops */}
            {!isDesktop && (
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
            )}
        </Box>
    );
}

export default Home;