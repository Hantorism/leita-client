import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Home from './pages/Home';
import Problems from './pages/Problems';
import Study from './pages/Study';
import ProblemDetail from './pages/ProblemDetail';
import StudyDetail from './pages/StudyDetail';
import TermsOfService from './pages/Term';
import PrivacyPolicy from './pages/Privacy';
import JudgePage from './components/Judge';
import PrivateRoute from './components/PrivateRoute';
import CreateProblem from './pages/CreateProblem';

const clientId = process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID;

const App: React.FC = () => {
  if (!clientId) {
    return <div>Google Client ID is not configured.</div>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Routes>
        {/* 공개 라우트 */}
        <Route path="/" element={<Home/>}/>
        <Route path="/terms" element={<TermsOfService/>}/>
        <Route path="/privacy" element={<PrivacyPolicy/>}/>
        <Route path="/problems" element={<Problems/>}/>

        {/* 보호된 라우트 */}
        <Route path="/problems/:id" element={<PrivateRoute element={<ProblemDetail/>}/>}/>
        <Route path="/study/:id" element={<PrivateRoute element={<StudyDetail/>}/>}/>
        <Route path="/judge" element={<PrivateRoute element={<JudgePage/>}/>}/>
        <Route path="/create-problem" element={<CreateProblem/>}/>
        <Route path="/study" element={<PrivateRoute element={<Study/>}/>}/>
      </Routes>
    </GoogleOAuthProvider>
  );
};

export default App;