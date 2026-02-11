import React, { useState } from 'react';
import { analyzeDocument } from '../services/aiService';

const DocumentEditor = () => {
  const [highlights, setHighlights] = useState<any[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfUrl(URL.createObjectURL(file));
      const data = await analyzeDocument(file);
      setHighlights(data.errors); // Assuming Python returns an 'errors' list
    }
  };

  return (
    <div className="relative">
      <input type="file" onChange={handleFileUpload} />
      
      {/* The PDF Viewer Layer */}
      <div className="pdf-container relative border">
        {pdfUrl && <iframe src={pdfUrl} width="100%" height="600px" />}

        {/* The AI Highlight Layer (SVG or Divs) */}
        {highlights.map((err, index) => (
          <div
            key={index}
            className="absolute border-2 border-red-500 bg-red-200/30 cursor-help"
            style={{
              left: `${(err.bbox[0] / 1000) * 100}%`,
              top: `${(err.bbox[1] / 1000) * 100}%`,
              width: `${((err.bbox[2] - err.bbox[0]) / 1000) * 100}%`,
              height: `${((err.bbox[3] - err.bbox[1]) / 1000) * 100}%`,
            }}
            title={err.message}
          />
        ))}
      </div>
    </div>
  );
};