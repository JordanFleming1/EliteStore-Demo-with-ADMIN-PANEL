import React, { createContext, useState, useCallback } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  autoHide?: boolean;
  delay?: number;
}

interface ToastContextType {
  showToast: (type: ToastMessage['type'], title: string, message: string, autoHide?: boolean) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((
    type: ToastMessage['type'], 
    title: string, 
    message: string, 
    autoHide: boolean = true
  ) => {
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`; // More unique ID
    const newToast: ToastMessage = {
      id,
      type,
      title,
      message,
      autoHide,
      delay: autoHide ? 4000 : undefined
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove after delay if autoHide is true
    if (autoHide) {
      setTimeout(() => {
        hideToast(id);
      }, newToast.delay);
    }
  }, [hideToast]);

  const getToastVariant = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success': return 'success';
      case 'error': return 'danger';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'light';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            show={true}
            onClose={() => hideToast(toast.id)}
            autohide={toast.autoHide}
            delay={toast.delay}
            bg={getToastVariant(toast.type)}
          >
            <Toast.Header>
              <i className={`fas ${
                toast.type === 'success' ? 'fa-check-circle text-success' :
                toast.type === 'error' ? 'fa-exclamation-circle text-danger' :
                toast.type === 'warning' ? 'fa-exclamation-triangle text-warning' :
                'fa-info-circle text-info'
              } me-2`}></i>
              <strong className="me-auto">{toast.title}</strong>
            </Toast.Header>
            <Toast.Body className={toast.type === 'success' ? 'text-white' : ''}>
              {toast.message}
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};

// Export the context at the bottom for Fast Refresh compatibility
export { ToastContext };