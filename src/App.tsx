import { PrivateRoute } from '@components';
import {
  CreateProblemPage,
  HomePage,
  JudgePage,
  PrivacyPage,
  ProblemDetailPage,
  ProblemsPage,
  SourcePage,
  StudyDetailPage,
  StudyPage,
  StudySessionDetailPage,
  TermPage,
} from '@pages';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Environment } from '@utils';
import { Route, Routes } from 'react-router-dom';

const clientId = Environment.GOOGLE_AUTH_CLIENT_ID;

const App = () => {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Routes>
        {/* 공개 라우트 */}
        <Route
          path="/"
          element={<HomePage />}
        />
        <Route
          path="/terms"
          element={<TermPage />}
        />
        <Route
          path="/privacy"
          element={<PrivacyPage />}
        />
        <Route
          path="/problems"
          element={<ProblemsPage />}
        />

        {/* 보호된 라우트 */}
        <Route
          path="/problems/:id"
          element={<PrivateRoute element={<ProblemDetailPage />} />}
        />
        <Route
          path="/judge"
          element={<PrivateRoute element={<JudgePage />} />}
        />
        <Route
          path="/source"
          element={<PrivateRoute element={<SourcePage />} />}
        />
        <Route
          path="/create-problem"
          element={<PrivateRoute element={<CreateProblemPage />} />}
        />
        <Route
          path="/study"
          element={<PrivateRoute element={<StudyPage />} />}
        />
        <Route
          path="/study/:id"
          element={<PrivateRoute element={<StudyDetailPage />} />}
        />
        <Route
          path="/study/:id/session/:sessionId"
          element={<PrivateRoute element={<StudySessionDetailPage />} />}
        />
      </Routes>
    </GoogleOAuthProvider>
  );
};

export default App;
