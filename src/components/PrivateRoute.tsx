import { useAlert, useAuth } from '@contexts';
import { type ReactElement, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  element: ReactElement;
}

const PrivateRoute = ({ element }: PrivateRouteProps) => {
  const { showAlert } = useAlert();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      showAlert('error', '로그인이 필요합니다.');
    }
  }, [isAuthenticated, loading, showAlert]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1A1A1A]">
        <div className="w-12 h-12 border-4 border-[#CAFE33]/20 border-t-[#CAFE33] rounded-full animate-spin" />
      </div>
    );
  }

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
