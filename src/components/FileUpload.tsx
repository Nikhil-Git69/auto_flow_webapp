import React, { useCallback, useState } from 'react';
import { UploadCloud, FileType, Loader2, FileText, CheckCircle2 } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
  label?: string; // Custom label for different upload areas
  id?: string;    // Unique ID to prevent label conflicts
  acceptedFile?: File | null; // To show the "Success" state if a file is picked
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  isProcessing = false,
  label = "Click to upload or drag & drop",
  id = "file-upload",
  acceptedFile = null
}) => {
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
      className={`relative w-full max-w-2xl mx-auto min-h-[12rem] border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-white'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''} ${acceptedFile ? 'border-green-400 bg-green-50' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id={id}
        className="hidden"
        onChange={handleChange}
        accept=".pdf,.doc,.docx"
      />

      {isProcessing ? (
        <div className="flex flex-col items-center animate-pulse p-6">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
          <p className="text-lg font-medium text-slate-700">Analyzing.....</p>
        </div>
      ) : (
        <label htmlFor={id} className="flex flex-col items-center cursor-pointer w-full h-full justify-center p-6 text-center">
          {acceptedFile ? (
            <div className="flex flex-col items-center">
              <CheckCircle2 className="w-10 h-10 text-green-500 mb-2" />
              <p className="text-sm font-semibold text-green-700">{acceptedFile.name}</p>
              <p className="text-xs text-green-600 mt-1">File ready for analysis</p>
            </div>
          ) : (
            <>
              <div className="bg-indigo-100 p-3 rounded-full mb-3">
                <UploadCloud className="w-6 h-6 text-indigo-600" />
              </div>
              <p className="text-md font-semibold text-slate-700">{label}</p>
              <p className="text-xs text-slate-500 mt-1">PDF, Word (Max 10MB)</p>

              <div className="mt-4 flex gap-2 flex-wrap justify-center">
                <span className="px-2 py-0.5 bg-slate-100 text-[10px] text-slate-500 rounded flex items-center gap-1">
                  <FileType className="w-3 h-3" /> PDF
                </span>
                <span className="px-2 py-0.5 bg-slate-100 text-[10px] text-slate-500 rounded flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Word
                </span>
              </div>
            </>
          )}
        </label>
      )}
    </div>
  );
};

export default FileUpload;