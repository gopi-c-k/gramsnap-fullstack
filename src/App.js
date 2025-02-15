import React from "react";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Home from "./components/Home";
import Notifications from "./components/Notification";
import { useMediaQuery } from "@mui/material";

function App() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Pass both theme and prefersDarkMode as properties of an object */}
          <Route path="/signin" element={<SignIn info={{ theme, prefersDarkMode }} />} />
          <Route path="/signup" element={<SignUp info={{ theme, prefersDarkMode }}/>} />
          <Route path="/notifications" element={<Notifications info={{ theme, prefersDarkMode }}/>}/>
          <Route path="/home" element={<Home info={{ theme, prefersDarkMode }}/>} />
          {/*<Route path="/post" element={<Post info={{ theme, prefersDarkMode }}/>} /> */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
