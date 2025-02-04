import React from "react";
import "./App.css"
import { Route, Routes } from "react-router-dom"; // BrowserRouter는 여기서 필요 없음
import Home from "./components/Home/Home";
import Login from "./components/common/Login";


const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
        </Routes>
    );
};

export default App;
