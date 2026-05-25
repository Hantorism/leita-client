import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import NoticeManagement from './pages/NoticeManagement';
import QnaManagement from './pages/QnaManagement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="notices" element={<NoticeManagement />} />
          <Route path="qnas" element={<QnaManagement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
