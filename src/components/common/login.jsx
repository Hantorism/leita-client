import React, { useEffect, useState } from "react";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import "./button.css";

const API_BASE_URL = "https://dev-server.leita.dev/auth";

const Login = ({ user, setUser }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_BASE_URL}/login`, {
                email,
                password,
            });
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
            console.error("Login failed:", error);
        }
    };


    const signInWithGoogle = async (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            setUser(decoded);
            localStorage.setItem("user", JSON.stringify(decoded));
            navigate("/");
        } catch (error) {
            console.error("Google login failed:", error);
        }
    };


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

                    {/*<form onSubmit={handleEmailLogin}>*/}
                    {/*    <input*/}
                    {/*        type="email"*/}
                    {/*        placeholder="Email"*/}
                    {/*        value={email}*/}
                    {/*        onChange={(e) => setEmail(e.target.value)}*/}
                    {/*        required*/}
                    {/*    />*/}
                    {/*    <input*/}
                    {/*        type="password"*/}
                    {/*        placeholder="Password"*/}
                    {/*        value={password}*/}
                    {/*        onChange={(e) => setPassword(e.target.value)}*/}
                    {/*        required*/}
                    {/*    />*/}
                    {/*    <button type="submit">Login</button>*/}
                    {/*</form>*/}


                    <GoogleLogin
                        onSuccess={signInWithGoogle}
                        onError={(error) => console.log("Login Failed:", error)}
                    />
                </div>
            )}
        </div>
    );
};

export default Login;
