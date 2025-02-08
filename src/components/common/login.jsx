import React, { useEffect, useState } from "react";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import "./button.css";

const API_BASE_URL = "https://dev-server.leita.dev/api/auth"; // API 주소 설정

const Login = ({ user, setUser }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);


    const signInWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {

                const googleUser = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo`, {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });

                const userEmail = googleUser.data.email;


                const res = await axios.post(`${API_BASE_URL}/login`, {
                    email: userEmail,
                    password: tokenResponse.access_token,
                    // password: tokenResponse.id_token,
                }, {
                    headers: { "Content-Type": "application/json" }
                });

                // 쿠키에 accessToken, refreshToken 저장
                Cookies.set("accessToken", res.data.accessToken, { expires: 1 }); // 1일 유지
                Cookies.set("refreshToken", res.data.refreshToken, { expires: 7 }); // 7일 유지

                // 사용자 정보 가져오기
                const userRes = await axios.get(`${API_BASE_URL}/info`, {
                    headers: { Authorization: `Bearer ${res.data.accessToken}` },
                });

                setUser(userRes.data);
                localStorage.setItem("user", JSON.stringify(userRes.data));
                navigate("/");
            } catch (error) {
                console.error("Google login failed:", error);
            }
        },
        onError: (error) => {
            console.error("Google login error:", error);
        },
    });



    const logout = () => {
        googleLogout();
        setUser(null);
        localStorage.removeItem("user");
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
    };

    return (
        <div className="login-container">
            {user ? (
                <div className="flex items-center gap-3">
                    <span className="text-white text-sm">Hello, {user.username} 👋</span>
                    <button
                        className="bg-[#303030] text-[#ededed] font-light px-5 py-1 rounded-full border-none outline-none no-underline font-lexend hover:bg-[#ededed] hover:text-[#303030]"
                        onClick={logout}
                    >
                        Logout
                    </button>
                </div>
            ) : (
                <div className="login-form">
                    <button  className="bg-[#303030] text-[#ededed] font-light px-5 py-1 rounded-full border-none outline-none no-underline font-lexend hover:bg-[#ededed] hover:text-[#303030]"
                            onClick={() => signInWithGoogle()}>
                        Sign in with Google
                    </button>
                </div>
            )}
        </div>
    );
};

export default Login;
