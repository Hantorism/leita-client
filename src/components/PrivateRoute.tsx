import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
	element: React.ReactElement;
}

const PrivateRoute = ({ element }: PrivateRouteProps) => {
	const isAuthenticated = !!localStorage.getItem('user');

	if (!isAuthenticated) {
		alert('🚨 로그인이 필요합니다.');
		return <Navigate to="/" replace/>;
	}

	return element;
};

export default PrivateRoute;
