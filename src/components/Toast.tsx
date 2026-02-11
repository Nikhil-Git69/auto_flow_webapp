import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastProps {
    toasts: ToastMessage[];
    removeToast: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toasts, removeToast }) => {
    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
                ))}
            </AnimatePresence>
        </div>
    );
};

const ToastItem: React.FC<{ toast: ToastMessage; removeToast: (id: string) => void }> = ({
    toast,
    removeToast,
}) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            removeToast(toast.id);
        }, 5000);

        return () => clearTimeout(timer);
    }, [toast.id, removeToast]);

    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getBgColor = () => {
        switch (toast.type) {
            case 'success':
                return 'bg-white border-green-100'; // Modern minimal look
            case 'error':
                return 'bg-white border-red-100';
            default:
                return 'bg-white border-blue-100';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            layout
            className={`
        pointer-events-auto
        flex items-center gap-3 
        min-w-[300px] max-w-md 
        p-4 rounded-xl shadow-lg border 
        ${getBgColor()}
      `}
        >
            <div className="flex-shrink-0">{getIcon()}</div>
            <p className="flex-1 text-sm font-medium text-slate-700 leading-snug">
                {toast.message}
            </p>
            <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
};

export default Toast;
