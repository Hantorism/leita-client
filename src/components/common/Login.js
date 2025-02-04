import React from "react";
import { useAuth } from "../../context/AuthContext";
import "./Header/Header.css"

const LoginButton = () => {
    const { user, signInWithGoogle, logout } = useAuth();

    return (
        <div>
            {user ? (
                <div>
                    <p>Hello, {user.displayName}!</p>
                    <button className={"sign-in-btn"} onClick={logout}>Logout</button>
                </div>
            ) : (
                <button className={"sign-in-btn"} onClick={signInWithGoogle}>Sign in with Google</button>
            )}
        </div>
    );
};

export default LoginButton;
