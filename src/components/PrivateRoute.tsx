import { useAlert } from '@contexts';
import { type ReactElement, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  element: ReactElement;
}

const PrivateRoute = ({ element }: PrivateRouteProps) => {
  const { showAlert } = useAlert();
  const isAuthenticated = !!localStorage.getItem('user');

  useEffect(() => {
    if (!isAuthenticated) {
      showAlert('error', '로그인이 필요합니다.');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return element;
};

export default PrivateRoute;
