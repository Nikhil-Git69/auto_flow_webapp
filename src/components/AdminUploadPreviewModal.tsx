import React from 'react';
import { X, Eye } from 'lucide-react';

interface AdminUploadPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileUrl: string;
    fileName: string;
}

const AdminUploadPreviewModal: React.FC<AdminUploadPreviewModalProps> = ({
    isOpen,
    onClose,
    fileUrl,
    fileName
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 lg:p-6">
            <div className="bg-white rounded-2xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <Eye size={16} className="text-[#159e8a] shrink-0" />
                        <span className="text-sm font-bold text-slate-700 truncate">{fileName}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-all font-bold text-sm shrink-0 ml-4"
                    >
                        <X size={16} />
                        Close
                    </button>
                </div>

                {/* Iframe — browser renders the file natively (PDF, image, etc.) */}
                <iframe
                    src={fileUrl}
                    className="flex-1 w-full border-none"
                    title={`Preview: ${fileName}`}
                />
            </div>
        </div>
    );
};

export default AdminUploadPreviewModal;
