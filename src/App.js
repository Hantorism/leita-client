import React from "react";
import { Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Header from "./components/common/Header";
import Home from "./components/pages/Home";
// import Login from "./components/common/Login";
import "./App.css"
import Problems from "./components/pages/Problems";
import Study from "./components/pages/Study";
import ProblemDetail from "./components/pages/ProblemDetail";
import StudyDetail from "./components/pages/StudyDetail.tsx";


const clientId = process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID;

const App = () => {
    return (
        <GoogleOAuthProvider clientId={clientId}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/problems" element={<Problems />} />
                <Route path="/study" element={<Study />} />
                <Route path="/problems/:id" element={<ProblemDetail />} />
                <Route path="/study/:id" element={<StudyDetail />} />




                {/*<Route path="/login" element={<Login />} />*/}
            </Routes>
        </GoogleOAuthProvider>
    );
};

export default App;
