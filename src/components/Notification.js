import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography,
    Avatar,
    Divider,
    Button,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonIcon from '@mui/icons-material/Person';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { LOCAL_HOST } from './variable';
import UserProfile from './UserProfile';


const Notifications = ({ info }) => {
    const { theme, prefersDarkMode } = info;
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    // ✅ Fetch notifications function
    const fetchNotifications = useCallback(async () => {
        try {
            const res = await axios.get(`https://gramsnap-backend.onrender.com/notifications`, { withCredentials: true });

            setNotifications(res.data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    }, []);

    // ✅ Fetch recommended users function
    const fetchRecommendedUsers = useCallback(async () => {
        try {
            const res = await axios.get(`https://gramsnap-backend.onrender.com/suggestions`, { withCredentials: true });
            console.log(res.data)
            setSuggestedUsers(res.data.suggestions || []);
           // console.log("Recommedations" + recommendedUsers)
        } catch (error) {
            console.error("Error fetching recommended users:", error);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        fetchRecommendedUsers();
    }, [fetchNotifications, fetchRecommendedUsers]);
    const handleConfirm = async (senderId) => {
        try {
            await axios.post(`https://gramsnap-backend.onrender.com/accept-follow`, { senderId }, { withCredentials: true });

            // 🔄 Remove the accepted follow request from state
            // setNotifications(notifications.filter((n) => n.senderId.userId !== senderId));
            fetchNotifications();

            console.log("Follow request accepted!");
        } catch (error) {
            console.error("Error accepting follow request:", error);
        }
    };
    return (
        <Box
            sx={{
                maxWidth: '100vw',
                width: '100vw',
                height: '100vh',
                padding: '20px',
                overflowY: 'auto',
                borderLeft: '1px solid #ddd',
            }}
        >
            {/* Notifications Section */}
            {selectedUser ? (<><UserProfile userId={selectedUser.userId} /></>) : (<><Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>

                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Notifications
                </Typography>
                <Box>
                    <ClearIcon sx={{ cursor: "pointer" }} onClick={() => navigate("/home")} />
                </Box>
            </Box>
                {notifications.length > 0 ? (<List>{notifications.map((notification) => (
                    <ListItem
                        key={notification._id}
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
                            <Avatar src={notification.senderId.profilePicture} />
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Typography variant="body1">
                                    <strong
                                        style={{
                                            cursor: "pointer",
                                            textDecoration: "none"
                                        }}
                                        onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                                        onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                                        onClick={() => setSelectedUser(notification.senderId)}
                                    >
                                        {notification.senderId.name}
                                    </strong>
                                    {notification.message}
                                </Typography>
                            }
                        />
                        {/* Icon based on notification type */}
                        {notification.type === 'like' && <FavoriteIcon color="error" />}
                        {notification.type === 'followRequest' && <> <PersonAddIcon color="primary" /><Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleConfirm(notification.senderId.userId)}
                        >
                            Confirm
                        </Button></>}
                        {notification.type === 'follow' && <PersonIcon color="success" />}
                        {notification.type === 'comment' && <PersonIcon color="primary" />}
                    </ListItem>
                ))} </List>) : (<Typography>No Notifications</Typography>)}

                {/* Divider */}
                <Divider sx={{ my: 3 }} />

                {/* Recommended Users Section */}
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    People You May Know
                </Typography>
                <List>
                    {suggestedUsers.length > 0 ? (suggestedUsers.map((user) => (
                        <ListItem
                            key={user.userId}
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
                                <Avatar src={user.profilePicture} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Typography variant="body1">
                                        <strong onClick={() => setSelectedUser(user.userId)} >{user.userId}</strong>
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
                    ))) : (
                        <Typography>No Recommendations</Typography>
                    )}
                </List></>)}
        </Box>
    );
};

export default Notifications;