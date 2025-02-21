import React, { useState } from 'react'
import { useMediaQuery, useTheme } from "@mui/material";
import { Box, Typography, Avatar, Divider, Button, List, ListItem, ListItemAvatar, ListItemText, TextField, InputBase, IconButton, Paper } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from "react-router-dom";
import HomeIcon from '@mui/icons-material/Home';
import PostAddIcon from '@mui/icons-material/PostAdd';
import MessageIcon from '@mui/icons-material/Message';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { LOCAL_HOST } from './variable';

const Search = ({ info }) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
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
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const handleSearch = (event) => {
        const term = event.target.value;
        setSearchTerm(term);

        // Mock search results
        const mockResults = [
            { id: "_john_doe_", name: 'John Doe' },
            { id: "_jane_smith_123", name: 'Jane Smith' },
            { id: "_go.pz_", name: 'Gopi' },
            { id: "_zp.og_", name: 'Gopika' },
            { id: "this_iz_seenu_", name: 'Seenu' },
            { id: "_gana_siva_19", name: 'Siva' },
        ].filter((item) =>
            item.name?.toLowerCase().includes(term.toLowerCase()) ||
            item.id?.toLowerCase().includes(term.toLowerCase())
        )

        setSearchResults(mockResults);
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
                <Box sx={{ flexGrow: 1, display: "flex", mb: "auto", alignItems: "center", justifyContent: "center", flexDirection: "row", padding: "10px 15px" }}>
                    {/* Search Bar */}
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
                                        searchResults.map((result, index) => (
                                            <ListItem button key={index} sx={{ py: 1.5 }}>
                                                <AccountCircleIcon sx={{fontSize: "60px", padding: "5px"}}></AccountCircleIcon>
                                                <ListItemText
                                                    primary={result.id}
                                                    secondary={result.name}
                                                    primaryTypographyProps={{ fontWeight: 'medium' }}
                                                    secondaryTypographyProps={{ color: 'text.secondary' }}
                                                />

                                            </ListItem>
                                        ))
                                    ) : (
                                        <ListItem>
                                            <ListItemText primary="No results found" />
                                        </ListItem>
                                    )}
                                </List>
                            </Paper>
                        )}
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

export default Search