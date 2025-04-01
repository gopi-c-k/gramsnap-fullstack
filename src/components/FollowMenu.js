import React, { useState } from "react";
import { Box, Typography, Menu, MenuItem, TextField, CircularProgress } from "@mui/material";
import axios from "axios";

const FollowMenu = ({ userId, open, onClose, follower }) => {
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
        <Menu
            open={open}
            onClose={onClose}
            sx={{
                mt: 1,
                position: "fixed", // Position fixed to center on the screen
                top: "50%", // Position from top 50% of the screen
                left: "50%", // Position from left 50% of the screen
                transform: "translate(-50%, -50%)", // Offset the menu by half of its own width and height to center it
                zIndex: 1300, // Make sure the menu is on top of other elements
            }}
        >
            <Box sx={{ p: 1 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </Box>

            {loading ? (
                <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
                    <CircularProgress size={24} />
                </Box>
            ) : (
                filteredFollowers.map((follower) => (
                    <MenuItem key={follower.userId}>
                        <img
                            src={follower.profilePicture || "/default-profile.png"}
                            alt={follower.name}
                            style={{ width: 30, height: 30, borderRadius: "50%", marginRight: 10 }}
                        />
                        {follower.name}
                    </MenuItem>
                ))
            )}
        </Menu>
    );
};

export default FollowMenu;
