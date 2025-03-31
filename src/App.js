import React, { useEffect, useState } from "react";
import { createTheme, ThemeProvider, CssBaseline, CircularProgress, Button } from "@mui/material";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import Home from "./components/Home";
import Search from "./components/Search";
import { Message } from "./components/Message";
import AddPost from "./components/AddPost";
import PostPage from "./components/PostPage"; 
import Profile from "./components/Profile";
import Settings from "./components/Settings";
import Notifications from "./components/Notification";
import { useMediaQuery } from "@mui/material";
import { io } from "socket.io-client";
import AuthHandler from "./hooks/userSocket";// Import the new component

function App() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
          primary: { main: prefersDarkMode ? "#FFFFFF" : "#000000" },
          secondary: { main: prefersDarkMode ? "#BBBBBB" : "#333333" },
          background: { default: prefersDarkMode ? "#000000" : "#FFFFFF" },
          text: { primary: prefersDarkMode ? "#FFFFFF" : "#000000" },
        },
      }),
    [prefersDarkMode]
  );

  const [socket, setSocket] = useState(null);
  const [socketLoading, setSocketLoading] = useState(true);
  const [socketError, setSocketError] = useState(null);

  // Initialize WebSocket
  const initializeSocket = () => {
    setSocketLoading(true);
    setSocketError(null);

    const newSocket = io("https://gramsnap-backend.onrender.com", {
      withCredentials: true,
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("✅ Connected to WebSocket:", newSocket.id);
      setSocket(newSocket);
      setSocketLoading(false);
    });

    newSocket.on("connect_error", (err) => {
      console.error("❌ WebSocket Connection Error:", err);
      setSocketError("Failed to connect to WebSocket. Please try again later.");
      setSocketLoading(false);
    });

    return () => {
      if (newSocket) {
        newSocket.off("connect");
        newSocket.off("connect_error");
        newSocket.disconnect();
      }
    };
  };

  useEffect(() => {
    initializeSocket();
  }, []);

  // ✅ Show loading screen while socket is connecting
  if (socketLoading) {
    return (
      <div style={styles.container}>
        <img
          src={`${process.env.PUBLIC_URL}/assets/Images/Logo.png`}
          alt="Logo"
          style={styles.logo}
        />
        <CircularProgress style={{ color: "#7b6cc2" }} size={50} />
        <p style={styles.text}>Connecting to server...</p>
      </div>
    );
  }

  // ✅ Show error page if WebSocket connection fails
  if (socketError) {
    return (
      <div style={styles.container}>
        <img
          src={`${process.env.PUBLIC_URL}/assets/Images/Logo.png`}
          alt="Logo"
          style={styles.logo}
        />
        <p style={styles.errorText}>{socketError}</p>
        <Button variant="contained" color="primary" onClick={initializeSocket}>
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          {/* ✅ AuthHandler now runs inside Router */}
          <AuthHandler socket={socket} />

          <Routes>
            <Route path="/signin" element={<SignIn info={{ theme, prefersDarkMode }} socket={socket} />} />
            <Route path="/signup" element={<SignUp info={{ theme, prefersDarkMode }} />} />
            <Route path="/notifications" element={<Notifications info={{ theme, prefersDarkMode }} />} />
            <Route path="/home" element={<Home info={{ theme, prefersDarkMode }} socket={socket} />} />
            <Route path="/search" element={<Search info={{ theme, prefersDarkMode }} />} />
            <Route path="/addpost" element={<AddPost info={{ theme, prefersDarkMode }} />} />
            <Route path="/message" element={<Message info={{ theme, prefersDarkMode }} socket={socket} />} />
            <Route path="/profile" element={<Profile info={{ theme, prefersDarkMode }} />} />
            <Route path="/settings" element={<Settings info={{ theme, prefersDarkMode }} />} />
            <Route path="/post/:postId" element={<PostPage info={{ theme, prefersDarkMode }} />} />
          </Routes>
        </Router>
      </ThemeProvider>
  );
}

export default App;

// ✅ Styles for Loading & Error Page
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    textAlign: "center",
    backgroundColor: "#121212",
    color: "#ffffff",
  },
  logo: {
    width: "150px",
    marginBottom: "20px",
  },
  text: {
    fontSize: "18px",
    marginTop: "10px",
  },
  errorText: {
    fontSize: "18px",
    color: "red",
    marginBottom: "20px",
  },
};
