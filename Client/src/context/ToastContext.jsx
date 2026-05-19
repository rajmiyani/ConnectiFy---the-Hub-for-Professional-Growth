import React, { createContext, useContext, useState, useCallback } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success', duration = 3000) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type, duration }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, duration);
    }, []);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div
                className="toast-container position-fixed bottom-0 end-0 p-4"
                style={{ zIndex: 9999 }}
            >
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        {...toast}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const Toast = ({ message, type, onClose }) => {
    const getIcon = () => {
        switch (type) {
            case 'success': return <FaCheckCircle style={{ color: '#2ecc71' }} />;
            case 'error': return <FaExclamationCircle style={{ color: '#e74c3c' }} />;
            case 'warning': return <FaExclamationTriangle style={{ color: '#f1c40f' }} />;
            case 'info': return <FaInfoCircle style={{ color: '#3498db' }} />;
            default: return <FaInfoCircle style={{ color: '#2c3e50' }} />;
        }
    };

    return (
        <div
            className="toast show animate-slide-in"
            role="alert"
            style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                borderRadius: '12px',
                minWidth: '300px',
                border: '1px solid rgba(0,0,0,0.05)',
                marginBottom: '10px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px'
            }}
        >
            <div className="fs-5 me-3 d-flex align-items-center">
                {getIcon()}
            </div>
            <div className="flex-grow-1 text-dark" style={{ fontSize: '14px', fontWeight: '500' }}>
                {message}
            </div>
            <button
                type="button"
                className="btn-close ms-2"
                onClick={onClose}
                style={{ fontSize: '10px', opacity: 0.4 }}
            ></button>
            <style>{`
                .animate-slide-in {
                    animation: toastSlideIn 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards;
                }
                @keyframes toastSlideIn {
                    from { transform: translateX(120%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .toast-container {
                    top: 20px !important;
                    bottom: auto !important;
                }
            `}</style>
        </div>
    );
};
