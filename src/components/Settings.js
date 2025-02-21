import React, { useState, useRef } from 'react';
import { Checkbox, Grid2, useMediaQuery, useTheme } from "@mui/material";
import { Box, Typography, Button, TextField, Divider, Grid, Slider, Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import PostAddIcon from '@mui/icons-material/PostAdd';
import MessageIcon from '@mui/icons-material/Message';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { LOCAL_HOST } from './variable';

const Settings = ({ info }) => {
    const navigate = useNavigate();
    const { theme, prefersDarkMode } = info;
    const [selected, setSelected] = useState("Settings");
    const muiTheme = useTheme();
    const isDesktop = useMediaQuery(muiTheme.breakpoints.up('lg'));

    // Menu Items
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const { userIds, names, email, profilePicture } = userInfo;
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

    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [userId, setUserId] = useState("");
    const [newUserId, setNewUserId] = useState("");
    const [profilePictures, setProfilePicture] = useState(null);
    const [message, setMessage] = useState("");
    const [pvt, setPrivate] = useState(false)

    // Image Cropper State
    const [image, setImage] = useState(null);
    const [cropData, setCropData] = useState(null);
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const cropperRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log("File selected:", file); // Debugging: Log the selected file
            const reader = new FileReader();
            reader.onload = () => {
                console.log("File read successfully:", reader.result); // Debugging: Log the file data
                setImage(reader.result);
                setCropData(null); // Reset crop data when a new image is uploaded
            };
            reader.onerror = (error) => {
                console.error("Error reading file:", error); // Debugging: Log any errors
            };
            reader.readAsDataURL(file);
        } else {
            console.log("No file selected"); // Debugging: Log if no file is selected
        }
    };

    const cropImage = () => {
        if (cropperRef.current) {
            setCropData(cropperRef.current.cropper.getCroppedCanvas().toDataURL());
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("name", name);
        formData.append("bio", bio);
        formData.append("isPrivate", pvt);
        if (newUserId) formData.append("newUserId", newUserId);
        if (cropData) {
            // Convert cropped image to a file
            const blob = await fetch(cropData).then((res) => res.blob());
            const file = new File([blob], "profile-picture.png", { type: "image/png" });
            formData.append("profilePicture", file);
        }

        try {
            const response = await axios.put(`http://${LOCAL_HOST}:5000/update`, formData, { withCredentials: true }, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setMessage(response.data.message);
            localStorage.setItem('userInfo', JSON.stringify(response.data));
        } catch (error) {
            setMessage(error.response?.data?.error || "Something went wrong");
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
                                }}>
                                {item.icon}
                                <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: "bold" }}>{item.name}</Typography>
                            </Box>
                        ))}
                    </Box>
                )}
                {/* Main Content for Settings */}
                <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                    <Box sx={{
                        width: "100%",
                        maxWidth: "600px",
                        padding: "20px",
                        overflowY: "auto",
                        scrollbarWidth: "none",
                        "&::-webkit-scrollbar": { display: "none" },
                        backgroundColor: prefersDarkMode ? "#333" : "#fff",
                        borderRadius: "8px",
                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)"
                    }}>
                        <Typography variant="h4" sx={{ fontWeight: "bold", marginBottom: "20px", textAlign: "center" }}>
                            Edit Profile
                        </Typography>
                        {message && (
                            <Typography sx={{ color: message === "Profile updated successfully" ? "green" : "red", mb: 2, textAlign: "center" }}>
                                {message}
                            </Typography>
                        )}
                        <Box component="form" onSubmit={handleSubmit}>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Current User ID"
                                        variant="outlined"
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="New User ID (optional)"
                                        variant="outlined"
                                        value={newUserId}
                                        onChange={(e) => setNewUserId(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Name"
                                        variant="outlined"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Bio"
                                        variant="outlined"
                                        multiline
                                        rows={4}
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Checkbox
                                        checked={pvt}
                                        onChange={(e) => setPrivate(!pvt)}
                                    />
                                    Set account as a private
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                        Profile Picture
                                    </Typography>
                                    {!image && (
                                        <>
                                            <input
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
                                        </>
                                    )}
                                    {image && !cropData && (
                                        <Box sx={{ marginTop: 2 }}>
                                            <Cropper
                                                src={image}
                                                style={{ height: 300, width: "100%" }}
                                                aspectRatio={1}
                                                viewMode={1}
                                                guides={false}
                                                ref={cropperRef}
                                                background={false}
                                                autoCropArea={1}
                                            />
                                            <Button
                                                variant="contained"
                                                onClick={cropImage}
                                                sx={{ marginTop: 2, width: "100%" }}
                                            >
                                                Crop Image
                                            </Button>
                                        </Box>
                                    )}
                                    {cropData && (
                                        <Box sx={{ marginTop: 2 }}>
                                            <Typography variant="h6" sx={{ mb: 2 }}>
                                                Adjust Filters
                                            </Typography>
                                            <Typography>Brightness</Typography>
                                            <Slider
                                                value={brightness}
                                                min={50}
                                                max={200}
                                                onChange={(e, val) => setBrightness(val)}
                                            />
                                            <Typography>Contrast</Typography>
                                            <Slider
                                                value={contrast}
                                                min={50}
                                                max={200}
                                                onChange={(e, val) => setContrast(val)}
                                            />
                                            <Box sx={{ marginTop: 2 }}>
                                                <Typography variant="h6" sx={{ mb: 2 }}>
                                                    Final Image
                                                </Typography>
                                                <img
                                                    src={cropData}
                                                    alt="Cropped"
                                                    style={{
                                                        maxWidth: "100%",
                                                        filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    )}
                                </Grid>
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Button
                                        fullWidth
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        sx={{ py: 1.5 }}
                                    >
                                        Update Profile
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>

                </Box>

            </Box>
        </>
    );
};

export default Settings;