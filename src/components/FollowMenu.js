import React, { useState } from "react";
import { Box, Typography, Menu, MenuItem, TextField, CircularProgress } from "@mui/material";
import axios from "axios";

const FollowMenu = ({ userId, open, onClose }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [followers, setFollowers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchFollowers = async () => {
        setLoading(true);
        try {
            const res = await axios.post("https://gramsnap-backend.onrender.com/user/followers", { userId }, { withCredentials: true });
            setFollowers(res.data); // Set fetched followers
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
            sx={{ mt: 1 }}
        >
            <Box sx={{ p: 1 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search followers..."
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
