import React, { useState } from 'react'
import { useMediaQuery, useTheme } from "@mui/material";
import { Box, Typography, Avatar, Divider, Button, List, ListItem, Backdrop, CircularProgress, ListItemAvatar, ListItemText, TextField, InputBase, IconButton, Paper } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from "react-router-dom";
import HomeIcon from '@mui/icons-material/Home';
import PostAddIcon from '@mui/icons-material/PostAdd';
import MessageIcon from '@mui/icons-material/Message';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { LOCAL_HOST } from './variable';
import axios from 'axios';
import UserProfile from './UserProfile';

const Search = ({ info }) => {


    const navigate = useNavigate();
    const [selectedUser, setSelectedUser] = useState(null);

    const { theme, prefersDarkMode } = info;
    const [selected, setSelected] = useState("Search");
    const muiTheme = useTheme();
    const isDesktop = useMediaQuery(muiTheme.breakpoints.up('lg'));
    //  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

    // Menu Items
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
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    border: prefersDarkMode ? "1px solid white" : "1px solid black"
                }}
            />, route: "/profile"
        },
        { name: "Settings", icon: <SettingsIcon />, route: "/settings" },
        { name: "Log Out", icon: <LogoutIcon />, route: "/home", isLogout: true },
    ];


    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const handleSearch = async (event) => {
        const term = event.target.value;
        setSearchTerm(term);
        setSearchResults([]);
        try {
            const response = await axios.post(`https://gramsnap-backend-bj65.onrender.com/search/${term}`, { withCredentials: true });
            if (response.status === 200) {
                setSearchResults(response.data)
            }
        } catch (error) {
            console.log("Error occured: " + error);
        }
    };
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
                <Box sx={{ flexGrow: 1, display: "flex", mb: "auto", alignItems: "center", justifyContent: "center", flexDirection: "row", padding: "10px 15px", height:selectedUser && "100vh" }}>
                    {/* Search Bar */}
                    {selectedUser ? (<><UserProfile userId={selectedUser.userId} /></>) : (<>
                        <Box
                            sx={{
                                position: 'relative',
                                width: '100%',
                                maxWidth: '500px',
                            }}
                        >
                            {/* Search Input */}
                            <Paper
                                component="form"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    width: '100%',
                                    borderRadius: '20px',
                                    boxShadow: 'none',
                                    border: '1px solid #e0e0e0',
                                }}
                            >
                                <IconButton sx={{ p: '10px' }} aria-label="search">
                                    <SearchIcon />
                                </IconButton>
                                <InputBase
                                    placeholder="Search…"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    sx={{ ml: 1, flex: 1 }}
                                />
                            </Paper>

                            {/* Search Results Dropdown */}
                            {searchTerm && (
                                <Paper
                                    sx={{
                                        position: 'absolute',
                                        top: '110%',
                                        left: 0,
                                        right: 0,
                                        zIndex: 1,
                                        maxHeight: '300px',
                                        overflowY: 'auto',
                                        borderRadius: '6px',
                                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                                    }}
                                >
                                    <List>
                                        {searchResults.length > 0 ? (
                                            searchResults.map((result) => (
                                                <ListItem button key={result.userId} sx={{ py: 1.5 }} onClick={() => setSelectedUser(result)}  >
                                                    <Avatar alt="User Profile" src={result.profilePicture} sx={{
                                                        width: 40,  // Adjust size as necessary
                                                        height: 40,
                                                        borderRadius: '50%',
                                                        marginRight: 4
                                                    }} />
                                                    <ListItemText
                                                        primary={result.userId}
                                                        secondary={result.name}
                                                        primaryTypographyProps={{ fontWeight: 'medium' }}
                                                        secondaryTypographyProps={{ color: 'text.secondary' }}
                                                    />

                                                </ListItem>
                                            ))
                                        ) : (
                                            <ListItem
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center"
                                                }}
                                            >
                                                <CircularProgress color="inherit" />
                                            </ListItem>
                                        )}
                                    </List>
                                </Paper>
                            )}
                        </Box>
                    </>)}
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

export default Search