import React, { useEffect, useState } from "react";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import "./button.css";
import axiosInstance from "./axiosInstance";

const API_BASE_URL = process.env.REACT_APP_API_URL; // API 주소 설정

const Login = ({ user, setUser }) => {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [logoutTimer, setLogoutTimer] = useState(null);



    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        if (localStorage.getItem("token")) {
            startLogoutTimer();
        }
    }, []);

    const startLogoutTimer = () => {
        // 15시간(54000초) 후 로그아웃
        const timer = setTimeout(() => {
            logout();
        }, 54000 * 1000);
        setLogoutTimer(timer);
    };


    const signInWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                // console.log(" Google OAuth Token:", tokenResponse.access_token);


                const res = await axiosInstance.post(`${API_BASE_URL}/auth/oauth`, {
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


                localStorage.setItem("token", accessToken);
                Cookies.set("accessToken", accessToken, { expires: 1 });




                const userRes = await axiosInstance.get(`${API_BASE_URL}/auth/info`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                console.log(" User Info Response:", userRes.data);

                setUser(userRes.data);
                localStorage.setItem("user", JSON.stringify(userRes.data));
                navigate("/");
            } catch (error) {
                console.error(" Google login failed:", error);
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    alert("🚨 @ajou.ac.kr의 아주대 계정으로 로그인 가능합니다!");
                } else {
                    alert("🚨 로그인 중 문제가 발생했습니다. 다시 시도해주세요.");
                }
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
                    <span className="text-white text-sm">Hello, {user.data.name} 👋</span>
                    <button
                        className="relative bg-[#303030] text-[#ededed] font-light px-5 py-1 rounded-full border-none outline-none no-underline font-lexend hover:bg-[#ededed] hover:text-[#303030]"
                        onClick={logout}
                    >
                        Logout

                    </button>
                </div>
            ) : (
                <div className="login-form">
                    <button
                        className="relative bg-[#303030] text-[#ededed] font-light px-5 py-1 rounded-full border-none outline-none no-underline font-lexend hover:bg-[#ededed] hover:text-[#303030]"
                        onClick={signInWithGoogle}
                    >
                        Sign in with Google
                        {/*/!* Tooltip *!/*/}
                        {/*<div className="absolute left-1/2 -translate-x-1/2 top-[-40px] w-max px-3 py-2 text-xs text-white bg-gray-800 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">*/}
                        {/*    @ajou.ac.kr의 아주대 계정으로 로그인 가능합니다!*/}
                        {/*</div>*/}
                    </button>
                </div>
            )}
        </div>

    );
};

export default Login;
