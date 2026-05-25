import { ErrorBoundary, Loader, PrivateRoute } from '@components';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Environment } from '@utils';
import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

// 정적 임포트를 동적 임포트(React.lazy)로 변환 (Code Splitting)
const HomePage = React.lazy(() => import('@pages/Home'));
const TermPage = React.lazy(() => import('@pages/Term'));
const PrivacyPage = React.lazy(() => import('@pages/Privacy'));
const ProblemsPage = React.lazy(() => import('@pages/Problems'));
const ProblemDetailPage = React.lazy(() => import('@pages/ProblemDetail'));
const JudgePage = React.lazy(() => import('@pages/Judge'));
const JudgeDetailPage = React.lazy(() => import('@pages/JudgeDetail'));
const SourcePage = React.lazy(() => import('@pages/Source'));
const CreateProblemPage = React.lazy(() => import('@pages/CreateProblem'));
const EditProblemPage = React.lazy(() => import('@pages/EditProblem'));
const StudyPage = React.lazy(() => import('@pages/Study'));
const StudyDetailPage = React.lazy(() => import('@pages/StudyDetail'));
const StudySessionDetailPage = React.lazy(() => import('./pages/StudySessionDetail'));
const MyPage = React.lazy(() => import('./pages/MyPage'));
const NoticeList = React.lazy(() => import('./pages/NoticeList'));
const NoticeDetail = React.lazy(() => import('./pages/NoticeDetail'));
const QnaList = React.lazy(() => import('./pages/QnaList'));
const QnaDetail = React.lazy(() => import('./pages/QnaDetail'));
const QnaWrite = React.lazy(() => import('./pages/QnaWrite'));

const clientId = Environment.GOOGLE_AUTH_CLIENT_ID;

const App = () => {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <ErrorBoundary>
        <Suspense fallback={<Loader />}>
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
              path="/judge/:judgeId"
              element={<PrivateRoute element={<JudgeDetailPage />} />}
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
              path="/edit-problem/:id"
              element={<PrivateRoute element={<EditProblemPage />} />}
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
            <Route
              path="/mypage"
              element={<PrivateRoute element={<MyPage />} />}
            />
            <Route
              path="/notices"
              element={<NoticeList />}
            />
            <Route
              path="/notices/:id"
              element={<NoticeDetail />}
            />
            <Route
              path="/qna"
              element={<QnaList />}
            />
            <Route
              path="/qna/:id"
              element={<QnaDetail />}
            />
            <Route
              path="/qna/write"
              element={<PrivateRoute element={<QnaWrite />} />}
            />
            <Route
              path="/qna/edit/:id"
              element={<PrivateRoute element={<QnaWrite />} />}
            />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </GoogleOAuthProvider>
  );
};

export default App;
