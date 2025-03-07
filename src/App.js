import React, { useEffect, useState } from "react";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import Home from "./components/Home";
import Search from "./components/Search";
import { Message } from "./components/Message";
import AddPost from "./components/AddPost";
import Profile from "./components/Profile";
import Settings from "./components/Settings";
import Notifications from "./components/Notification";
import { useMediaQuery } from "@mui/material";
import { io } from "socket.io-client";
import useAuthRedirect from "./components/hook";

function App() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  //useAuthRedirect();
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
          primary: {
            main: prefersDarkMode ? "#FFFFFF" : "#000000",
          },
          secondary: {
            main: prefersDarkMode ? "#BBBBBB" : "#333333",
          },
          background: {
            default: prefersDarkMode ? "#000000" : "#FFFFFF",
            paper: prefersDarkMode ? "#121212" : "#F5F5F5",
          },
          text: {
            primary: prefersDarkMode ? "#FFFFFF" : "#000000",
            secondary: prefersDarkMode ? "#BBBBBB" : "#333333",
          },
        },
      }),
    [prefersDarkMode]
  );
  // ✅ State to track WebSocket connection
  const [socket, setSocket] = useState(null);
  const [socketLoading, setSocketLoading] = useState(true); // Track when socket is initialized

  useEffect(() => {
    const newSocket = io("https://gramsnap-backend.onrender.com", {
      withCredentials: true,
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("✅ Connected to WebSocket Server:", newSocket.id);
      setSocket(newSocket);
      setSocketLoading(false); // ✅ Mark as ready
    });

    newSocket.on("connect_error", (err) => {
      console.error("❌ WebSocket Connection Error:", err);
      setSocketLoading(false); // Prevent infinite loading
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // ✅ Show a loading screen until socket is ready
  if (socketLoading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px", fontSize: "20px" }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
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
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
