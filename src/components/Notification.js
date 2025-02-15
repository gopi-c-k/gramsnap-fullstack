import React from 'react';
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

const notifications = [
    { id: 1, user: 'John Doe', message: 'liked your post', type: 'like', avatar: 'https://example.com/avatar1.jpg' },
    { id: 2, user: 'Jane Smith', message: 'sent you a follow request', type: 'follow-request', avatar: 'https://example.com/avatar2.jpg' },
    { id: 3, user: 'Alice Johnson', message: 'started following you', type: 'follow', avatar: 'https://example.com/avatar3.jpg' },
];

const recommendedUsers = [
    { id: 1, user: 'Emily Davis', avatar: 'https://example.com/avatar4.jpg' },
    { id: 2, user: 'Michael Brown', avatar: 'https://example.com/avatar5.jpg' },
    { id: 3, user: 'Sarah Wilson', avatar: 'https://example.com/avatar6.jpg' },
];

const Notifications = ({ info }) => {
    const { theme, prefersDarkMode } = info;
    const navigate = useNavigate();
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
            <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>

                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Notifications
                </Typography>
                <Box>
                <ClearIcon sx={{ cursor: "pointer" }} onClick={() => navigate("/home")} />
                </Box>
            </Box>
            <List>
                {notifications.map((notification) => (
                    <ListItem
                        key={notification.id}
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
                            <Avatar src={notification.avatar} />
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Typography variant="body1">
                                    <strong>{notification.user}</strong> {notification.message}
                                </Typography>
                            }
                        />
                        {/* Icon based on notification type */}
                        {notification.type === 'like' && <FavoriteIcon color="error" />}
                        {notification.type === 'follow-request' && <PersonAddIcon color="primary" />}
                        {notification.type === 'follow' && <PersonIcon color="success" />}
                    </ListItem>
                ))}
            </List>

            {/* Divider */}
            <Divider sx={{ my: 3 }} />

            {/* Recommended Users Section */}
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                People You May Know
            </Typography>
            <List>
                {recommendedUsers.map((user) => (
                    <ListItem
                        key={user.id}
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
                            <Avatar src={user.avatar} />
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Typography variant="body1">
                                    <strong>{user.user}</strong>
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
                ))}
            </List>
        </Box>
    );
};

export default Notifications;