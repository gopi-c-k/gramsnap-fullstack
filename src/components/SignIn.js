import React, { useState, useEffect } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { Container, Box, Typography, TextField, Button, Link } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 
import { LOCAL_HOST } from "./variable";

function SignIn({ info }) {
  // dotenv.config();
  const { theme, prefersDarkMode } = info
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [user, setUser] = useState(null);
  useEffect(() => {
    const autoLogin = async () => {
      try {
        await axios.post(`https://gramsnap-backend.onrender.com/login-refresh`, {}, { withCredentials: true });
        fetchProtectedData();
      } catch (error) {
        console.log("Not logged in");
      }
    };

    autoLogin();
  }, []);
  
  const fetchProtectedData = async () => {
    try {
      const response = await axios.get(`https://gramsnap-backend.onrender.com/protected`, { withCredentials: true });
      if (response.status === 200) {
        const { userId, name, email, profilePicture } = response.data;
        localStorage.setItem('userInfo', JSON.stringify(response.data));

        navigate("/home");
      }
    } catch (error) {
      console.error("Failed to fetch protected data:", error.response?.data?.message || error.message);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await axios.post('/api/users/logout', {}, { withCredentials: true });
    localStorage.removeItem("user");
    setUser(null);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    const emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*\.\w{2,3}$/;

    // if (!emailPattern.test(email)) {
    //   setErrorMessage("Enter Proper Email");
    //   return;
    // }
    if (email && password) {
      try {
        const response = await axios.post(`https://gramsnap-backend.onrender.com/login`, { email, password }, { withCredentials: true });
        //fetchProtectedData();
        if (response.status === 200) {
          const { userId, name, email, profilePicture } = response.data;
          console.log(response.data)
          navigate("/home");
          localStorage.setItem('userInfo', JSON.stringify(response.data));

        }
      } catch (error) {
        if (error.response) {
          setErrorMessage(error.response.data.message || "Email and Password Mismatch");
        } else {
          setErrorMessage("Network error. Please check your connection.");
        }
      }
    } else {
      setErrorMessage("Enter Email and Password");
      return;
    }
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
            height: '90%',
            overflow: "hidden",
            bgcolor: theme.palette.background.paper,
          }}
        >
          {/* Sign In Section */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              width: { xs: "100%", sm: "50%" },
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              p: { xs: 3, sm: 4 }, // Responsive padding
            }}
          >
            <img
              src={`${process.env.PUBLIC_URL}/assets/Images/Logo.png`}
              alt="Logo"
              style={{ width: "160px", marginBottom: "10px" }}
            />


            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
              Sign In
            </Typography>
            {errorMessage && (
              <Typography color="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Typography>
            )}
            <TextField
              id="email"
              label="Email or UserId"
              placeholder="Enter Your Email or UserId"
              variant="outlined"
              fullWidth
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter Password"
              variant="outlined"
              fullWidth
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                mb: 2,
              }}
            >
              <Box sx={{ display: { xs: "flex", sm: "none" }, ml: 0, mr: "auto" }}>
                <Typography sx={{ mr: 1 }}>Don't have an account?</Typography>
                <Link href="#" sx={{ fontWeight: "bold", color: "blue" }}>
                  Create One
                </Link>
              </Box>
            </Box>

            <Button
              variant="contained"
              color="secondary"
              fullWidth
              type="submit"
              sx={{ mb: 2, py: 1.5 }}
            >
              Sign In
            </Button>
          </Box>

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
              height: '100%'
            }}
          >

            <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
              Welcome Back to GramSnap!
            </Typography>
            <Typography sx={{ maxWidth: "80%", mb: 3 }}>
              Sign in to reconnect, share your moments, and explore trending stories.
            </Typography>

            <Typography variant="h6" sx={{ mt: 3, fontWeight: "bold" }}>
              New to GramSnap?
            </Typography>
            <Typography sx={{ maxWidth: "80%", mb: 3 }}>
              Join us today and start sharing your best moments with the world!
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
              onClick={() => navigate("/signup")}
            >
              Create Account
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}


export default SignIn;