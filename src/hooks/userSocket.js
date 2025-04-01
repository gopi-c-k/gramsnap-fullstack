import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthHandler = ({ socket }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    const checkAuthAndEmit = async () => {
      try {
        const response = await axios.get("https://gramsnap-backend-bj65.onrender.com/protected", {
          withCredentials: true,
        });

        if (response.status === 200) {
          const { userId } = response.data.user;
          console.log("✅ User authenticated. Emitting userConnected...");
          socket.emit("userConnected", userId);
        }
      } catch (error) {
        console.log("❌ User not authenticated. Redirecting to SignIn...");
        navigate("/signin");  // Now useNavigate() works!
      }
    };

    if (socket.connected) {
      checkAuthAndEmit();
    } else {
      socket.on("connect", checkAuthAndEmit);
    }

    return () => {
      socket.off("connect", checkAuthAndEmit);
    };
  }, [socket, navigate]);

  return null; // This component does not render anything
};

export default AuthHandler;
