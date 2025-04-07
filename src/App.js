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
import TermsPrivacyPage from "./components/pages/term";
import TermsOfService from "./components/pages/term";
import PrivacyPolicy from "./components/pages/Privacy";
import JudgePage from "./components/common/Judge.tsx";
import PrivateRoute from "./components/common/PrivateRoute.tsx";



const clientId = process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID;



const App = () => {
    return (
        <GoogleOAuthProvider clientId={clientId}>
            <Routes>
                {/* 공개 라우트 */}
                <Route path="/" element={<Home />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/problems" element={<Problems />} />
                <Route path="/study" element={<Study />} /> />

                {/* 보호된 라우트 */}
                <Route path="/problems/:id" element={<PrivateRoute element={<ProblemDetail />} />} />
                <Route path="/study/:id" element={<PrivateRoute element={<StudyDetail />} />} />
                <Route path="/judge" element={<PrivateRoute element={<JudgePage />} />} />
            </Routes>
        </GoogleOAuthProvider>
    );
};

export default App;
