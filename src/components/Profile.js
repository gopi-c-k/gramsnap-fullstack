import React, { useState, useEffect } from 'react'
import { useMediaQuery, useTheme } from "@mui/material";
import { Box, Typography, Avatar, Divider, Button, List, ListItem, CircularProgress, Backdrop, ListItemAvatar, ListItemText, TextField, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import PostAddIcon from '@mui/icons-material/PostAdd';
import MessageIcon from '@mui/icons-material/Message';
import LockIcon from '@mui/icons-material/Lock';
import axios from "axios";
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChatIcon from '@mui/icons-material/Chat';
import { LOCAL_HOST } from './variable';

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
    const [userProfile, setUserProfile] = useState(null);
    const [loading,setLoading] = useState(true);
    const handleFollow = () => {
        setFollowing(!following);
    };
    useEffect(() => {
        const autoLogin = async () => {
            try {
                const response = await axios.get(`http://${LOCAL_HOST}:5000/profile/${userId}`, { withCredentials: true });
                if (response.status === 200) {
                    // Debug
                    console.log(response.data)
                    setLoading(false);
                    setUserProfile(response.data)
                    // console.log(userProfile);
                }else{
                    navigate("/signin")
                }
            } catch (error) {
                console.log("Error occured: " + error);
            }
        };
        if (userId) autoLogin();
    }, []);
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
                {loading && (<Box
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
                    <Backdrop sx={{ color: "#fff", zIndex: 1300 }} open={loading}>
                        <CircularProgress color="inherit" />
                    </Backdrop>
                </Box>)}
                {userProfile && (<Box
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
                            src={userProfile?.profilePicture}
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
                            {userProfile?.name}
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                            @{userProfile?.userId}
                        </Typography>
                    </Box>

                    {/* Bio */}
                    <Box sx={{ textAlign: 'center', marginBottom: 4 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {userProfile?.bio}
                        </Typography>
                    </Box>

                    {/* Followers, Following, Posts */}
                    <Box sx={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {userProfile?.postSize}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Posts
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {userProfile?.followersSize}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Followers
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {userProfile?.followingSize}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Following
                            </Typography>
                        </Box>
                    </Box>
                    {/* Follow & Message Buttons */}
                    {!userProfile?.isSame && (<Box sx={{ display: 'flex', gap: 2, marginBottom: 4 }}>
                        <Button
                            variant={following ? "contained" : "outlined"}
                            color="primary"
                            onClick={handleFollow}
                            sx={{ width: 130 }}
                            startIcon={following ? <CheckCircleIcon /> : <PersonAddIcon />}
                        >
                            {userProfile?.isFollow ? "Unfollow" : "Follow"}
                        </Button>
                        {userProfile?.isFollow && (<Button
                            variant="contained"

                            sx={{ width: 130, backgroundColor: "#7b6cc2" }}
                            startIcon={<ChatIcon />}
                        >
                            Message
                        </Button>)}
                    </Box>)}

                    {/* Posts Grid (Placeholder) */}
                    {userProfile?.isPrivate ? (<Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "8px" }}>
                        <LockIcon color="action" />
                        <Typography variant="body1" color="gray">
                            This account is private.
                        </Typography>
                    </Box>) : (<Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', // Responsive grid
                            justifyContent: 'center',  // Centers content horizontally
                            alignItems: 'center',
                            gap: 2,
                            width: '100%',
                            maxWidth: 600,
                            overflowY: "auto", // Allow scrolling if needed
                            scrollbarWidth: "none",
                            "&::-webkit-scrollbar": { display: "none" },
                            marginBottom: 4,
                        }}
                    >
                        {userProfile?.posts?.map((post) => (
                            <Box
                                key={post.postId} // Use postId if available
                                sx={{
                                    position: "relative", // Required for absolute positioning inside
                                    width: '100%',
                                    paddingTop: '100%', // Makes it a perfect square
                                    backgroundColor: 'grey.300',
                                    borderRadius: 2,
                                    overflow: "hidden", // Prevents overflow issues
                                }}
                            >
                                <img
                                    src={post.image} // Post image URL
                                    alt="User Post"
                                    style={{
                                        width: "100%", // Ensure it fills the container
                                        height: "100%",
                                        objectFit: "cover",
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                    }}
                                />
                            </Box>
                        ))}

                    </Box>)}

                </Box>)}

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