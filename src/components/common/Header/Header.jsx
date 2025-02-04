import React, { useContext } from "react";
import { AuthContext,useAuth } from "../../../context/AuthContext"; // 사용자 인증 정보 가져오기
import { Link } from "react-router-dom";
import "./Header.css";
import { NavLink } from "react-router-dom";
import LoginButton from "../Login";

const Header = () => {
    const { user } = useContext(AuthContext);
    const { logout } = useAuth();

    return (
        <nav className="header">
            {/* 로고 */}
            <div className="logo">
                <Link to="/">LEITA</Link>
            </div>

            {/* 네비게이션 메뉴 */}
            <ul className="nav-links">
                <li>
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            isActive ? "nav-link active-link" : "nav-link"
                        }
                    >
                        Home
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/login"
                        className={({ isActive }) =>
                            isActive ? "nav-link active-link" : "nav-link"
                        }
                    >
                        Problems
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/login"
                        className={({ isActive }) =>
                            isActive ? "nav-link active-link" : "nav-link"
                        }
                    >
                        About
                    </NavLink>
                </li>
            </ul>

            {/* 로그인 상태에 따라 버튼 변경 */}
            <div className="auth">
                {user ? (
                    <div className="user-info">
                        <span className="user-name">Hello, {user.displayName} 👋</span>
                        <button className="sign-out-btn"  onClick={logout}>Logout</button>
                    </div>
                ) : (
                    <LoginButton />
                )}
            </div>
        </nav>
    );
};

export default Header;
