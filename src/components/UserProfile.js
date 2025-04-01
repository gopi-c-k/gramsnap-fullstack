import React, { useState, useEffect } from "react";
import { Box, Typography, Avatar, Button, CircularProgress, Backdrop, Snackbar, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FollowMenu from "./FollowMenu";
import ChatIcon from "@mui/icons-material/Chat";
import LockIcon from "@mui/icons-material/Lock";
import { LOCAL_HOST } from "./variable";
import { useMediaQuery, useTheme } from "@mui/material";

const UserProfile = ({ userId }) => {
    const [menuOpen, setMenuOpen] = useState({});
    const [anchorEl, setAnchorEl] = useState({});

    const handleClick = (event, check) => {
        setAnchorEl((prev) => ({ ...prev, [check]: event.currentTarget }));
        setMenuOpen((prev) => ({ ...prev, [check]: !prev[check] })); // Fix the state toggle logic
    };

    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [following, setFollowing] = useState(false);
    const muiTheme = useTheme();
    const isDesktop = useMediaQuery(muiTheme.breakpoints.up('lg'));

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    // For Snackbars
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const fetchUserProfile = async () => {
        try {
            const response = await axios.get(`https://gramsnap-backend.onrender.com/profile/${userId}`, { withCredentials: true });
            if (response.status === 200) {
                console.log(response.data);
                setUserProfile(response.data);
                setLoading(false);
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            setLoading(false);
        }
    };
    useEffect(() => {
        if (userId) fetchUserProfile();
    }, [userId]);

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    const handleFollow = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`https://gramsnap-backend.onrender.com/followRequest`, { followRequestUserId: userId }, { withCredentials: true });
            if (res.status === 200) {
                setLoading(false);
                setSnackbarMessage(res.data.message);
                setSnackbarSeverity("success");
                setOpenSnackbar(true);
                await fetchUserProfile();
            }
        } catch (error) {
            console.error("Error following user:", error);

            // Extract meaningful error message
            const errorMessage = error.response?.data?.message || error.message || "Something went wrong";

            setSnackbarMessage(errorMessage);  // Set a string instead of an object
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
            setLoading(false);
        }
    };
    const sendMessageHi = async () => {
        console.log("Function called");
        try {
            const res = await axios.post('https://gramsnap-backend.onrender.com/chat/send', { senderId: userInfo.userId, receiverId: userId, message: "Hi" }, { withCredentials: true })
            if (res.status === 201) {
                navigate('/message');
            } else {
                setSnackbarMessage("Unable to send message");
                setSnackbarSeverity("error");
                setOpenSnackbar(true);
            }
        } catch (error) {
            console.error("Error occured: ", error);
            setSnackbarMessage(error);  // Set a string instead of an object
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
        }
    }


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
        userProfile && (
            <Box
                sx={{
                    // flexGrow: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    padding: 4,
                    height: "100vh",
                    overflow: "hidden"
                }}
            >
                {/* Profile Picture */}
                <Avatar
                    alt="User Profile"
                    src={userProfile.profilePicture}
                    sx={{
                        width: 150,
                        height: 150,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "3px solid white",
                        marginBottom: 2,
                    }}
                />

                {/* User ID and Name */}
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                    {userProfile.name}
                </Typography>
                <Typography variant="body1" sx={{ color: "text.secondary" }}>
                    @{userProfile.userId}
                </Typography>

                {/* Bio */}
                <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", marginBottom: 4 }}>
                    {userProfile.bio}
                </Typography>

                {/* Followers, Following, Posts */}
                <Box sx={{ display: "flex", gap: 4, marginBottom: 4 }}>
                    <Box sx={{ textAlign: "center" }}>
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>{userProfile.postSize}</Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>Posts</Typography>
                    </Box>
                    <Box sx={{ textAlign: "center", cursor: "pointer" }} onClick={(event) => handleClick(event, "followers")}>
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>{userProfile.followersSize}</Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>Followers</Typography>
                        <FollowMenu
                            userId={userProfile.userId}
                            open={menuOpen["followers"]}
                            onClose={() => setMenuOpen((prev) => ({ ...prev, followers: false }))}
                            anchorEl={anchorEl["followers"]}
                            follower={true}
                        />
                    </Box>
                    <Box sx={{ textAlign: "center", cursor: "pointer" }} onClick={(event) => handleClick(event, "following")}>
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>{userProfile.followingSize}</Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>Following</Typography>
                        <FollowMenu
                            userId={userProfile.userId}
                            open={menuOpen["following"]}
                            onClose={() => setMenuOpen((prev) => ({ ...prev, following: false }))}
                            anchorEl={anchorEl["following"]}
                            follower={true}
                        />
                    </Box>
                </Box>

                {/* Follow & Message Buttons */}
                {!userProfile.isSame && (
                    <Box sx={{ display: "flex", gap: 2, marginBottom: 4 }}>
                        <Button
                            variant={following ? "contained" : "outlined"}
                            color="primary"
                            disabled={userProfile?.isRequestSent}
                            onClick={!userProfile?.isRequestSent && handleFollow}
                            sx={{ width: 130 }}
                            startIcon={following ? <CheckCircleIcon /> : <PersonAddIcon />}
                        >
                            {userProfile.isFollow ? "Unfollow" : userProfile?.isRequestSent ? "Request Sent" : "Follow"}
                        </Button>
                        {userProfile.isFollow && (
                            <Button variant="contained" sx={{ width: 130, backgroundColor: "#7b6cc2" }} startIcon={<ChatIcon />} onClick={() => { sendMessageHi() }}>
                                Message
                            </Button>
                        )}
                    </Box>
                )}

                {/* Posts or Private Account Message */}
                {userProfile.isPrivate ? (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "8px" }}>
                        <LockIcon color="action" />
                        <Typography variant="body1" color="gray">
                            This account is private.
                        </Typography>
                    </Box>
                ) : (
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", // Responsive columns
                            gap: 2,
                            width: "100%",
                            maxWidth: "100%", // Ensures it fits within the screen
                            overflowY: "auto",
                            scrollbarWidth: "none",
                            "&::-webkit-scrollbar": { display: "none" },
                            marginBottom: 4,
                        }}
                    >
                        {userProfile.posts?.map((post) => (
                            <Box
                                key={post.postId}
                                sx={{
                                    position: "relative",
                                    width: "100%",
                                    paddingTop: "100%",
                                    backgroundColor: "grey.300",
                                    borderRadius: 2,
                                    overflow: "hidden",
                                    cursor: "pointer",
                                }}
                                onClick={() => window.open(`https://gram-snap.vercel.app/post/${post.postId}`, "_blank")}
                            >
                                <img
                                    src={post.image}
                                    alt="User Post"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                    }}
                                />
                            </Box>
                        ))}


                    </Box>

                )}
                {/* Snackbar for Notifications */}
                <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleCloseSnackbar}>
                    <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Box>
        )
    );
};

export default UserProfile;
