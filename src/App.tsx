import { Home, Problems, Study, ProblemDetail, StudyDetail, Term, Privacy, Judge, CreateProblem } from '@pages';
import { PrivateRoute } from '@components';
import { Environment } from '@utils';
import { Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId = Environment.GOOGLE_AUTH_CLIENT_ID;

const App = () => {
	return (
		<GoogleOAuthProvider clientId={clientId}>
			<Routes>
				{/* 공개 라우트 */}
				<Route path="/" element={<Home/>}/>
				<Route path="/terms" element={<Term/>}/>
				<Route path="/privacy" element={<Privacy/>}/>
				<Route path="/problems" element={<Problems/>}/>

				{/* 보호된 라우트 */}
				<Route path="/problems/:id" element={<PrivateRoute element={<ProblemDetail/>}/>}/>
				<Route path="/judge" element={<PrivateRoute element={<Judge/>}/>}/>
				<Route path="/create-problem" element={<PrivateRoute element={<CreateProblem/>}/>}/>
				<Route path="/study" element={<PrivateRoute element={<Study/>}/>}/>
				<Route path="/study/:id" element={<PrivateRoute element={<StudyDetail/>}/>}/>
			</Routes>
		</GoogleOAuthProvider>
	);
};

export default App;
