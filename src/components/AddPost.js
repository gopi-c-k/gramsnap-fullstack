import React, { useState, useRef } from 'react'
import { useMediaQuery, useTheme } from "@mui/material";
import { Box, Typography, Avatar, Divider, Button, List, ListItem, ListItemAvatar, ListItemText, TextField, Slider } from "@mui/material";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { useNavigate } from "react-router-dom";
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import PostAddIcon from '@mui/icons-material/PostAdd';
import MessageIcon from '@mui/icons-material/Message';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';


const AddPost = ({ info }) => {
    const navigate = useNavigate();
    const [image, setImage] = useState(null);
    const [cropData, setCropData] = useState(null);
    const cropperRef = useRef(null);
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const { theme, prefersDarkMode } = info;
    const [selected, setSelected] = useState("Add Post");
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


    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Crop Image
    const cropImage = () => {
        if (cropperRef.current) {
            const croppedCanvas = cropperRef.current.cropper.getCroppedCanvas();
            setCropData(croppedCanvas.toDataURL()); // Convert to base64
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
                <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>

                    {!image && (<>
                        <Typography></Typography>
                        <Box>
                            <AddAPhotoIcon sx={{ fontSize: "100px" }}></AddAPhotoIcon>

                        </Box><input
                            accept="image/*"
                            style={{ display: "none" }}
                            id="upload-photo"
                            type="file"
                            onChange={handleFileChange}
                        />
                        <label htmlFor="upload-photo">
                            <Button
                                variant="contained"
                                size="small"
                                component="span"
                                sx={{
                                    backgroundColor: "#0095f6",
                                    color: "#fff",
                                    "&:hover": { backgroundColor: "#0077cc" },
                                }}
                            >
                                Select from your device
                            </Button>
                        </label>
                    </>)}
                    {/* Image Cropper */}
                    {image && !cropData && (
                        <div style={{ marginTop: 20 }}>
                            <Cropper
                                src={image}
                                style={{ height: 300, width: 300 }}
                                aspectRatio={1} // Always crop to square
                                viewMode={1}
                                guides={false}
                                ref={cropperRef}
                                background={false}
                                autoCropArea={1}
                            />
                            <Button variant="contained" onClick={cropImage} sx={{ marginTop: 2 }}>
                                Crop Image
                            </Button>
                        </div>
                    )}
                    {/* Adjust Filters */}
                    {cropData && (
                        <div style={{ marginTop: 2 }}>
                            <h3>Adjust Filters</h3>
                            <label>Brightness</label>
                            <Slider value={brightness} min={50} max={200} onChange={(e, val) => setBrightness(val)} />
                            <label>Contrast</label>
                            <Slider value={contrast} min={50} max={200} onChange={(e, val) => setContrast(val)} />

                            {/* Show Processed Image */}
                            <div style={{ marginTop: 20 }}>
                                <h3>Final Image</h3>
                                <img
                                    src={cropData}
                                    alt="Cropped"
                                    style={{
                                        maxWidth: "100%",
                                        filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                                    }}
                                />
                            </div>
                        </div>
                    )}
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

export default AddPost