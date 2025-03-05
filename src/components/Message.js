import React, { useEffect, useState } from 'react'
import { useMediaQuery, useTheme } from "@mui/material";
import { Box, Typography, Avatar, Divider, Button, List, InputBase, IconButton, Paper, ListItem, ListItemAvatar, ListItemText, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import PostAddIcon from '@mui/icons-material/PostAdd';
import SendIcon from "@mui/icons-material/Send";
import MessageIcon from '@mui/icons-material/Message';
import CallIcon from "@mui/icons-material/Call";
import VideocamIcon from "@mui/icons-material/Videocam";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import DoneIcon from "@mui/icons-material/Done"; // Single tick
import DoneAllIcon from "@mui/icons-material/DoneAll"; // Double tick
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from "axios";


export const Message = ({ info }) => {
    const [users,setUsers] = useState([])
    // const users = [
    //     { id: 1, name: "John Doe", avatar: "https://i.pravatar.cc/150?img=1", lastSeen: "Online", lastMessage: "Hey dude!" },
    //     { id: 2, name: "Jane Smith", avatar: "https://i.pravatar.cc/150?img=2", lastSeen: "Last seen 5 min ago" },
    //     { id: 3, name: "Mike Johnson", avatar: "https://i.pravatar.cc/150?img=3", lastSeen: "Last seen 20 min ago" },
    //     { id: 4, name: "Emma Watson", avatar: "https://i.pravatar.cc/150?img=4", lastSeen: "Online" }
    // ];
    
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const { userId, name, email, profilePicture } = userInfo;
    useEffect(()=>{
        const fetchUsersChat = async () =>{
            try {
                const response = await axios.get(`https://gramsnap-backend.onrender.com/chat/conversations/${userId}`, { withCredentials: true }); 
                if (response.status === 200) {
                    // Debug
                    console.log(response.data)
                   // setLoading(false);
                    setUsers(response.data)
                    // console.log(userProfile);
                }
            } catch (error) {
                console.log("Error occured: " + error);
            }
        }
        if (userId) fetchUsersChat();
    },[])
    const initialMessages = {
        1: [{ sender: "me", text: "Hello!", timestamp: "10:30 AM" }, { sender: "John Doe", text: "Hey, how are you?", timestamp: "10:31 AM" }],
        2: [{ sender: "me", text: "See you soon!", timestamp: "11:15 AM" }, { sender: "Jane Smith", text: "See you later!", timestamp: "11:16 AM" }],
        3: [{ sender: "me", text: "Hey Mike!", timestamp: "12:45 PM" }, { sender: "Mike Johnson", text: "What's up?", timestamp: "12:46 PM" }],
        4: [{ sender: "me", text: "Hi Emma!", timestamp: "1:00 PM" }, { sender: "Emma Watson", text: "Let's meet tomorrow.", timestamp: "1:01 PM" }]
    };
    const navigate = useNavigate();
    const { theme, prefersDarkMode } = info;
    const [selected, setSelected] = useState("Message");
    const muiTheme = useTheme();
    const isDesktop = useMediaQuery(muiTheme.breakpoints.up('lg'));
    //  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

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
    const [messages, setMessages] = useState(initialMessages);
    const [newMessage, setNewMessage] = useState("");


    const handleUserClick = (user) => {
        setSelectedUser(user);

        // Mark all messages as read when opening chat
        if (messages[user.id]) {
            setMessages(prevMessages => ({
                ...prevMessages,
                [user.id]: prevMessages[user.id].map(msg =>
                    msg.status === "delivered" ? { ...msg, status: "read" } : msg
                )
            }));
        }
    };

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedUser) return;

        const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        const newMsg = { sender: "me", text: newMessage, timestamp, status: "sent" };

        setMessages(prevMessages => ({
            ...prevMessages,
            [selectedUser.id]: [...(prevMessages[selectedUser.id] || []), newMsg]
        }));

        setNewMessage("");

        // Simulate message delivery after 1 sec
        setTimeout(() => {
            setMessages(prevMessages => ({
                ...prevMessages,
                [selectedUser.id]: prevMessages[selectedUser.id].map((msg, index) =>
                    index === prevMessages[selectedUser.id].length - 1 ? { ...msg, status: "delivered" } : msg
                )
            }));
        }, 1000);
    };
    const handleSearch = async (event) => {
        const term = event.target.value;
        setSearchTerm(term);
        setSearchResults([]);

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
                                                backgroundColor: selectedUser?.id === user.id ? "#e0e0e0" : "transparent",
                                                "&:hover": { backgroundColor: "#e0e0e0" }
                                            }}
                                            onClick={() => handleUserClick(user)}
                                        >
                                            <Avatar src={user.profilePicture} sx={{ width: 40, height: 40, marginRight: "10px" }} />
                                            <Box>
                                                <Typography variant="body1" fontWeight="bold">{user.username}</Typography>
                                                <Typography variant="body2" color="textSecondary">{user.lastMessage}</Typography>
                                            </Box>
                                        </Box>
                                    ))}
                            </Box>
                        </Box>
                        {/* Message Page */}
                        <Box sx={{ width: "75%", height: "100vh", display: "flex", flexDirection: "column", }}>
                            {selectedUser ? (
                                <>
                                    {/* Chat Header */}
                                    <Box sx={{ padding: "10px", borderBottom: "1px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        {/* User Info */}
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <ArrowBackIosNewIcon fontSize="small" sx={{ margin: "10px" }} onClick={() => setSelectedUser(null)} cursor="pointer"></ArrowBackIosNewIcon>
                                            <Avatar src={selectedUser.avatar} sx={{ width: 40, height: 40, marginRight: "10px" }} />
                                            <Box>
                                                <Typography variant="h6">{selectedUser.name}</Typography>
                                                <Typography variant="body2" color="textSecondary">{selectedUser.lastSeen}</Typography>
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
                                    <Box sx={{
                                        flexGrow: 1,
                                        overflowY: "auto",
                                        padding: "10px",
                                        display: "flex",
                                        flexDirection: "column",
                                        scrollbarWidth: "thin",
                                        scrollbarColor: "#888 transparent",
                                        "&::-webkit-scrollbar": { width: "8px" },
                                        "&::-webkit-scrollbar-track": { background: "transparent" },
                                        "&::-webkit-scrollbar-thumb": { backgroundColor: "#888", borderRadius: "10px" },
                                        "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "#555" }
                                    }}>
                                        {messages[selectedUser.id]?.map((msg, index) => (
                                            <>
                                                <Box key={index} sx={{
                                                    maxWidth: "80%", // Limits message width for better readability
                                                    wordBreak: "break-word", // Ensures long words wrap instead of overflowing
                                                    whiteSpace: "pre-wrap",
                                                    padding: "8px 12px",
                                                    display: "flex",
                                                    flexDirection: "row",
                                                    borderRadius: "12px",
                                                    marginBottom: "8px",
                                                    alignSelf: msg.sender === "me" ? "flex-end" : "flex-start",
                                                    backgroundColor: msg.sender === "me" ? "#7b6cc2" : "#e0e0e0",
                                                    color: msg.sender === "me" ? "#fff" : "#000",
                                                    position: "relative"
                                                }}>
                                                    {msg.text}
                                                    {msg.sender === "me" && (
                                                        <Box sx={{ marginLeft: "5px", display: "flex", alignItems: "flex-end" }}>
                                                            {msg.status === "sent" && <DoneIcon fontSize="small" />}
                                                            {msg.status === "delivered" && <DoneAllIcon fontSize="small" />}
                                                            {msg.status === "read" && <DoneAllIcon fontSize="small" sx={{ color: "blue" }} />}
                                                        </Box>
                                                    )}

                                                </Box>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        display: "block",
                                                        fontSize: "0.7rem",
                                                        textAlign: "right",
                                                        alignSelf: msg.sender === "me" ? "flex-end" : "flex-start",
                                                        marginTop: "3px"
                                                    }}
                                                >
                                                    {msg.timestamp}
                                                </Typography>
                                            </>
                                        ))}
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
                            ) : (
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flexGrow: 1 }}>
                                    <Typography variant="h6" color="textSecondary">Select a chat to start messaging</Typography>
                                </Box>
                            )}
                        </Box></>) : (<>
                            {!selectedUser ? (<Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minWidth: "100%", padding: "10px", height: "100vh" }}>
                                <Box sx={{marginRight:"auto",width:"100%"}}>
                                    <Paper
                                        component="form"
                                        sx={{ display: 'flex', alignItems: 'center', width: '100%', borderRadius: '20px', padding: "5px", width:"100%", marginBottom: "10px",marginRight:"auto", boxShadow: "none", border: "1px solid #e0e0e0" }}
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
                                        .filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                        .map(user => (
                                            <Box
                                                key={user.id}
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    padding: "10px",
                                                    borderRadius: "10px",
                                                    width: "100%",
                                                    cursor: "pointer",
                                                    backgroundColor: selectedUser?.id === user.id ? "#e0e0e0" : "transparent",
                                                    "&:hover": { backgroundColor: "#e0e0e0" }
                                                }}
                                                onClick={() => handleUserClick(user)}
                                            >
                                                <Avatar src={user.avatar} sx={{ width: 40, height: 40, marginRight: "10px" }} />
                                                <Box>
                                                    <Typography variant="body1" fontWeight="bold">{user.name}</Typography>
                                                    <Typography variant="body2" color="textSecondary">{user.lastMessage}</Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                </Box>
                            </Box>) : (<Box sx={{ width: "100%", height: "92vh", display: "flex", flexDirection: "column", marginBottom: "auto" }}>

                                <>
                                    {/* Chat Header */}
                                    <Box sx={{ padding: "10px", borderBottom: "1px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        {/* User Info */}
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <ArrowBackIosNewIcon fontSize="small" sx={{ margin: "10px" }} onClick={() => setSelectedUser(null)} ></ArrowBackIosNewIcon>
                                            <Avatar src={selectedUser.avatar} sx={{ width: 40, height: 40, marginRight: "10px" }} />
                                            <Box>
                                                <Typography variant="h6">{selectedUser.name}</Typography>
                                                <Typography variant="body2" color="textSecondary">{selectedUser.lastSeen}</Typography>
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
                                    <Box sx={{
                                        flexGrow: 1,
                                        overflowY: "auto",
                                        padding: "10px",
                                        display: "flex",
                                        flexDirection: "column",
                                        scrollbarWidth: "thin",
                                        scrollbarColor: "#888 transparent",
                                        "&::-webkit-scrollbar": { width: "8px" },
                                        "&::-webkit-scrollbar-track": { background: "transparent" },
                                        "&::-webkit-scrollbar-thumb": { backgroundColor: "#888", borderRadius: "10px" },
                                        "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "#555" }
                                    }}>
                                        {messages[selectedUser.id]?.map((msg, index) => (
                                            <>
                                                <Box key={index} sx={{
                                                    maxWidth: "80%", // Limits message width for better readability
                                                    wordBreak: "break-word", // Ensures long words wrap instead of overflowing
                                                    whiteSpace: "pre-wrap",
                                                    padding: "8px 12px",
                                                    display: "flex",
                                                    flexDirection: "row",
                                                    borderRadius: "12px",
                                                    marginBottom: "8px",
                                                    alignSelf: msg.sender === "me" ? "flex-end" : "flex-start",
                                                    backgroundColor: msg.sender === "me" ? "#7b6cc2" : "#e0e0e0",
                                                    color: msg.sender === "me" ? "#fff" : "#000",
                                                    position: "relative"
                                                }}>
                                                    {msg.text}
                                                    {msg.sender === "me" && (
                                                        <Box sx={{ marginLeft: "5px", display: "flex", alignItems: "flex-end" }}>
                                                            {msg.status === "sent" && <DoneIcon fontSize="small" />}
                                                            {msg.status === "delivered" && <DoneAllIcon fontSize="small" />}
                                                            {msg.status === "read" && <DoneAllIcon fontSize="small" sx={{ color: "blue" }} />}
                                                        </Box>
                                                    )}

                                                </Box>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        display: "block",
                                                        fontSize: "0.7rem",
                                                        textAlign: "right",
                                                        alignSelf: msg.sender === "me" ? "flex-end" : "flex-start",
                                                        marginTop: "3px"
                                                    }}
                                                >
                                                    {msg.timestamp}
                                                </Typography>
                                            </>
                                        ))}
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
            </Box>
        </>
    )
}
