import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useGoogleLogin} from "@react-oauth/google";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import "./button.css";

const Header = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            const decodedToken = jwtDecode(tokenResponse.credential);
            setUser({ displayName: decodedToken.name, email: decodedToken.email });
            localStorage.setItem("user", JSON.stringify({ displayName: decodedToken.name, email: decodedToken.email }));
        },
        onError: (error) => {
            console.error("Login failed: ", error);
        },
    });

    const signInWithGoogle = (credentialResponse) => {
        const decoded = jwtDecode(credentialResponse.credential);
        setUser(decoded);
        localStorage.setItem("user", JSON.stringify(decoded));
    };

    const logout = () => {
        googleLogout();
        setUser(null);
        localStorage.removeItem("user");
    };



    return (
        <nav className="bg-white bg-opacity-30 p-3 md:p-4 rounded-full flex justify-between items-center mx-4 my-5 font-lexend">
            {/* 로고 */}
            <div className="text-white text-xl  font-sans font-extrabold">
                <Link to="/">LEITA</Link>
            </div>

            {/* 네비게이션 메뉴 */}
            <ul className="flex gap-6 list-none p-0 m-0 font-light">
                <li>
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            isActive
                                ? "nav-link bg-black bg-opacity-50 text-[#CAFF33] px-6 py-2 rounded-full"
                                : "nav-link text-white px-6 py-3"
                        }
                    >
                        Home
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/problems"
                        className={({ isActive }) =>
                            isActive
                                ? "nav-link bg-black bg-opacity-50 text-[#CAFF33] px-6 py-2 rounded-full"
                                : "nav-link text-white px-6 py-3"
                        }
                    >
                        Problems
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/about"
                        className={({ isActive }) =>
                            isActive
                                ? "nav-link bg-black bg-opacity-50 text-[#CAFF33] px-6 py-2 rounded-full"
                                : "nav-link text-white px-6 py-3"
                        }
                    >
                        About
                    </NavLink>
                </li>
            </ul>

            {/* 로그인 상태에 따라 버튼 변경 */}
            <div className="flex items-center gap-4">
                {user ? (
                    <div className="flex items-center gap-3">
                        <span className="text-white text-sm">Hello, {user.name} 👋</span>
                        <button
                            className="sign-in-btn sign-out-btn"
                            onClick={logout}
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    // <GoogleLogin
                    //     onSuccess={signInWithGoogle}
                    //     onError={(error) => console.log("Login Failed:", error)}
                    //     useOneTap
                    // />

                    <GoogleLogin
                        onSuccess={signInWithGoogle}
                        onError={(error) => console.log("Login Failed:", error)}
                        useOneTap
                        style={{
                            backgroundColor: "#ededed",
                            color: "#303030",
                            padding: "12px 25px",
                            borderRadius: "80px",
                            border: "none",
                            outline: "none",
                            fontFamily: "'Lexend', sans-serif",
                        }}
                    />
                )}
            </div>
        </nav>
    );
};

export default Header;
