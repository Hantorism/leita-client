import { Alert } from '@components';
import { Logger } from '@utils';
import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';

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
    Logger.warn('useAlert used outside of AlertProvider. Make sure AlertProvider is mounted.');
    return {
      showAlert: () => {
        Logger.error('showAlert called before AlertProvider is ready.');
      },
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
      {alert && <Alert type={alert.type} message={alert.message} onClose={closeAlert} />}
    </AlertContext.Provider>
  );
};
