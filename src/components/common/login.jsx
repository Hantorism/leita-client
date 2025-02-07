import React, { useEffect, useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import axios from 'axios';
import "./button.css"

const Login = ({ user, setUser }) => {
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

    // const signIn = useGoogleLogin({
    //     onSuccess: (res) => {
    //         axios.post('http://localhost:3000/auth/login', {
    //             access_token: res.access_token,
    //         })
    //             .then(response => {
    //                 Cookies.set('accessToken', response.data.token);
    //                 console.log(response);
    //             })
    //             .catch(error => {
    //                 console.log(error);
    //             });
    //     },
    //     onError: (error) =>{ console.log(error);}
    // });

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
        <div className="flex items-center gap-4">
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
                <GoogleLogin
                    onSuccess={signInWithGoogle}
                    onError={(error) => console.log("Login Failed:", error)}
                    useOneTap
                    render={(renderProps) => (
                        <button
                            className="googleLoginBox"
                            onClick={renderProps.onClick}
                            disabled={renderProps.disabled}
                        >

                            <span>Log in with Google</span>
                        </button>
                    )}
                />

                // <button onClick={() => login()}>Sign in with Google 🚀</button>
            )}
        </div>
    );
};

export default Login;
