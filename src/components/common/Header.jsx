import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import Login from "./login";
import { FiMenu, FiX } from "react-icons/fi";

import logo from "../../assets/Logo.png";

const Header = () => {
    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="font-lexend">

            <nav className="bg-white bg-opacity-30 p-3 md:p-4 rounded-full flex justify-between items-center mx-4 my-5 hidden md:flex">
                <Link to="/">
                    <img src={logo}  alt="LEITA Logo" className="h-8" />
                </Link>

                <ul className="flex flex-wrap items-stretch list-none p-0 m-0 font-light">
                    <li>
                        <NavLink
                            to="/"
                            className={({ isActive }) => isActive
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
                            className={({ isActive }) => isActive
                                ? "nav-link bg-black bg-opacity-50 text-[#CAFF33] px-6 py-2 rounded-full"
                                : "nav-link text-white px-6 py-3"
                            }
                        >
                            Problems
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/study"
                            className={({ isActive }) => isActive
                                ? "nav-link bg-black bg-opacity-50 text-[#CAFF33] px-6 py-2 rounded-full"
                                : "nav-link text-white px-6 py-3"
                            }
                        >
                            Study
                        </NavLink>
                    </li>
                </ul>

                <Login user={user} setUser={setUser} />
            </nav>


            <div className="flex md:hidden justify-between items-center bg-white bg-opacity-30 p-3 rounded-full mx-4 my-5">
                <div className="text-white text-xl font-sans font-extrabold">
                    <Link to="/">
                        <img src={logo}  alt="LEITA Logo" className="h-6" />
                    </Link>
                </div>


                <button
                    className="text-white text-3xl focus:outline-none"
                    onClick={() => setMenuOpen(true)}
                >
                    <FiMenu />
                </button>
            </div>


            {menuOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center space-y-6">
                    {/* 닫기 버튼 */}
                    <button
                        className="absolute top-5 right-5 text-white text-4xl focus:outline-none"
                        onClick={() => setMenuOpen(false)}
                    >
                        <FiX />
                    </button>

                    <ul className="flex flex-col items-center text-white space-y-4 text-2xl">
                        <li>
                            <NavLink to="/" className="block px-6 py-3" onClick={() => setMenuOpen(false)}>Home</NavLink>
                        </li>
                        <li>
                            <NavLink to="/problems" className="block px-6 py-3" onClick={() => setMenuOpen(false)}>Problems</NavLink>
                        </li>
                        <li>
                            <NavLink to="/study" className="block px-6 py-3" onClick={() => setMenuOpen(false)}>Study</NavLink>
                        </li>
                        <li>
                            <Login user={user} setUser={setUser} />
                        </li>
                    </ul>
                </div>
            )}
        </header>
    );
};

export default Header;
