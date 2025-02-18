import React, { useState } from 'react'
import { useMediaQuery, useTheme } from "@mui/material";
import { Box, Typography, Avatar, Divider, Button, List, ListItem, ListItemAvatar, ListItemText, TextField, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import PostAddIcon from '@mui/icons-material/PostAdd';
import MessageIcon from '@mui/icons-material/Message';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChatIcon from '@mui/icons-material/Chat';


const Profile = ({ info }) => {
    const navigate = useNavigate();
    const { theme, prefersDarkMode } = info;
    const [selected, setSelected] = useState("Profile");
    const muiTheme = useTheme();
    const isDesktop = useMediaQuery(muiTheme.breakpoints.up('lg'));
    //  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
    const [following, setFollowing] = useState(false);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const { userId, name, email, profilePicture } = userInfo;
    const handleFollow = () => {
        setFollowing(!following);
    };

    // Menu Items
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
    return (
        <>
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
                <Box
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                        padding: 4,
                        height: "100vh",

                    }}
                >
                    {/* Profile Picture */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: 2,
                            minWidth: 160, // Ensure the container is slightly larger than the avatar
                            minHeight: 160,
                        }}
                    >
                        <Avatar
                            alt="User Profile"
                            src={profilePicture}
                            sx={{
                                width: 150,
                                height: 150,
                                borderRadius: '50%',
                                objectFit: "cover",
                                border: "3px solid white"
                            }}
                        />
                    </Box>

                    {/* User ID and Name */}
                    <Box sx={{ textAlign: 'center', marginBottom: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            {name}
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                            @{userId}
                        </Typography>
                    </Box>

                    {/* Bio */}
                    <Box sx={{ textAlign: 'center', marginBottom: 4 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nisl eros, pulvinar facilisis justo mollis.
                        </Typography>
                    </Box>

                    {/* Followers, Following, Posts */}
                    <Box sx={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                150
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Posts
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                1.2k
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Followers
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                500
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Following
                            </Typography>
                        </Box>
                    </Box>
                    {/* Follow & Message Buttons */}
                    <Box sx={{ display: 'flex', gap: 2, marginBottom: 4 }}>
                        <Button
                            variant={following ? "contained" : "outlined"}
                            color="primary"
                            onClick={handleFollow}
                            sx={{ width: 130 }}
                            startIcon={following ? <CheckCircleIcon /> : <PersonAddIcon />}
                        >
                            {following ? "Unfollow" : "Follow"}
                        </Button>
                        <Button
                            variant="contained"

                            sx={{ width: 130, backgroundColor: "#7b6cc2" }}
                            startIcon={<ChatIcon />}
                        >
                            Message
                        </Button>
                    </Box>

                    {/* Posts Grid (Placeholder) */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 2,
                            width: '100%',
                            maxWidth: 600,
                            overflowY: "auto", // Allow scrolling if needed
                            scrollbarWidth: "none",
                            "&::-webkit-scrollbar": { display: "none" },
                        }}
                    >
                        {[...Array(100)].map((_, index) => (
                            <Box
                                key={index}
                                sx={{
                                    width: '100%',
                                    paddingTop: '100%', // Makes the box square
                                    backgroundColor: 'grey.300',
                                    borderRadius: 2,
                                }}
                            />
                        ))}
                    </Box>

                </Box>

                {/* Bottom Navbar for Mobile/Tablets/Laptops */}
                {!isDesktop && (
                    <>

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
        </>
    )
}

export default Profile