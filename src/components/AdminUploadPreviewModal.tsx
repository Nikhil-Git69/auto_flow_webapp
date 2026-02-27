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
                {fileName.toLowerCase().endsWith('.pdf') ? (
                    <iframe
                        src={fileUrl}
                        className="flex-1 w-full border-none"
                        title={`Preview: ${fileName}`}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-8 text-center">
                        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl font-bold text-slate-500">{fileName.split('.').pop()?.toUpperCase()}</span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-700 mb-2">Preview Not Available</h4>
                        <p className="text-slate-500 mb-6 max-w-md">Live preview is currently only available for PDF documents. Please download the file to view its contents.</p>
                        <a
                            href={fileUrl}
                            download={fileName}
                            className="py-2 px-6 bg-[#159e8a] text-white font-medium rounded-lg hover:bg-teal-600 transition-colors"
                        >
                            Download Document
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUploadPreviewModal;
