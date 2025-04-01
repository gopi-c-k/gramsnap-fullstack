import React, { useState } from "react";
import { Box, Typography, Menu, MenuItem, TextField, CircularProgress } from "@mui/material";
import axios from "axios";

const FollowMenu = ({ userId, open, onClose,anchorEl, follower }) => {
    const [followers, setFollowers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchFollowers = async () => {
        setLoading(true);
        try {
            const endpoint = follower ? "followers" : "following"; // Use the condition to determine the endpoint
            const res = await axios.get(`https://gramsnap-backend.onrender.com/user/${endpoint}`, {
                params: { userId },  // Pass userId as query parameters
                withCredentials: true,  // Ensure credentials are sent with the request
            });
            if (res.status === 200) {
                console.log(res.data);
                setFollowers(res.data); // Set fetched followers or following
            }
            if (res.status === 200) {
                setFollowers(res.data); // Set fetched followers
            }
        } catch (error) {
            console.error("Error fetching followers:", error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (open) {
            fetchFollowers();
        }
    }, [open, userId]);

    const filteredFollowers = followers.filter(follower =>
        follower.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box sx={{
            position: "fixed", // Position fixed to the screen
            top: "50%", // 50% from the top
            left: "50%", // 50% from the left
            transform: "translate(-50%, -50%)", // Center the menu using translate
            zIndex: 1300, // Make sure it's above other elements
        }}>
            <Menu
                open={open}
                onClose={onClose}
                anchorEl={anchorEl}  // Anchor element where menu will open
                anchorOrigin={{ vertical: "top", horizontal: "center" }} // Position from anchor
                transformOrigin={{ vertical: "top", horizontal: "center" }} // Adjust transform from anchor
            >
                {followers.map((follower) => (
                    <MenuItem key={follower.userId}>{follower.name}</MenuItem>
                ))}
            </Menu>
        </Box>
    );
};

export default FollowMenu;
