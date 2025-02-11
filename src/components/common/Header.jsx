import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import Login from "./login";

const Header = () => {
    const [user, setUser] = useState(null);

    return (
        <nav className="bg-white bg-opacity-30 p-3 md:p-4 rounded-full flex justify-between items-center mx-4 my-5 font-lexend">
            <div className="text-white text-xl font-sans pl-8 font-extrabold">
                <Link to="/">LEITA</Link>
            </div>

            <ul className="flex flex-wrap items-stretch  list-none p-0 m-0 font-light">
                <li>
                    <NavLink to="/" className={({ isActive }) => isActive ? "nav-link bg-black bg-opacity-50 text-[#CAFF33] px-6 py-2 rounded-full" : "nav-link text-white px-6 py-3"}>
                        Home
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/problems" className={({ isActive }) => isActive ? "nav-link bg-black bg-opacity-50 text-[#CAFF33] px-6 py-2 rounded-full" : "nav-link text-white px-6 py-3"}>
                        Problems
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/about" className={({ isActive }) => isActive ? "nav-link bg-black bg-opacity-50 text-[#CAFF33] px-6 py-2 rounded-full" : "nav-link text-white px-6 py-3"}>
                        About
                    </NavLink>
                </li>
            </ul>

            <Login user={user} setUser={setUser} />
        </nav>
    );
};

export default Header;
