import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const useAuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.post(
          "https://gramsnap-backend-bj65.onrender.com/login-refresh",
          {},
          { withCredentials: true }
        );

        if (response.status === 200) {
          console.log("User authenticated, redirecting to /home...");
          localStorage.setItem("userInfo", JSON.stringify(response.data));
          navigate("/home");
        }
      } catch (error) {
        console.log("No valid session, redirecting to /signin...");
        navigate("/signin");
      }
    };

    checkAuth();
  }, [navigate]);
};

export default useAuthRedirect;
