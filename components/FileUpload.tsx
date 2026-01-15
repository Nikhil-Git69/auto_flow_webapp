import React, { useCallback, useState } from 'react';
import { UploadCloud, FileType, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  }, [onFileSelect]);

  return (
    <div 
      className={`relative w-full max-w-2xl mx-auto h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${
        dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-white'
      } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleChange}
        accept=".pdf,.png,.jpg,.jpeg,.webp"
      />
      
      {isProcessing ? (
        <div className="flex flex-col items-center animate-pulse">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-lg font-medium text-slate-700">Analyzing document structure...</p>
            <p className="text-sm text-slate-500 mt-2">This may take a few seconds.</p>
        </div>
      ) : (
        <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer w-full h-full justify-center">
            <div className="bg-indigo-100 p-4 rounded-full mb-4">
            <UploadCloud className="w-8 h-8 text-indigo-600" />
            </div>
            <p className="text-lg font-semibold text-slate-700">Click to upload or drag & drop</p>
            <p className="text-sm text-slate-500 mt-2">PDF, PNG, JPG (Max 10MB)</p>
            <div className="mt-6 flex gap-3">
                <span className="px-3 py-1 bg-slate-100 text-xs text-slate-500 rounded-md flex items-center gap-1">
                    <FileType className="w-3 h-3" /> PDF
                </span>
                <span className="px-3 py-1 bg-slate-100 text-xs text-slate-500 rounded-md flex items-center gap-1">
                    <FileType className="w-3 h-3" /> Image
                </span>
            </div>
        </label>
      )}
    </div>
  );
};

export default FileUpload;