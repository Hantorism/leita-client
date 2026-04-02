import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Alert } from '@components';

export type AlertType = 'success' | 'error' | 'info';

interface AlertState {
  type: AlertType;
  message: string;
}

interface AlertContextType {
  showAlert: (type: AlertType, message: string) => void;
}

const AlertContext = createContext<AlertContextType | null>(null);

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    // 개발 중 컨텍스트 유실로 인한 크래시 방지
    /* eslint-disable-next-line no-console */
    console.warn('useAlert used outside of AlertProvider. Make sure AlertProvider is mounted.');
    return {
      showAlert: () => {
        /* eslint-disable-next-line no-console */
        console.error('showAlert called before AlertProvider is ready.');
      }
    };
  }
  return context;
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alert, setAlert] = useState<AlertState | null>(null);

  const showAlert = useCallback((type: AlertType, message: string) => {
    setAlert({ type, message });
  }, []);

  const closeAlert = useCallback(() => {
    setAlert(null);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={closeAlert}
        />
      )}
    </AlertContext.Provider>
  );
};
