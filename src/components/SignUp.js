import React, { useState, useEffect } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { Container, Box, Typography, TextField, Button, Link, Snackbar, Alert } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // For navigation
import { LOCAL_HOST } from "./variable";

function SignUp({ info }) {
    const { theme, prefersDarkMode } = info;
    const navigate = useNavigate(); // For navigation

    // State for form inputs
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOTP] = useState("");
    const [userId, setUserId] = useState("");

    // State for OTP functionality
    const [timer, setTimer] = useState(30); // Timer for resend OTP countdown
    const [isOTPSent, setIsOTPSent] = useState(false);
    const [isResendEnabled, setIsResendEnabled] = useState(false);

    // State for Snackbar
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    // Simulate OTP sending
    const sendOTP = () => {
        axios.post(`https://gramsnap-backend-bj65.onrender.com/sendOTP`, { email }).then(response => {
            if (response.status === 200) {
                setIsResendEnabled(false);
                setSnackbarMessage("OTP sent to your email " + email);
                setSnackbarSeverity("success");
                setOpenSnackbar(true);
                setIsOTPSent(true);
                setTimer(122);
            }
        }).catch(err => {
            setSnackbarMessage(err);
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
        })
    };

    // Handle OTP resend
    const handleResendOTP = () => {
        if (isResendEnabled) {
            sendOTP();
        }
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!isOTPSent) {
            // Validate form inputs
            const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

            if (!passwordPattern.test(password)) {
                setSnackbarMessage("Password must be at least 8 characters long, include uppercase, lowercase, a number, and a special character.");
                setSnackbarSeverity("error");
                setOpenSnackbar(true);
                return;
            }

            if (password !== confirmPassword) {
                setSnackbarMessage("Passwords do not match!");
                setSnackbarSeverity("error");
                setOpenSnackbar(true);
                return;
            }
            const emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*\.\w{2,3}$/;

            if (!emailPattern.test(email)) {
                setSnackbarMessage("Enter Correct Email!");
                setSnackbarSeverity("error");
                setOpenSnackbar(true);
                return;
            }

            sendOTP();
        } else {
            axios.post(`https://gramsnap-backend-bj65.onrender.com/signup`, { name, email, password, otp, userId })
                .then(response => {
                    if (response.status === 201) {  // ✅ 201 means "Created"
                        setSnackbarMessage("Account created successfully!");
                        setSnackbarSeverity("success");
                        setOpenSnackbar(true);

                        setTimeout(() => navigate("/signin"), 2000); // Redirect after success
                    }
                })
                .catch(error => {
                    if (error.response) {
                        if (error.response.status === 400) {
                            // Display the message from error.response.data (or another specific property)
                            setSnackbarMessage(error.response.data.message || "User already exists.");
                        } else {
                            setSnackbarMessage("Something went wrong. Please try again.");
                        }
                        setSnackbarSeverity("error");
                        setOpenSnackbar(true);
                    } else {
                        console.error("Network Error:", error);
                        setSnackbarMessage("Network error. Please check your connection.");
                        setSnackbarSeverity("error");
                        setOpenSnackbar(true);
                    }
                });


            // setTimeout(() => navigate("/signin"), 2000); 
        }
    };

    useEffect(() => {
        let interval;
        if (timer > 0 && !isResendEnabled) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else if (timer === 0) {
            setIsResendEnabled(true);
        }

        return () => clearInterval(interval);
    }, [timer, isResendEnabled]);

    // Close Snackbar
    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container
                maxWidth="md"
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    p: 2,
                }}
            >
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 2,
                        boxShadow: 3,
                        height: "90%",
                        overflow: "hidden",
                        bgcolor: theme.palette.background.paper,
                    }}
                >
                    {/* Left Side - Full Orange Background */}
                    <Box
                        sx={{
                            background: "linear-gradient(135deg, #7b6cc2, #9c84e0, #5a4ea1)",
                            color: "white",
                            width: { xs: "100%", sm: "50%" },
                            display: { xs: "none", sm: "flex" },
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                            p: 4,
                            height: "100%",
                        }}
                    >
                        <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
                            Welcome to GramSnap!
                        </Typography>
                        <Typography sx={{ maxWidth: "80%", mb: 3 }}>
                            Connect, share, and explore moments with friends and the world. Sign up now to start your journey!
                        </Typography>

                        <Typography variant="h6" sx={{ mt: 3, fontWeight: "bold" }}>
                            Already part of GramSnap?
                        </Typography>
                        <Typography sx={{ maxWidth: "80%", mb: 3 }}>
                            Jump back in! Click the button below to log in and continue sharing your story.
                        </Typography>


                        <Button
                            variant="contained"
                            sx={{
                                backgroundColor: "white",
                                color: "#7b6cc2",
                                "&:hover": { backgroundColor: "#7b6cc2", color: "white" },
                                py: 1.5,
                                px: 4,
                            }}
                            onClick={() => navigate("/signin")} // Navigate to sign-in page
                        >
                            Sign In
                        </Button>
                    </Box>

                    {/* Create Account Section */}
                    <Box
                        sx={{
                            width: { xs: "100%", sm: "50%" },
                            textAlign: "center",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            p: { xs: 3, sm: 4 },
                        }}
                        component="form"
                        onSubmit={handleSubmit}
                    >
                        <img
                            src={`${process.env.PUBLIC_URL}/assets/Images/Logo.png`}
                            alt="Logo"
                            style={{ width: "160px", marginBottom: "10px" }}
                        />

                        <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                            Create Account
                        </Typography>

                        {isOTPSent ? (
                            <>
                                <TextField
                                    id="otp"
                                    label="OTP"
                                    placeholder="Enter Sent OTP"
                                    variant="outlined"
                                    fullWidth
                                    sx={{ mb: 2 }}
                                    value={otp}
                                    onChange={(e) => setOTP(e.target.value)}
                                    required
                                />
                                <Link
                                    href="#"
                                    sx={{ fontWeight: "bold", color: "blue", mr: 'auto', ml: 0, pb: 2 }}
                                    disabled={!isResendEnabled}
                                    onClick={handleResendOTP}
                                >
                                    {isResendEnabled ? "Resend OTP" : `Resend OTP in ${timer}s`}
                                </Link>
                                <TextField
                                    id="userid"
                                    label="User Id"
                                    placeholder="Enter User ID"
                                    variant="outlined"
                                    fullWidth
                                    sx={{ mb: 2 }}
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    required
                                />
                            </>
                        ) : (
                            <>
                                <TextField
                                    id="name"
                                    label="Name"
                                    placeholder="Enter Your Name"
                                    variant="outlined"
                                    fullWidth
                                    sx={{ mb: 2 }}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                                <TextField
                                    id="email"
                                    label="Email"
                                    placeholder="Enter Your Email"
                                    variant="outlined"
                                    fullWidth
                                    sx={{ mb: 2 }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <TextField
                                    id="password"
                                    label="Password"
                                    type="password"
                                    placeholder="Enter Password"
                                    variant="outlined"
                                    fullWidth
                                    sx={{ mb: 2 }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <TextField
                                    id="cpassword"
                                    label="Confirm Password"
                                    type="password"
                                    placeholder="Enter Confirm Password"
                                    variant="outlined"
                                    fullWidth
                                    sx={{ mb: 2 }}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </>
                        )}

                        <Button
                            type="submit"
                            variant="contained"
                            color="secondary"
                            fullWidth
                            sx={{ mb: 2, py: 1.5 }}
                        >
                            {!isOTPSent ? 'Create Account' : 'Verify OTP'}
                        </Button>
                    </Box>
                </Box>
            </Container>

            {/* Snackbar for Feedback */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </ThemeProvider>
    );
}

export default SignUp;
