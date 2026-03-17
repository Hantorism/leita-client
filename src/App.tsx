import React from 'react';
import { Home, Problems, Study, ProblemDetail, StudyDetail, Term as TermsOfService, Privacy as PrivacyPolicy, CreateProblem } from '@pages';
import { Judge as JudgePage, PrivateRoute } from '@components';
import { Environment } from '@utils';
import { Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId = Environment.GOOGLE_AUTH_CLIENT_ID;

const App: React.FC = () => {
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
