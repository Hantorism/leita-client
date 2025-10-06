import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
	element: React.ReactNode;
}

export default function PrivateRoute({ element }: PrivateRouteProps) {
	const isAuthenticated = !!localStorage.getItem('user');

	useEffect(() => {
		if (!isAuthenticated) {
			alert('🚨 로그인이 필요합니다.');
		}
	}, [isAuthenticated]);

	return isAuthenticated ? element : <Navigate to="/" replace/>;
}
