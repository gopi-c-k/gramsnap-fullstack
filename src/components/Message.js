import React, { useEffect, useState, useRef } from 'react'
import { useMediaQuery, useTheme } from "@mui/material";
import { Box, Typography, Avatar, Divider, Button, List, CircularProgress, Backdrop, InputBase, IconButton, Paper, ListItem, ListItemAvatar, ListItemText, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import PostAddIcon from '@mui/icons-material/PostAdd';
import SendIcon from "@mui/icons-material/Send";
import MessageIcon from '@mui/icons-material/Message';
import CallIcon from "@mui/icons-material/Call";
import VideocamIcon from "@mui/icons-material/Videocam";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import PendingIcon from '@mui/icons-material/Pending';
import DoneIcon from "@mui/icons-material/Done"; // Single tick
import DoneAllIcon from "@mui/icons-material/DoneAll"; // Double tick
import { LOCAL_HOST } from "./variable";
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from "axios";


export const Message = ({ info, socket }) => {


    // const [users, setUsers] = useState([{id:1,username:"Gopi",profilePicture:null,lastMessage:"Ilove you"}]);
    const [users, setUsers] = useState([]);
    const [msgLoading, setMsgLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    // const users = [
    //     { id: 1, name: "John Doe", avatar: "https://i.pravatar.cc/150?img=1", lastSeen: "Online", lastMessage: "Hey dude!" },
    //     { id: 2, name: "Jane Smith", avatar: "https://i.pravatar.cc/150?img=2", lastSeen: "Last seen 5 min ago" },
    //     { id: 3, name: "Mike Johnson", avatar: "https://i.pravatar.cc/150?img=3", lastSeen: "Last seen 20 min ago" },
    //     { id: 4, name: "Emma Watson", avatar: "https://i.pravatar.cc/150?img=4", lastSeen: "Online" }
    // ];

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const { userId, name, email, profilePicture } = userInfo;
    useEffect(() => {
        const fetchUsersChat = async () => {
            try {
                const response = await axios.get(`${LOCAL_HOST}/chat/conversations/${userId}`, { withCredentials: true });
                if (response.status === 200) {
                    // // Debug
                    //  console.log(response.data)
                    setLoading(false);
                    setUsers(response.data)
                    // console.log(userProfile);
                }
            } catch (error) {
                console.log("Error occured: " + error);
            }
        }
        if (userId) fetchUsersChat();
    }, []);

    const navigate = useNavigate();
    const { theme, prefersDarkMode } = info;
    const [selected, setSelected] = useState("Message");
    const muiTheme = useTheme();
    const isDesktop = useMediaQuery(muiTheme.breakpoints.up('lg'));
    //  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
    const getTimeAgo = (timestamp) => {
        const now = new Date();
        const past = new Date(timestamp);
        const diffInSeconds = Math.floor((now - past) / 1000); // Difference in seconds

        if (diffInSeconds < 60) return "Just now"; // Less than 1 minute
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes} min ago`; // Less than 1 hour
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} hr ago`; // Less than 1 day
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} d ago`; // Less than a week
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} w ago`; // Less than a month
        if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} mo ago`; // Less than a year
        return `${Math.floor(diffInDays / 365)} yr ago`; // 1+ years ago
    };

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
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [userMessages, setUserMessages] = useState({}); // Stores messages per user
    const [userPages, setUserPages] = useState({}); // Tracks last page per user


    /// Sockets Listening
    useEffect(() => {
        if (socket) {
            socket.on("userOffline", ({ userId, lastSeen }) => { // ✅ Use `userId`, not `id`
                console.log(`❌ User ${userId} went offline`);
                setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                        user.userId === userId ? { ...user, online: false } : user
                    )
                );

                setUserMessages((prevMessages) => {
                    if (!prevMessages[userId]) return prevMessages;

                    return {
                        ...prevMessages,
                        [userId]: {
                            ...prevMessages[userId],
                            lastSeen,
                            online: false,
                        },
                    };
                });

                if (selectedUser?.userId === userId) {
                    setSelectedUser((prev) => ({ ...prev, online: false, lastSeen }));
                }
            });

            return () => {
                socket.off("userOffline");
            };
        } else {
            console.log("Socket not got userOffline Message.js")
        }
    }, [selectedUser]);

    useEffect(() => {
        if (socket) {
            socket.on("userOnline", ({ userId }) => { // ✅ Now using `userId`
                //   console.log(`🟢 User ${userId} is now online`);
                setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                        user.userId === userId ? { ...user, online: true } : user
                    )
                );

                setUserMessages((prevMessages) => {
                    if (!prevMessages[userId]) return prevMessages;

                    return {
                        ...prevMessages,
                        [userId]: {
                            ...prevMessages[userId],
                            online: true,
                        },
                    };
                });

                if (selectedUser?.userId === userId) {
                    setSelectedUser((prev) => ({ ...prev, online: true }));
                }
            });

            return () => {
                socket.off("userOnline");
            };
        } else {
            console.log("Socket not got userOffline Message.js");
        }
    }, [selectedUser]);



    const handleUserClick = async (user, newChat = false) => {
        setMsgLoading(true);
        setSelectedUser(user);

        const userIdKey = user.userId; // Unique key per user

        // Set initial state for this user if it doesn't exist yet
        if (!userMessages[userIdKey]) {
            // Use functional update to ensure we're working with latest state
            setUserMessages(prev => ({
                ...prev,
                [userIdKey]: []
            }));
        }

        // Calculate current page
        const currentPage = newChat ? 1 : (userPages[userIdKey] || 1);

        // If it's a new chat, reset messages for this user
        if (newChat) {
            setUserMessages(prev => ({
                ...prev,
                [userIdKey]: []
            }));
        }

        try {
            const res = await axios.get(`https://gramsnap-backend.onrender.com/chat/messages`, {
                params: {
                    senderId: userId,
                    receiverId: userIdKey,
                    page: currentPage,
                    limit: 10,
                },
            });

            if (res.status === 200) {
                const newMessages = Array.isArray(res.data.messages) ? res.data.messages : [];

                // Immediately update messages for this specific user
                setUserMessages(prev => {
                    // Ensure both newMessages and currentUserMessages are arrays
                    const currentUserMessages = Array.isArray(prev[userIdKey]) ? prev[userIdKey] : [];
                    const newMessages = Array.isArray(res.data?.messages) ? res.data.messages : [];

                    return {
                        ...prev,
                        [userIdKey]: newChat
                            ? newMessages // Replace messages if it's a new chat
                            : [...newMessages, ...currentUserMessages], // Append older messages
                    };
                });
                setMsgLoading(false);
                // Update page counter if we received messages
                if (newMessages.length > 0) {
                    setUserPages(prev => ({
                        ...prev,
                        [userIdKey]: currentPage + 1
                    }));
                }
            }

        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            // setMsgLoading(false);
        }
    };
    const [isLoading, setIsLoading] = useState(false);

    const chatBoxRef = useRef(null);
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [newMessage]); // Runs when messages update

    useEffect(() => {
        setTimeout(() => {
            if (chatBoxRef.current) {
                chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
            }
        }, 0); // Ensure it runs after first render
    }, []);

    const [loadingMore, setLoadingMore] = useState(false);
    const handleScroll = () => {
        if (chatBoxRef.current) {
            if (chatBoxRef.current.scrollTop === 0) { // User reached the top
                loadMoreMessages();
            }
        }
    };

    const loadMoreMessages = async () => {
        if (loadingMore || page > totalPages) return; // Prevent duplicate API calls

        setLoadingMore(true); // Show loader

        try {
            const res = await axios.get(`${LOCAL_HOST}/chat/messages`, {
                params: {
                    senderId: userId,
                    receiverId: selectedUser.userId,
                    page: page + 1, // Fetch next page
                    limit: 10,
                },
            });

            if (res.status === 200) {
                const newMessages = res.data.messages || [];

                if (newMessages.length > 0) {
                    setUserMessages(prev => ({
                        ...prev,
                        [selectedUser.userId]: [...newMessages, ...(prev[selectedUser.userId] || [])] // Append new messages at the top
                    }));
                    setPage(prevPage => prevPage + 1);
                }
                handleUserClick(selectedUser);
            }
        } catch (error) {
            console.error("Error fetching older messages:", error);
        } finally {
            setLoadingMore(false); // Hide loader
        }
    };



    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedUser) return;
        // const tempMessageId = Date.now().toString();
        // const tempMessage = {
        //     _id: tempMessageId, // Temporary ID
        //     senderId: userId,
        //     receiverId: selectedUser.userId,
        //     message: newMessage,
        //     status: "sending",
        //     createdAt: new Date().toISOString(),
        // };
        // setUserMessages(prevMessages => ({
        //     ...prevMessages,
        //     [selectedUser.userId]: [
        //         ...(prevMessages[selectedUser.userId] || []), // Keep previous messages
        //         tempMessage, // Append new message
        //     ]
        // }));
        try {
            const res = await axios.post(`${LOCAL_HOST}/chat/send`, {
                senderId: userId,
                receiverId: selectedUser.userId,
                message: newMessage,
            }, { withCredentials: true });

            if (res.status === 201) {

                const newMsgData = res.data;
                newMsgData.message = newMessage; // Ensure the message is included
                let user = selectedUser;
                user.lastMessage = newMessage;
                setSelectedUser(user);

                // setUserMessages(prevMessages => ({
                //     ...prevMessages,
                //     [selectedUser.userId]: prevMessages[selectedUser.userId].map(msg =>
                //         msg._id === tempMessageId ? { ...msg, status: newMsgData.status } : msg
                //     ),
                // }));
                setUserMessages(prevMessages => ({
                    ...prevMessages,
                    [selectedUser.userId]: [
                        ...(prevMessages[selectedUser.userId] || []), // Keep previous messages
                        newMsgData, // Append new message
                    ]
                }));
                if (socket) {
                    console.log(newMsgData);
                    socket.emit("sendMessage", newMsgData);
                }
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
        setNewMessage(""); // Clear input field

    };
    //  const selectedUserRef = useRef(selectedUser);
    useEffect(() => {
        if (socket) {
            socket.on("receiveMessage", (message) => {
                if (message.senderId === selectedUser.userId) {
                    setUserMessages(prevMessages => ({
                        ...prevMessages,
                        [message.senderId]: [
                            ...(prevMessages[message.senderId] || []), // Keep previous messages
                            message, // Append new message
                        ]
                    }));
                    console.log("Same User");
                    message.status = "seen";
                    let user = selectedUser;
                    user.lastMessage = message.message;
                    setSelectedUser(user);
                    socket.emit("markMessageSeen", message);
                }
            });
        }

        return () => {
            socket.off("receiveMessage");
        };
    }, [socket, selectedUser]);
    useEffect(() => {
        if (socket) {
            socket.on("markMessageSee", (message) => {
                console.log("Markmessagesee");
                if (message.receiverId === selectedUser.userId) {
                    setUserMessages(prevMessages => ({
                        ...prevMessages,
                        [message.receiverId]: prevMessages[message.receiverId]?.map(msg =>
                            msg.id === message.id ? { ...msg, status: "seen" } : msg
                        ) || []
                    }));
                }
            });
        }

        return () => {
            socket.off("markMessageSee");
        };
    }, [socket, selectedUser]);



    const handleSearch = async (event) => {
        const term = event.target.value;
        setSearchTerm(term);
        setSearchResults([]);

    };
    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <Backdrop sx={{ color: "#fff", zIndex: 1300 }} open={loading}>
                    <CircularProgress color="inherit" />
                </Backdrop>
            </Box>
        );
    }
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
                {/* Main Content To add mesage list  */}
                <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "row" }}>
                    {/* Message chat recepient */}
                    {isDesktop ? (<>
                        <Box sx={{ borderRight: "1px solid #ddd", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minWidth: "24%", padding: "10px", height: "100vh" }}>
                            <Box>
                                <Paper
                                    component="form"
                                    sx={{ display: 'flex', alignItems: 'center', width: '100%', borderRadius: '20px', padding: "5px", marginBottom: "10px", boxShadow: "none", border: "1px solid #e0e0e0" }}
                                >
                                    <IconButton sx={{ p: '10px' }}>
                                        <SearchIcon />
                                    </IconButton>
                                    <InputBase
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={handleSearch}
                                        sx={{ ml: 1, flex: 1 }}
                                    />
                                </Paper>
                            </Box>

                            {/* Chat List */}
                            <Box sx={{
                                overflowY: "auto", flexGrow: 1, width: "100%", scrollbarWidth: "thin", // Firefox
                                scrollbarColor: "#888 transparent", // Firefox

                                "&::-webkit-scrollbar": {
                                    width: "8px"
                                },
                                "&::-webkit-scrollbar-track": {
                                    background: "transparent" // Hides the track
                                },
                                "&::-webkit-scrollbar-thumb": {
                                    backgroundColor: "#888", // Thumb color
                                    borderRadius: "10px"
                                },
                                "&::-webkit-scrollbar-thumb:hover": {
                                    backgroundColor: "#555" // Hover effect
                                }
                            }}>
                                {users
                                    .filter(user => user?.username.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map(user => (
                                        <Box
                                            key={user.userId}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                padding: "10px",
                                                borderRadius: "10px",
                                                width: "100%",
                                                cursor: "pointer",
                                                backgroundColor: selectedUser?.userId === user.userId ? "#7b6cc2" : "transparent",
                                                "&:hover": { backgroundColor: "#e0e0e0" }
                                            }}
                                            onClick={() => handleUserClick(user)}
                                        >
                                            <Avatar src={user.profilePicture} sx={{ width: 40, height: 40, marginRight: "10px" }} />
                                            <Box sx={{ width: "100%" }}>
                                                <Box sx={{ display: "flex", flexDirection: "row", width: "100%" }}>
                                                    <Typography variant="body1" fontWeight="bold">{user.username}</Typography>
                                                    <Box
                                                        sx={{
                                                            width: "8px", // Small dot size
                                                            height: "8px",
                                                            marginLeft: "auto",
                                                            borderRadius: "50%", // Makes it round
                                                            backgroundColor: user.online ? "green" : "yellow", // Change to "green" for a green dot
                                                            display: "inline-block", // Ensures it behaves like a small dot
                                                        }}
                                                    />
                                                </Box>
                                                <Box sx={{ display: "flex", flexDirection: "row", width: "100%" }}>
                                                    <Typography variant="body2" color="textSecondary">{user.lastMessage}</Typography>
                                                    <Typography variant="body2" color="textSecondary" sx={{ marginLeft: "auto" }}>{getTimeAgo(user.createdAt)}</Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    ))}
                            </Box>
                        </Box>
                        {/* Message Page */}
                        <Box sx={{ width: "75%", height: "100vh", display: "flex", flexDirection: "column", }}>
                            {selectedUser ? (
                                msgLoading ? (<>
                                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                                        <CircularProgress color="inherit" />
                                    </Box>
                                </>) : (<>
                                    {/* Chat Header */}
                                    <Box sx={{ padding: "10px", borderBottom: "1px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        {/* User Info */}
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <ArrowBackIosNewIcon fontSize="small" sx={{ margin: "10px" }} onClick={() => setSelectedUser(null)} cursor="pointer"></ArrowBackIosNewIcon>
                                            <Avatar src={selectedUser.profilePicture} sx={{ width: 40, height: 40, marginRight: "10px" }} />
                                            <Box>
                                                <Typography variant="h6">{selectedUser.username}</Typography>
                                                <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                                                    <Box
                                                        sx={{
                                                            width: "8px", // Small dot size
                                                            height: "8px",
                                                            marginRight: "4px",
                                                            borderRadius: "50%", // Makes it round
                                                            backgroundColor: selectedUser.online ? "green" : "yellow", // Change to "green" for a green dot
                                                            display: "inline-block", // Ensures it behaves like a small dot
                                                        }}
                                                    />
                                                    <Typography variant="body2" color="textSecondary">{selectedUser.online ? "online" : getTimeAgo(selectedUser.lastSeen)}</Typography>

                                                </Box>
                                            </Box>
                                        </Box>

                                        {/* Call Buttons */}
                                        <Box>
                                            <IconButton color="primary">
                                                <CallIcon />
                                            </IconButton>
                                            <IconButton color="primary">
                                                <VideocamIcon />
                                            </IconButton>
                                        </Box>
                                    </Box>

                                    {/* Chat Messages */}
                                    <>
                                        <Box
                                            ref={chatBoxRef}
                                            sx={{
                                                flexGrow: 1,
                                                overflowY: "auto",
                                                padding: "10px",
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "flex-start", // Default alignment for received messages
                                                scrollbarWidth: "thin",
                                                scrollbarColor: "#888 transparent",
                                                "&::-webkit-scrollbar": { width: "8px" },
                                                "&::-webkit-scrollbar-track": { background: "transparent" },
                                                "&::-webkit-scrollbar-thumb": { backgroundColor: "#888", borderRadius: "10px" },
                                                "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "#555" },
                                            }}
                                        >
                                            {/* Show Loading Indicator When Fetching Older Messages */}
                                            {loadingMore && (
                                                <Box sx={{ display: "flex", justifyContent: "center", padding: "10px" }}>
                                                    <CircularProgress size={20} />
                                                </Box>
                                            )}
                                            {selectedUser?.userId && Array.isArray(userMessages[selectedUser.userId]) && userMessages[selectedUser.userId].length > 0 ? (
                                                userMessages[selectedUser.userId].map((msg) => (
                                                    <Box key={msg._id} sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                                                        {/* Message Box */}
                                                        <Box
                                                            sx={{
                                                                maxWidth: "80%",
                                                                wordBreak: "break-word",
                                                                display: "flex",
                                                                flexDirection: "row",
                                                                whiteSpace: "pre-wrap",
                                                                padding: "8px 12px",
                                                                display: "inline-block",
                                                                borderRadius: "12px",
                                                                marginBottom: "8px",
                                                                backgroundColor: msg.senderId === userId ? "#7b6cc2" : "#e0e0e0",
                                                                color: msg.senderId === userId ? "#fff" : "#000",
                                                                position: "relative",
                                                                alignSelf: msg.senderId === userId ? "flex-end" : "flex-start", // FIX: Align messages properly
                                                            }}
                                                        >
                                                            {msg.message}
                                                            {msg.senderId === userId && (
                                                                <Box
                                                                // sx={{
                                                                //     position: "absolute",
                                                                //     bottom: "0px",
                                                                //     right: "0px",
                                                                //     display: "flex",
                                                                //     alignItems: "center",
                                                                // }}
                                                                >
                                                                    {msg.status === "sent" && <DoneIcon fontSize="10px" sx={{ opacity: 0.7 }} />}
                                                                    {msg.status === "sending" && <PendingIcon fontSize="10px" sx={{ opacity: 0.7 }} />}
                                                                    {msg.status === "delivered" && <DoneAllIcon fontSize="10px" sx={{ opacity: 0.7 }} />}
                                                                    {msg.status === "seen" && <DoneAllIcon fontSize="10px" sx={{ color: "blue", opacity: 0.7 }} />}
                                                                </Box>
                                                            )}


                                                        </Box>

                                                        {/* Timestamp */}
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                fontSize: "0.7rem",
                                                                textAlign: msg.senderId === userId ? "right" : "left",
                                                                alignSelf: msg.senderId === userId ? "flex-end" : "flex-start", // FIX: Align timestamp correctly
                                                                marginTop: "3px",
                                                                marginBottom: "10px",
                                                            }}
                                                        >
                                                            {getTimeAgo(msg.createdAt)}
                                                        </Typography>
                                                    </Box>
                                                ))
                                            ) : (
                                                <Typography variant="caption" sx={{ textAlign: "center", marginTop: "10px", color: "#888" }}>
                                                    No messages yet.
                                                </Typography>
                                            )}
                                        </Box>


                                        {/* Message Input */}
                                        <Box sx={{ padding: "10px", display: "flex", alignItems: "center" }}>
                                            <TextField
                                                fullWidth
                                                placeholder="Type a message..."
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                sx={{ flexGrow: 1, borderRadius: "20px" }}
                                            />
                                            <IconButton color="primary" onClick={handleSendMessage}>
                                                <SendIcon />
                                            </IconButton>
                                        </Box>
                                    </>
                                </>)
                            ) : (
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flexGrow: 1 }}>
                                    <Typography variant="h6" color="textSecondary">Select a chat to start messaging</Typography>
                                </Box>
                            )}
                        </Box></>) : (<>
                            {!selectedUser ?

                                (<Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minWidth: "100%", padding: "10px", height: "100vh" }}>
                                    <Box sx={{ marginRight: "auto", width: "100%" }}>
                                        <Paper
                                            component="form"
                                            sx={{ display: 'flex', alignItems: 'center', width: '100%', borderRadius: '20px', padding: "5px", width: "100%", marginBottom: "10px", marginRight: "auto", boxShadow: "none", border: "1px solid #e0e0e0" }}
                                        >
                                            <IconButton sx={{ p: '10px' }}>
                                                <SearchIcon />
                                            </IconButton>
                                            <InputBase
                                                placeholder="Search..."
                                                value={searchTerm}
                                                onChange={handleSearch}
                                                sx={{ ml: 1, flex: 1 }}
                                            />
                                        </Paper>
                                    </Box>

                                    {/* Chat List */}
                                    <Box sx={{
                                        overflowY: "auto", flexGrow: 1, width: "100%", scrollbarWidth: "thin", // Firefox
                                        scrollbarColor: "#888 transparent", // Firefox

                                        "&::-webkit-scrollbar": {
                                            width: "8px"
                                        },
                                        "&::-webkit-scrollbar-track": {
                                            background: "transparent" // Hides the track
                                        },
                                        "&::-webkit-scrollbar-thumb": {
                                            backgroundColor: "#888", // Thumb color
                                            borderRadius: "10px"
                                        },
                                        "&::-webkit-scrollbar-thumb:hover": {
                                            backgroundColor: "#555" // Hover effect
                                        }
                                    }}>
                                        {users
                                            .filter(user => user.username.toLowerCase().includes(searchTerm.toLowerCase()))
                                            .map(user => (
                                                <Box
                                                    key={user.userId}
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        padding: "10px",
                                                        borderRadius: "10px",
                                                        width: "100%",
                                                        cursor: "pointer",
                                                        backgroundColor: selectedUser?.userId === user.userId ? "#7b6cc2" : "transparent",
                                                        "&:hover": { backgroundColor: "#e0e0e0" }
                                                    }}
                                                    onClick={() => handleUserClick(user)}
                                                >
                                                    <Avatar src={user.profilePicture} sx={{ width: 40, height: 40, marginRight: "10px" }} />
                                                    <Box sx={{ width: "100%" }}>
                                                        <Box sx={{ display: "flex", flexDirection: "row", width: "100%" }}>
                                                            <Typography variant="body1" fontWeight="bold">{user.username}</Typography>
                                                            <Box
                                                                sx={{
                                                                    width: "8px", // Small dot size
                                                                    height: "8px",
                                                                    marginLeft: "auto",
                                                                    borderRadius: "50%", // Makes it round
                                                                    backgroundColor: user.online ? "green" : "yellow", // Change to "green" for a green dot
                                                                    display: "inline-block", // Ensures it behaves like a small dot
                                                                }}
                                                            />
                                                        </Box>
                                                        <Box sx={{ display: "flex", flexDirection: "row", width: "100%" }}>
                                                            <Typography variant="body2" color="textSecondary">{user.lastMessage}</Typography>
                                                            <Typography variant="body2" color="textSecondary" sx={{ marginLeft: "auto" }}>{getTimeAgo(user.createdAt)}</Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            ))}
                                    </Box>
                                </Box>) : (<Box sx={{ width: "100%", height: "92vh", display: "flex", flexDirection: "column", marginBottom: "auto" }}>
                                    {msgLoading ? (<>
                                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                                            <CircularProgress color="inherit" />
                                        </Box>
                                    </>) : (
                                        <>
                                            {/* Chat Header */}
                                            <Box sx={{ padding: "10px", borderBottom: "1px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                {/* User Info */}
                                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                                    <ArrowBackIosNewIcon fontSize="small" sx={{ margin: "10px" }} onClick={() => setSelectedUser(null)} ></ArrowBackIosNewIcon>
                                                    <Avatar src={selectedUser.profilePicture} sx={{ width: 40, height: 40, marginRight: "10px" }} />
                                                    <Box>
                                                        <Typography variant="h6">{selectedUser.username}</Typography>
                                                        <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                                                            <Box
                                                                sx={{
                                                                    width: "8px", // Small dot size
                                                                    height: "8px",
                                                                    marginRight: "4px",
                                                                    borderRadius: "50%", // Makes it round
                                                                    backgroundColor: selectedUser.online ? "green" : "yellow", // Change to "green" for a green dot
                                                                    display: "inline-block", // Ensures it behaves like a small dot
                                                                }}
                                                            />
                                                            <Typography variant="body2" color="textSecondary">{selectedUser.online ? "online" : getTimeAgo(selectedUser.lastSeen)}</Typography>

                                                        </Box>
                                                    </Box>
                                                </Box>

                                                {/* Call Buttons */}
                                                <Box>
                                                    <IconButton color="primary">
                                                        <CallIcon />
                                                    </IconButton>
                                                    <IconButton color="primary">
                                                        <VideocamIcon />
                                                    </IconButton>
                                                </Box>
                                            </Box>

                                            {/* Chat Messages */}
                                            <>
                                                <Box
                                                    ref={chatBoxRef}
                                                    sx={{
                                                        flexGrow: 1,
                                                        overflowY: "auto",
                                                        padding: "10px",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        alignItems: "flex-start", // Default alignment for received messages
                                                        scrollbarWidth: "thin",
                                                        scrollbarColor: "#888 transparent",
                                                        "&::-webkit-scrollbar": { width: "8px" },
                                                        "&::-webkit-scrollbar-track": { background: "transparent" },
                                                        "&::-webkit-scrollbar-thumb": { backgroundColor: "#888", borderRadius: "10px" },
                                                        "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "#555" },
                                                    }}
                                                >
                                                    {/* Show Loading Indicator When Fetching Older Messages */}
                                                    {loadingMore && (
                                                        <Box sx={{ display: "flex", justifyContent: "center", padding: "10px" }}>
                                                            <CircularProgress size={20} />
                                                        </Box>
                                                    )}
                                                    {selectedUser?.userId && Array.isArray(userMessages[selectedUser.userId]) && userMessages[selectedUser.userId].length > 0 ? (
                                                        userMessages[selectedUser.userId].map((msg) => (
                                                            <Box key={msg._id} sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                                                                {/* Message Box */}
                                                                <Box
                                                                    sx={{
                                                                        maxWidth: "80%",
                                                                        wordBreak: "break-word",
                                                                        display: "flex",
                                                                        flexDirection: "column",
                                                                        whiteSpace: "pre-wrap",
                                                                        padding: "8px 12px",
                                                                        display: "inline-block",
                                                                        borderRadius: "12px",
                                                                        marginBottom: "8px",
                                                                        backgroundColor: msg.senderId === userId ? "#7b6cc2" : "#e0e0e0",
                                                                        color: msg.senderId === userId ? "#fff" : "#000",
                                                                        position: "relative",
                                                                        alignSelf: msg.senderId === userId ? "flex-end" : "flex-start", // FIX: Align messages properly
                                                                    }}
                                                                >
                                                                    {msg.message}
                                                                    {msg.senderId === userId && (
                                                                        <Box
                                                                        // sx={{
                                                                        //     position: "absolute",
                                                                        //     bottom: "0px",
                                                                        //     right: "0px",
                                                                        //     display: "flex",
                                                                        //     alignItems: "center",
                                                                        // }}
                                                                        >
                                                                            {msg.status === "sent" && <DoneIcon fontSize="10px" sx={{ opacity: 0.7 }} />}
                                                                            {msg.status === "sending" && <PendingIcon fontSize="10px" sx={{ opacity: 0.7 }} />}
                                                                            {msg.status === "delivered" && <DoneAllIcon fontSize="10px" sx={{ opacity: 0.7 }} />}
                                                                            {msg.status === "seen" && <DoneAllIcon fontSize="10px" sx={{ color: "blue", opacity: 0.7 }} />}
                                                                        </Box>
                                                                    )}


                                                                </Box>

                                                                {/* Timestamp */}
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        fontSize: "0.7rem",
                                                                        textAlign: msg.senderId === userId ? "right" : "left",
                                                                        alignSelf: msg.senderId === userId ? "flex-end" : "flex-start", // FIX: Align timestamp correctly
                                                                        marginTop: "3px",
                                                                        marginBottom: "10px",
                                                                    }}
                                                                >
                                                                    {getTimeAgo(msg.createdAt)}
                                                                </Typography>
                                                            </Box>
                                                        ))
                                                    ) : (
                                                        <Typography variant="caption" sx={{ textAlign: "center", marginTop: "10px", color: "#888" }}>
                                                            No messages yet.
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </>

                                            {/* Message Input */}
                                            <Box sx={{ padding: "10px", display: "flex", alignItems: "center" }}>
                                                <TextField
                                                    fullWidth
                                                    placeholder="Type a message..."
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    sx={{ flexGrow: 1, borderRadius: "20px" }}
                                                />
                                                <IconButton color="primary" onClick={handleSendMessage}>
                                                    <SendIcon />
                                                </IconButton>
                                            </Box>
                                        </>)}
                                </Box>)}
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
            </Box >
        </>
    )
}
