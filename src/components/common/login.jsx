import React, { useEffect, useState } from "react";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import "./button.css";

const API_BASE_URL = "https://dev-server.leita.dev/api"; // API 주소 설정

const Login = ({ user, setUser }) => {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);



    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const signInWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                // console.log(" Google OAuth Token:", tokenResponse.access_token);


                const res = await axios.post(`${API_BASE_URL}/auth/oauth`, {
                    accessToken: tokenResponse.access_token,
                }, {
                    headers: {
                        "Content-Type": "application/json",
                    }
                });

                console.log(" Google Login Response:", res.data);


                const accessToken = res.data.data.accessToken;
                console.log(" Google Login Response Data:", res.data);
                if (!accessToken) {

                    return;
                }


                localStorage.setItem("token", res.data.accessToken);
                Cookies.set("accessToken", accessToken, { expires: 1 });




                const userRes = await axios.get(`${API_BASE_URL}/auth/info`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                console.log(" User Info Response:", userRes.data);

                setUser(userRes.data);
                localStorage.setItem("user", JSON.stringify(userRes.data));
                navigate("/");
            } catch (error) {
                console.error(" Google login failed:", error);
            }
        },
        onError: (error) => {
            console.error(" Google login error:", error);
        },
    });

    const logout = () => {
        googleLogout();
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
    };

    return (
        <div className="login-container">
            {user ? (
                <div className="flex items-center gap-3">
                    <span className="text-white text-sm">Hello, {user.name} 👋</span>
                    <button
                        className="bg-[#303030] text-[#ededed] font-light px-5 py-1 rounded-full border-none outline-none no-underline font-lexend hover:bg-[#ededed] hover:text-[#303030]"
                        onClick={logout}
                    >
                        Logout
                    </button>
                </div>
            ) : (
                <div className="login-form">
                    <button
                        className="bg-[#303030] text-[#ededed] font-light px-5 py-1 rounded-full border-none outline-none no-underline font-lexend hover:bg-[#ededed] hover:text-[#303030]"
                        onClick={signInWithGoogle}
                    >
                        Sign in with Google
                    </button>
                </div>
            )}
        </div>
    );
};

export default Login;
