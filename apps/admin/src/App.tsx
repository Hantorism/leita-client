import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Environment } from '@leita/api';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import NoticeManagement from './pages/NoticeManagement';
import QnaManagement from './pages/QnaManagement';
import AffiliationManagement from './pages/AffiliationManagement';
import UserManagement from './pages/UserManagement';

const clientId = Environment.GOOGLE_AUTH_CLIENT_ID;

function App() {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="affiliations" element={<AffiliationManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="notices" element={<NoticeManagement />} />
            <Route path="qnas" element={<QnaManagement />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
