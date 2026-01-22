// import React, { useState, useMemo } from 'react';
// import FileUpload from './FileUpload';
// import { DocumentAnalysis, User } from '../types';
// import { 
//   FileText, LogOut, Home, Search, Download, Trash2,
//   Info, Upload, X, Plus, Minus, ChevronDown, ChevronUp, 
//   Type, Ruler, AlignLeft, AlignCenter, Hash, BookOpen, Calendar,
//   ChevronRight
// } from 'lucide-react';

// interface DashboardProps {
//   user: User;
//   onFileSelect: (file: File, formatType?: string, templateFile?: File, formatRequirements?: string) => void;
//   isProcessing: boolean;
//   history: DocumentAnalysis[];
//   onLogout: () => void;
//   onDeleteDocument: (fileName: string, uploadDate: string) => void;
//   onNavigateHome?: () => void;
//   isHome?: boolean;
// }

// interface FormatField {
//   id: string;
//   label: string;
//   value: string;
//   icon: React.ReactNode;
//   placeholder: string;
//   type: 'input' | 'select';
//   options?: string[];
// }

// const Dashboard: React.FC<DashboardProps> = ({
//   user,
//   onFileSelect,
//   isProcessing,
//   history = [],
//   onLogout,
//   onDeleteDocument,
//   onNavigateHome,
//   isHome = false
// }) => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [startDate, setStartDate] = useState<string>('2021-01-01');
//   const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
//   const [formatType, setFormatType] = useState<'default' | 'custom'>('default');
//   const [templateFile, setTemplateFile] = useState<File | null>(null);
//   const [formatRequirements, setFormatRequirements] = useState<string>('');

//   // Initial format fields configuration with dropdown options
//   const initialFormatFields: Record<string, FormatField[]> = {
//     margins: [
//       { 
//         id: 'left-margin', 
//         label: 'Left Margin', 
//         value: '', 
//         icon: <Ruler size={16} />, 
//         placeholder: 'e.g., 1 inch',
//         type: 'select',
//         options: ['0.5 inch', '1 inch', '1.5 inches', '2 inches', 'Custom...']
//       },
//       { 
//         id: 'right-margin', 
//         label: 'Right Margin', 
//         value: '', 
//         icon: <Ruler size={16} />, 
//         placeholder: 'e.g., 1 inch',
//         type: 'select',
//         options: ['0.5 inch', '1 inch', '1.5 inches', '2 inches', 'Custom...']
//       },
//       { 
//         id: 'top-margin', 
//         label: 'Top Margin', 
//         value: '', 
//         icon: <Ruler size={16} />, 
//         placeholder: 'e.g., 1 inch',
//         type: 'select',
//         options: ['0.5 inch', '1 inch', '1.5 inches', '2 inches', 'Custom...']
//       },
//       { 
//         id: 'bottom-margin', 
//         label: 'Bottom Margin', 
//         value: '', 
//         icon: <Ruler size={16} />, 
//         placeholder: 'e.g., 1 inch',
//         type: 'select',
//         options: ['0.5 inch', '1 inch', '1.5 inches', '2 inches', 'Custom...']
//       },
//     ],
//     typography: [
//       { 
//         id: 'font-family', 
//         label: 'Font Family', 
//         value: '', 
//         icon: <Type size={16} />, 
//         placeholder: 'e.g., Arial',
//         type: 'select',
//         options: ['Arial', 'Times New Roman', 'Calibri', 'Georgia', 'Verdana', 'Custom...']
//       },
//       { 
//         id: 'font-size', 
//         label: 'Font Size', 
//         value: '', 
//         icon: <Type size={16} />, 
//         placeholder: 'e.g., 12pt',
//         type: 'select',
//         options: ['10pt', '11pt', '12pt', '14pt', '16pt', 'Custom...']
//       },
//       { 
//         id: 'heading-font', 
//         label: 'Heading Font', 
//         value: '', 
//         icon: <Type size={16} />, 
//         placeholder: 'e.g., Bold, 16pt',
//         type: 'select',
//         options: ['Bold, 14pt', 'Bold, 16pt', 'Bold, 18pt', 'Custom...']
//       },
//       { 
//         id: 'font-color', 
//         label: 'Font Color', 
//         value: '', 
//         icon: <Type size={16} />, 
//         placeholder: 'e.g., Black',
//         type: 'select',
//         options: ['Black', 'Dark Gray', 'Navy Blue', 'Custom...']
//       },
//     ],
//     spacing: [
//       { 
//         id: 'line-spacing', 
//         label: 'Line Spacing', 
//         value: '', 
//         icon: <AlignLeft size={16} />, 
//         placeholder: 'e.g., 1.5',
//         type: 'select',
//         options: ['Single', '1.15', '1.5', 'Double', 'Custom...']
//       },
//       { 
//         id: 'paragraph-spacing', 
//         label: 'Paragraph Spacing', 
//         value: '', 
//         icon: <AlignLeft size={16} />, 
//         placeholder: 'e.g., 12pt before',
//         type: 'select',
//         options: ['0pt before/after', '6pt before/after', '12pt before/after', 'Custom...']
//       },
//       { 
//         id: 'indentation', 
//         label: 'Indentation', 
//         value: '', 
//         icon: <AlignLeft size={16} />, 
//         placeholder: 'e.g., 0.5 inch',
//         type: 'select',
//         options: ['No indentation', '0.5 inch first line', '1 inch first line', 'Custom...']
//       },
//     ],
//     structure: [
//       { 
//         id: 'page-size', 
//         label: 'Page Size', 
//         value: '', 
//         icon: <FileText size={16} />, 
//         placeholder: 'e.g., A4',
//         type: 'select',
//         options: ['A4', 'Letter', 'Legal', 'Custom...']
//       },
//       { 
//         id: 'page-orientation', 
//         label: 'Page Orientation', 
//         value: '', 
//         icon: <FileText size={16} />, 
//         placeholder: 'e.g., Portrait',
//         type: 'select',
//         options: ['Portrait', 'Landscape']
//       },
//       { 
//         id: 'alignment', 
//         label: 'Alignment', 
//         value: '', 
//         icon: <AlignCenter size={16} />, 
//         placeholder: 'e.g., Justified',
//         type: 'select',
//         options: ['Left', 'Center', 'Right', 'Justified']
//       },
//       { 
//         id: 'page-numbers', 
//         label: 'Page Numbers', 
//         value: '', 
//         icon: <Hash size={16} />, 
//         placeholder: 'e.g., Bottom center',
//         type: 'select',
//         options: ['None', 'Top right', 'Bottom center', 'Custom...']
//       },
//     ],
//     special: [
//       { 
//         id: 'header-content', 
//         label: 'Header Content', 
//         value: '', 
//         icon: <FileText size={16} />, 
//         placeholder: 'e.g., Document title',
//         type: 'select',
//         options: ['None', 'Document title', 'Chapter name', 'Page numbers', 'Custom...']
//       },
//       { 
//         id: 'footer-content', 
//         label: 'Footer Content', 
//         value: '', 
//         icon: <FileText size={16} />, 
//         placeholder: 'e.g., Page numbers',
//         type: 'select',
//         options: ['None', 'Page numbers', 'Date', 'Author name', 'Custom...']
//       },
//       { 
//         id: 'citation-style', 
//         label: 'Citation Style', 
//         value: '', 
//         icon: <BookOpen size={16} />, 
//         placeholder: 'e.g., APA 7th',
//         type: 'select',
//         options: ['APA 7th', 'MLA 9th', 'Chicago', 'Harvard', 'IEEE', 'Custom...']
//       },
//       { 
//         id: 'date-format', 
//         label: 'Date Format', 
//         value: '', 
//         icon: <Calendar size={16} />, 
//         placeholder: 'e.g., DD/MM/YYYY',
//         type: 'select',
//         options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'Month Day, Year', 'Custom...']
//       },
//     ]
//   };

//   const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
//     margins: true,
//     typography: true,
//     spacing: true,
//     structure: true,
//     special: true,
//     additional: true
//   });

//   const [formatFields, setFormatFields] = useState<Record<string, FormatField[]>>(initialFormatFields);
//   const [customInputMode, setCustomInputMode] = useState<Record<string, boolean>>({});

//   const [additionalFields, setAdditionalFields] = useState<FormatField[]>([
//     { 
//       id: 'custom-1', 
//       label: 'Additional Requirement', 
//       value: '', 
//       icon: <Plus size={16} />, 
//       placeholder: 'Add custom requirement...',
//       type: 'input'
//     }
//   ]);

//   const handleFileSelectWithFormat = (file: File) => {
//     const requirements = generateFormatRequirements();
//     onFileSelect(file, formatType, templateFile || undefined, requirements);
//     if (formatType === 'custom') {
//       setTemplateFile(null);
//       resetFormatFields();
//     }
//   };

//   const generateFormatRequirements = () => {
//     const allRequirements: string[] = [];
    
//     // Object.entries(formatFields).forEach(([section, fields]) => {
//     //   const sectionRequirements = fields
//     //     .filter(field => field.value && field.value.trim())
//     //     .map(field => `${field.label}: ${field.value}`);
      
//     //   if (sectionRequirements.length > 0) {
//     //     allRequirements.push(`# ${section.charAt(0).toUpperCase() + section.slice(1)}`, ...sectionRequirements, '');
//     //   }
//     // });

//     const additionalRequirements = additionalFields
//       .filter(field => field.value && field.value.trim())
//       .map(field => `- ${field.value}`);

//     if (additionalRequirements.length > 0) {
//       allRequirements.push('# Additional Requirements', ...additionalRequirements);
//     }

//     return allRequirements.join('\n');
//   };

//   const resetFormatFields = () => {
//     const resetFields: Record<string, FormatField[]> = {};
//     Object.entries(initialFormatFields).forEach(([section, fields]) => {
//       resetFields[section] = fields.map(field => ({ ...field, value: '' }));
//     });
//     setFormatFields(resetFields);
//     setCustomInputMode({});
//     setAdditionalFields([{ 
//       id: 'custom-1', 
//       label: 'Additional Requirement', 
//       value: '', 
//       icon: <Plus size={16} />, 
//       placeholder: 'Add custom requirement...',
//       type: 'input'
//     }]);
//     setFormatRequirements('');
//   };

//   const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setTemplateFile(e.target.files[0]);
//     }
//   };

//   const removeTemplateFile = () => {
//     setTemplateFile(null);
//   };

//   const toggleSection = (section: string) => {
//     setExpandedSections(prev => ({
//       ...prev,
//       [section]: !prev[section]
//     }));
//   };

//   const handleFieldChange = (section: string, index: number, value: string) => {
//     setFormatFields(prev => ({
//       ...prev,
//       [section]: prev[section].map((field, i) => {
//         if (i === index) {
//           // Check if user selected "Custom..." option
//           if (value === 'Custom...') {
//             setCustomInputMode(prevMode => ({
//               ...prevMode,
//               [`${section}-${field.id}`]: true
//             }));
//             return { ...field, value: '' };
//           }
//           return { ...field, value };
//         }
//         return field;
//       })
//     }));
//     const requirements = generateFormatRequirements();
//     setFormatRequirements(requirements);
//   };

//   const handleCustomInput = (section: string, fieldId: string, value: string) => {
//     setFormatFields(prev => ({
//       ...prev,
//       [section]: prev[section].map(field => {
//         if (field.id === fieldId) {
//           return { ...field, value };
//         }
//         return field;
//       })
//     }));
//     const requirements = generateFormatRequirements();
//     setFormatRequirements(requirements);
//   };

//   const handleAdditionalFieldChange = (index: number, value: string) => {
//     setAdditionalFields(prev => 
//       prev.map((field, i) => 
//         i === index ? { ...field, value } : field
//       )
//     );
//     const requirements = generateFormatRequirements();
//     setFormatRequirements(requirements);
//   };

//   const addAdditionalField = () => {
//     setAdditionalFields(prev => [
//       ...prev,
//       { 
//         id: `custom-${Date.now()}`, 
//         label: 'Additional Requirement', 
//         value: '', 
//         icon: <Plus size={16} />,
//         placeholder: 'Add custom requirement...',
//         type: 'input'
//       }
//     ]);
//   };

//   const removeAdditionalField = (index: number) => {
//     if (additionalFields.length > 1) {
//       setAdditionalFields(prev => prev.filter((_, i) => i !== index));
//       const requirements = generateFormatRequirements();
//       setFormatRequirements(requirements);
//     }
//   };

//   const handleDownload = (doc: DocumentAnalysis) => {
//     const link = document.createElement('a');
//     link.href = "#";
//     link.download = doc.fileName;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const handleDelete = (doc: DocumentAnalysis) => {
//     if (window.confirm(`Permanently delete ${doc.fileName}?`)) {
//       onDeleteDocument(doc.fileName, doc.uploadDate);
//     }
//   };

//   const filteredHistory = useMemo(() => {
//     if (!Array.isArray(history)) {
//       return [];
//     }
    
//     return history.filter((doc: DocumentAnalysis) => {
//       if (!doc) return false;
      
//       const fileName = doc.fileName || '';
//       const uploadDate = doc.uploadDate || '';
      
//       try {
//         const docDate = new Date(uploadDate).toISOString().split('T')[0];
//         const isWithinDate = docDate >= startDate && docDate <= endDate;
//         const matchesSearch = fileName.toLowerCase().includes(searchQuery.toLowerCase());
//         return isWithinDate && matchesSearch;
//       } catch (error) {
//         console.error('Error filtering document:', doc, error);
//         return false;
//       }
//     });
//   }, [history, startDate, endDate, searchQuery]);

//   const renderFieldInput = (sectionKey: string, field: FormatField, index: number) => {
//     const customInputKey = `${sectionKey}-${field.id}`;
//     const isCustomMode = customInputMode[customInputKey];
    
//     if (field.type === 'select' && field.options && !isCustomMode) {
//       return (
//         <select
//           value={field.value}
//           onChange={(e) => handleFieldChange(sectionKey, index, e.target.value)}
//           className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#159e8a]/30 focus:border-[#159e8a] bg-white"
//         >
//           <option value="">Select an option...</option>
//           {field.options.map((option, idx) => (
//             <option key={idx} value={option}>
//               {option}
//             </option>
//           ))}
//         </select>
//       );
//     }
    
//     return (
//       <div className="relative">
//         <input
//           type="text"
//           value={field.value}
//           onChange={(e) => isCustomMode ? 
//             handleCustomInput(sectionKey, field.id, e.target.value) : 
//             handleFieldChange(sectionKey, index, e.target.value)
//           }
//           placeholder={field.placeholder}
//           className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#159e8a]/30 focus:border-[#159e8a]"
//         />
//         {field.type === 'select' && field.options && (
//           <button
//             type="button"
//             onClick={() => setCustomInputMode(prev => ({
//               ...prev,
//               [customInputKey]: !prev[customInputKey]
//             }))}
//             className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#159e8a]"
//           >
//             <ChevronRight size={16} className={isCustomMode ? 'rotate-90' : ''} />
//           </button>
//         )}
//       </div>
//     );
//   };

//   const renderSection = (sectionKey: string, title: string, fields: FormatField[]) => (
//     <div className="bg-slate-50 rounded-lg border border-slate-200 mb-3 overflow-hidden">
//       <button
//         onClick={() => toggleSection(sectionKey)}
//         className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-100 transition-colors"
//       >
//         <div className="flex items-center gap-2">
//           <span className="font-semibold text-slate-700">{title}</span>
//           <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
//             {fields.filter(f => f.value && f.value.trim()).length}/{fields.length} set
//           </span>
//         </div>
//         {expandedSections[sectionKey] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//       </button>
      
//       {expandedSections[sectionKey] && (
//         <div className="px-4 py-3 border-t border-slate-200 bg-white">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//             {fields.map((field, index) => (
//               <div key={field.id} className="space-y-1">
//                 <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
//                   {field.icon}
//                   {field.label}
//                 </label>
//                 {renderFieldInput(sectionKey, field, index)}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );

//   return (
//     <div className="flex min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
//       <aside className="w-20 md:w-24 bg-white border-r border-slate-200 flex flex-col items-center py-8 gap-10 sticky top-0 h-screen">
//         <div className="text-[#159e8a]">
//           <div className="w-10 h-10 border-4 border-[#159e8a] rounded-lg flex items-center justify-center font-black text-xl">A</div>
//         </div>
//         <div className="flex flex-col gap-8 flex-1">
//           <button 
//             onClick={onNavigateHome} 
//             className={`p-3 transition-colors ${
//               isHome 
//                 ? 'bg-[#e8f6f4] text-[#159e8a] rounded-xl border-r-4 border-[#159e8a]' 
//                 : 'text-slate-400 hover:text-[#159e8a]'
//             }`}
//           >
//             <Home size={24} />
//           </button>
//           <button 
//             onClick={onNavigateHome}
//             className={`p-3 transition-colors ${
//               !isHome 
//                 ? 'bg-[#e8f6f4] text-[#159e8a] rounded-xl border-r-4 border-[#159e8a]' 
//                 : 'text-slate-400 hover:text-[#159e8a]'
//             }`}
//           >
//             <FileText size={24} />
//           </button>
//         </div>
//         <button onClick={onLogout} className="p-3 text-slate-300 hover:text-red-500 transition-colors mb-4">
//           <LogOut size={24} />
//         </button>
//       </aside>

//       <main className="flex-1 p-6 md:p-10">
//         <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight text-slate-800">Documents</h1>
//             <p className="text-slate-500 text-sm mt-1">Institutional portal for {user.collegeName}.</p>
//           </div>

//           <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
//             <span className="text-slate-400 ml-2">Show from</span>
//             <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100 outline-[#159e8a]"/>
//             <span className="text-slate-400">to</span>
//             <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100 outline-[#159e8a]"/>
//           </div>
//         </header>

//         <div className="flex items-center justify-between border-b border-slate-200 mb-8">
//           <div className="pb-4 border-b-2 border-[#159e8a] text-[#159e8a] font-semibold text-sm">
//             All documents <span className="ml-1 bg-[#e8f6f4] px-2 py-0.5 rounded text-xs">{filteredHistory.length}</span>
//           </div>
//           <div className="relative mb-4">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//             <input 
//               type="text"
//               placeholder="Search documents..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-10 pr-4 py-2 bg-transparent border-none focus:ring-0 text-sm text-slate-600 w-64"
//             />
//           </div>
//         </div>

//         {/* Format Selection Section */}
//         <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
//           <h3 className="text-lg font-semibold text-slate-800 mb-4"></h3>
          
//           <div className="flex gap-2 mb-6">
//             <button
//               onClick={() => setFormatType('default')}
//               className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
//                 formatType === 'default'
//                   ? 'bg-[#159e8a] text-white'
//                   : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//               }`}
//             >
//               Default
//             </button>
//             <button
//               onClick={() => setFormatType('custom')}
//               className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
//                 formatType === 'custom'
//                   ? 'bg-[#159e8a] text-white'
//                   : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//               }`}
//             >
//               Custom 
//             </button>
//           </div>
          
//           {/* File Upload Area */}
//           <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 mb-10 hover:border-[#159e8a] transition-colors">
//             <FileUpload 
//               onFileSelect={handleFileSelectWithFormat} 
//               isProcessing={isProcessing} 
//             />
//           </div>
          
//           {/* Default Format Info */}
//           {formatType === 'default' && (
//             <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
//               <div className="flex items-start gap-3">
//                 <Info className="text-[#159e8a] mt-0.5 flex-shrink-0" size={18} />
//                 <div>
//                   <h4 className="font-medium text-slate-700 mb-1">Standard Workflow</h4>
//                   <p className="text-sm text-slate-600">
//                     AI analyzes and points out errors in general document structure, including grammar, spelling, and basic formatting.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}
          
//           {/* Custom Format Section */}
//           {formatType === 'custom' && (
//             <div className="space-y-6">
//               <div>
//                 <h4 className="font-medium text-slate-700 mb-2">Upload Format Template</h4>
//                 <p className="text-sm text-slate-600 mb-4">
//                   Upload an image, PDF, or document that shows the desired format structure
//                 </p>
                
//                 <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-[#159e8a] transition-colors">
//                   <input
//                     type="file"
//                     id="templateUpload"
//                     onChange={handleTemplateUpload}
//                     accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
//                     className="hidden"
//                   />
//                   <label htmlFor="templateUpload" className="cursor-pointer block">
//                     <Upload className="mx-auto text-slate-400 mb-2" size={24} />
//                     <span className="text-sm font-medium text-slate-700">Click to upload template</span>
//                     <p className="text-xs text-slate-500 mt-1">or drag & drop template here</p>
//                     <p className="text-xs text-slate-400 mt-2">PDF, Word, Text, Images (Max 10MB)</p>
//                   </label>
//                 </div>
                
//                 {templateFile && (
//                   <div className="mt-4 bg-[#e8f6f4] border border-[#159e8a]/30 rounded-lg p-3">
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2">
//                         <FileText size={16} className="text-[#159e8a]" />
//                         <span className="text-sm font-medium text-slate-700 truncate">
//                           {templateFile.name}
//                         </span>
//                       </div>
//                       <button
//                         onClick={removeTemplateFile}
//                         className="text-slate-400 hover:text-red-500 transition-colors"
//                       >
//                         <X size={16} />
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
              
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <h4 className="font-semibold text-slate-800 text-lg">Specify Format Requirements</h4>
//                   <span className="text-xs text-slate-500">Fill in details below</span>
//                 </div>
                
//                 {/* Render all sections */}
//                 {renderSection('margins', 'Margins', formatFields.margins)}
//                 {renderSection('typography', 'Typography', formatFields.typography)}
//                 {renderSection('spacing', 'Spacing', formatFields.spacing)}
//                 {renderSection('structure', 'Page Structure', formatFields.structure)}
//                 {renderSection('special', 'Special Requirements', formatFields.special)}
                
//                 {/* Additional Requirements Section */}
//                 <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
//                   <button
//                     onClick={() => toggleSection('additional')}
//                     className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-100 transition-colors"
//                   >
//                     <div className="flex items-center gap-2">
//                       <span className="font-semibold text-slate-700">Additional Requirements</span>
//                       <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
//                         {additionalFields.filter(f => f.value && f.value.trim()).length}/{additionalFields.length} set
//                       </span>
//                     </div>
//                     {expandedSections.additional ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//                   </button>
                  
//                   {expandedSections.additional && (
//                     <div className="px-4 py-3 border-t border-slate-200 bg-white">
//                       <div className="space-y-3">
//                         {additionalFields.map((field, index) => (
//                           <div key={field.id} className="flex gap-2 items-start">
//                             <div className="flex-1">
//                               <input
//                                 type="text"
//                                 value={field.value}
//                                 onChange={(e) => handleAdditionalFieldChange(index, e.target.value)}
//                                 placeholder={field.placeholder}
//                                 className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#159e8a]/30 focus:border-[#159e8a]"
//                               />
//                             </div>
//                             {additionalFields.length > 1 && (
//                               <button
//                                 onClick={() => removeAdditionalField(index)}
//                                 className="mt-2 p-2 text-slate-400 hover:text-red-500 transition-colors"
//                               >
//                                 <Minus size={16} />
//                               </button>
//                             )}
//                           </div>
//                         ))}
//                         <button
//                           onClick={addAdditionalField}
//                           className="flex items-center gap-2 text-sm text-[#159e8a] hover:text-[#127c6d] transition-colors mt-2"
//                         >
//                           <Plus size={16} />
//                           Add another requirement
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
              
//               {/* Preview of generated requirements */}
//               {formatRequirements && (
//                 <div className="mt-4">
//                   <h5 className="font-medium text-slate-700 mb-2">Generated Format Requirements:</h5>
//                   <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 max-h-40 overflow-y-auto">
//                     <pre className="text-xs text-slate-600 whitespace-pre-wrap">{formatRequirements}</pre>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Documents Table */}
//         <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
//           <table className="w-full text-left border-collapse">
//             <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
//               <tr>
//                 <th className="px-6 py-4">Title</th>
//                 <th className="px-6 py-4">Date</th>
//                 <th className="px-6 py-4">Score</th>
//                 <th className="px-6 py-4 text-right">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100">
//               {filteredHistory.length > 0 ? (
//                 filteredHistory.map((doc, idx) => (
//                   <tr key={`${doc.fileName}-${doc.uploadDate}-${idx}`} className="hover:bg-slate-50 transition-colors group">
//                     <td className="px-6 py-4 font-semibold text-slate-700 flex items-center gap-3">
//                       <FileText size={18} className="text-[#159e8a]" />
//                       {doc.fileName}
//                     </td>
//                     <td className="px-6 py-4 text-slate-500 text-sm">
//                       {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : 'N/A'}
//                     </td>
//                     <td className="px-6 py-4">
//                       <span className={`px-2 py-1 rounded text-[10px] font-bold ${doc.totalScore > 80 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
//                         {doc.totalScore}%
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-right">
//                       <div className="flex justify-end gap-4">
//                         <button onClick={() => handleDownload(doc)} className="text-slate-300 hover:text-[#159e8a]"><Download size={18} /></button>
//                         <button onClick={() => handleDelete(doc)} className="text-slate-300 hover:text-red-500"><Trash2 size={18} /></button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
//                     No documents found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Dashboard;
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import FileUpload from './FileUpload';
import { DocumentAnalysis, User } from '../types';
import { 
  FileText, LogOut, Home, Ruler, Type, AlignLeft, 
  ChevronDown, ChevronUp, Upload, Download, Trash2,
  Search, 
  ChevronRight
} from 'lucide-react';

interface FormatField {
  id: string;
  label: string;
  value: string;
  icon: React.ReactNode;
  placeholder: string;
  type: 'input' | 'select';
  options?: string[];
}

interface DashboardProps {
  user: User;
  onFileSelect: (file: File, formatType?: string, templateFile?: File, formatRequirements?: string) => void;
  isProcessing: boolean;
  history: DocumentAnalysis[];
  onLogout: () => void;
  onDeleteDocument: (fileName: string, uploadDate: string) => void;
  onNavigateHome?: () => void;
  isHome?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  onFileSelect,
  isProcessing,
  history = [],
  onLogout,
  onDeleteDocument,
  onNavigateHome,
  isHome = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [formatType, setFormatType] = useState<'default' | 'custom'>('default');
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [formatRequirements, setFormatRequirements] = useState<string>('');

  const initialFormatFields: Record<string, FormatField[]> = {
    margins: [
      { id: 'left-margin', label: 'Left Margin', value: '', icon: <Ruler size={16} />, placeholder: 'e.g., 1 inch', type: 'select', options: ['0.5 inch', '1 inch', '1.5 inches', '2 inches', 'Custom...'] },
      { id: 'right-margin', label: 'Right Margin', value: '', icon: <Ruler size={16} />, placeholder: 'e.g., 1 inch', type: 'select', options: ['0.5 inch', '1 inch', '1.5 inches', '2 inches', 'Custom...'] },
      { id: 'top-margin', label: 'Top Margin', value: '', icon: <Ruler size={16} />, placeholder: 'e.g., 1 inch', type: 'select', options: ['0.5 inch', '1 inch', '1.5 inches', '2 inches', 'Custom...'] },
      { id: 'bottom-margin', label: 'Bottom Margin', value: '', icon: <Ruler size={16} />, placeholder: 'e.g., 1 inch', type: 'select', options: ['0.5 inch', '1 inch', '1.5 inches', '2 inches', 'Custom...'] },
    ],
    typography: [
      { id: 'font-family', label: 'Font Family', value: '', icon: <Type size={16} />, placeholder: 'e.g., Arial', type: 'select', options: ['Arial', 'Times New Roman', 'Calibri', 'Georgia', 'Verdana', 'Custom...'] },
      { id: 'font-size', label: 'Font Size', value: '', icon: <Type size={16} />, placeholder: 'e.g., 12pt', type: 'select', options: ['10pt', '11pt', '12pt', '14pt', '16pt', 'Custom...'] },
    ],
    spacing: [
      { id: 'line-spacing', label: 'Line Spacing', value: '', icon: <AlignLeft size={16} />, placeholder: 'e.g., 1.5', type: 'select', options: ['Single', '1.15', '1.5', 'Double', 'Custom...'] },
    ]
  };

  const [formatFields, setFormatFields] = useState<Record<string, FormatField[]>>(initialFormatFields);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    margins: true, typography: false, spacing: false
  });
  const [customInputMode, setCustomInputMode] = useState<Record<string, boolean>>({});

  // --- ANALYSIS LOGIC IMPROVED ---
 const generateRequirementsString = useCallback((fields: Record<string, FormatField[]>) => {
    const lines: string[] = ["### MANDATORY FORMATTING RULES ###"];
    Object.entries(fields).forEach(([section, fieldList]) => {
      const active = fieldList.filter(f => f.value.trim() && f.value !== 'Default');
      if (active.length > 0) {
        active.forEach(f => lines.push(`!!! RULE: DOCUMENT MUST USE ${f.value.toUpperCase()} FOR ${f.label.toUpperCase()} !!!`));
      }
    });
    return lines.length === 1 ? "Standard formatting." : lines.join('\n');
  }, []);
  // Update requirements string whenever fields change
  useEffect(() => {
    setFormatRequirements(generateRequirementsString(formatFields));
  }, [formatFields, generateRequirementsString]);

  const filteredHistory = useMemo(() => {
    const safeHistory = (history as DocumentAnalysis[]) || [];
    return safeHistory.filter((doc: DocumentAnalysis) => {
      const name = doc?.fileName || '';
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [history, searchQuery]);

  const handleFieldChange = (section: string, index: number, value: string) => {
    setFormatFields(prev => {
      const updatedList = prev[section].map((field, i) => {
        if (i === index) {
          if (value === 'Custom...') {
            setCustomInputMode(m => ({ ...m, [`${section}-${field.id}`]: true }));
            return { ...field, value: '' };
          }
          return { ...field, value };
        }
        return field;
      });
      return { ...prev, [section]: updatedList };
    });
  };

  const handleFileSelectWithFormat = (file: File) => {
    // We use the direct current requirements to avoid any stale state closures
    const currentReqs = formatType === 'custom' ? formatRequirements : "Standard academic formatting.";
    onFileSelect(file, formatType, templateFile || undefined, currentReqs);
  };

  const renderSection = (sectionKey: string, title: string, fields: FormatField[]) => (
    <div className="bg-slate-50 rounded-lg border border-slate-200 mb-3 overflow-hidden">
      <button
        onClick={() => setExpandedSections(p => ({ ...p, [sectionKey]: !p[sectionKey] }))}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-100"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">{title}</span>
          <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
            {fields.filter(f => f.value.trim()).length} Set
          </span>
        </div>
        {expandedSections[sectionKey] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {expandedSections[sectionKey] && (
        <div className="px-4 py-4 border-t border-slate-200 bg-white grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                {field.label}
              </label>
              {customInputMode[`${sectionKey}-${field.id}`] ? (
                <input 
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-teal-500"
                  value={field.value}
                  onChange={(e) => handleFieldChange(sectionKey, index, e.target.value)}
                  placeholder={field.placeholder}
                  autoFocus
                />
              ) : (
                <select
                  value={field.value}
                  onChange={(e) => handleFieldChange(sectionKey, index, e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
                >
                  <option value="">Default (Auto-detect)</option>
                  {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen w-screen bg-slate-50 font-sans antialiased text-slate-900 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-20 md:w-24 bg-white border-r border-slate-200 flex flex-col items-center py-8 gap-10 flex-shrink-0">
        <div className="w-10 h-10 border-4 border-[#159e8a] rounded-lg flex items-center justify-center font-black text-xl text-[#159e8a]">A</div>
        <div className="flex flex-col gap-8 flex-1">
          <button onClick={onNavigateHome} className={`p-3 transition-colors ${isHome ? 'bg-teal-50 text-[#159e8a] rounded-xl border-r-4 border-[#159e8a]' : 'text-slate-400 hover:text-slate-600'}`}><Home /></button>
          <button className="p-3 text-slate-400 hover:text-slate-600"><FileText /></button>
        </div>
        <button onClick={onLogout} className="p-3 text-slate-300 hover:text-red-500 transition-colors mb-4"><LogOut /></button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 h-full overflow-y-auto p-6 md:p-10">
        <header className="mb-8 flex justify-between items-end w-full">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Analyzer</h1>
            <p className="text-slate-500 font-medium">{user.collegeName} Dashboard</p>
          </div>
          <div className="text-right text-xs text-slate-400">
            Welcome, <span className="text-slate-700 font-bold">{user.name}</span>
          </div>
        </header>

        {/* TOP SECTION: UPLOAD & REQUIREMENTS */}
        <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
          <div className="flex gap-2 mb-8 p-1 bg-slate-100 w-fit rounded-xl border border-slate-200">
            {(['default', 'custom'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFormatType(type)}
                className={`px-8 py-2.5 rounded-lg text-xs font-black tracking-widest transition-all ${
                  formatType === type ? 'bg-white text-[#159e8a] shadow-md' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {type.toUpperCase()} 
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
            <div className="space-y-6">
              <FileUpload 
                onFileSelect={handleFileSelectWithFormat} 
                 isProcessing={isProcessing} />
              {formatType === 'custom' && (
                <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <h4 className="font-bold text-slate-700 text-xs mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <Upload size={14}/> Optional: Reference Template
                  </h4>
                  <input 
                    type="file" 
                    onChange={(e) => setTemplateFile(e.target.files?.[0] || null)} 
                    className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-teal-50 file:text-teal-700 cursor-pointer w-full" 
                  />
                </div>
              )}
            </div>

            {formatType === 'custom' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                   <h3 className="font-bold text-slate-800 text-sm">Formatting Requirements</h3>
                   <button onClick={() => { setFormatFields(initialFormatFields); setFormatRequirements(''); setCustomInputMode({}); }} className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase">Reset All</button>
                </div>
                <div className="max-h-[420px] overflow-y-auto pr-3">
                  {renderSection('margins', 'Page Layout', formatFields.margins)}
                  {renderSection('typography', 'Typography & Fonts', formatFields.typography)}
                  {renderSection('spacing', 'Paragraph Spacing', formatFields.spacing)}
                  <div className="mt-6 p-5 bg-teal-900 rounded-xl border border-teal-700">
                    <h5 className="text-[10px] font-black text-teal-300 uppercase mb-3 tracking-[0.2em]">Active Protocol:</h5>
                    <div className="text-[11px] text-teal-50 font-mono whitespace-pre-wrap">{formatRequirements || "Analyzing against standard guidelines..."}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RECENT ANALYSES TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full mb-10">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
             <h3 className="font-bold text-slate-800">Recent Analyses</h3>
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 bg-slate-100 border-none rounded-full text-xs outline-none focus:ring-2 focus:ring-teal-500 w-48"
                />
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                <tr>
                  <th className="px-8 py-4">Document Name</th>
                  <th className="px-8 py-4">Score</th>
                  <th className="px-8 py-4 text-right">Options</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((doc: any, i: number) => (
                    <tr key={`${doc.fileName}-${i}`} className="hover:bg-slate-50/80 group transition-colors">
                      <td className="px-8 py-5 font-bold text-slate-700">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-teal-50 rounded-lg text-teal-600"><FileText size={18} /></div>
                          <div className="flex flex-col">
                             <span>{doc.fileName}</span>
                             <span className="text-[10px] text-slate-400 font-medium">Analyzed on {new Date(doc.uploadDate || doc.analyzedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-[#159e8a]" style={{ width: `${doc.totalScore || doc.score || 0}%` }} />
                          </div>
                          <span className="text-xs font-black text-slate-600">{doc.totalScore || doc.score || 0}%</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg"><Download size={18}/></button>
                          <button onClick={() => onDeleteDocument(doc.fileName, doc.uploadDate)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={3} className="px-8 py-20 text-center text-slate-400 italic">No records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;