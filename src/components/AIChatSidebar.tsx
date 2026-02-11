import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, FileUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    id: string;
    role: 'user' | 'ai';
    text: string;
    timestamp: Date;
}

interface AIChatSidebarProps {
    onSendMessage: (message: string) => void;
    onUploadTemplate: (file: File) => void;
    isProcessing?: boolean;
}

const AIChatSidebar: React.FC<AIChatSidebarProps> = ({
    onSendMessage,
    onUploadTemplate,
    isProcessing = false
}) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'ai',
            text: "Hello! I'm your document assistant. Upload a custom template or ask me to help edit your document.",
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Listen for AI responses from parent
    useEffect(() => {
        const handleAIResponse = (e: Event) => {
            const customEvent = e as CustomEvent;
            const responseText = customEvent.detail;

            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'ai',
                text: responseText,
                timestamp: new Date()
            }]);
        };

        window.addEventListener('ai-response', handleAIResponse);
        return () => window.removeEventListener('ai-response', handleAIResponse);
    }, []);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMessage]);
        onSendMessage(inputValue);
        setInputValue('');

        // Simulate AI thinking (if no real AI response logic is hooked up immediately)
        // In a real app, the parent component would drive the AI response
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            onUploadTemplate(file);

            // Add system message about upload
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'ai',
                text: `Success! I've loaded the template: "${file.name}". I will use this structure for your document.`,
                timestamp: new Date()
            }]);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white border-r border-slate-200 w-[350px] shadow-sm">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h2 className="font-bold text-slate-800 text-sm">AI Assistant</h2>
                    <p className="text-xs text-slate-500">Always here to help</p>
                </div>
            </div>

            {/* Template Upload & Presets */}
            <div className="p-3 border-b border-slate-100 bg-indigo-50/30 space-y-3">
                {/* Presets Grid */}
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Apply Template</p>
                    <div className="grid grid-cols-2 gap-2">
                        {['Professional', 'Academic', 'Legal', 'Resume'].map((template) => (
                            <button
                                key={template}
                                onClick={() => {
                                    // Simulate sending a message and trigger parent action
                                    onSendMessage(`Applying ${template} template...`);
                                    // We need a prop to handle this directly, but for now we'll use the message 
                                    // to signal the parent or add a specific prop in next step if needed.
                                    // Actually, let's look at the props. We have onUploadTemplate. 
                                    // We probably need onSelectTemplate. For now, I'll emit a custom event 
                                    // or use onSendMessage to trigger it via text command if the parent supports it.
                                    // Better: Use a custom event dispatch for cleaner decoupled logic
                                    window.dispatchEvent(new CustomEvent('template-select', { detail: template.toLowerCase() }));
                                }}
                                className="px-2 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all text-left flex items-center gap-1"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                {template}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="h-px bg-slate-200 flex-1"></div>
                    <span className="text-[10px] text-slate-400">OR</span>
                    <div className="h-px bg-slate-200 flex-1"></div>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".docx,.pdf,.txt"
                    onChange={handleFileChange}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white border border-indigo-200 rounded-md text-indigo-700 text-xs font-medium hover:bg-indigo-50 transition-colors shadow-sm"
                >
                    <FileUp className="w-4 h-4" />
                    Upload Custom Template
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'ai' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'
                                }`}>
                                {msg.role === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                            </div>

                            <div className={`max-w-[80%] rounded-lg p-3 text-sm ${msg.role === 'ai'
                                ? 'bg-white border border-slate-200 text-slate-700 shadow-sm'
                                : 'bg-indigo-600 text-white shadow-md'
                                }`}>
                                {msg.text}
                                <div className={`text-[10px] mt-1 ${msg.role === 'ai' ? 'text-slate-400' : 'text-indigo-200'}`}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isProcessing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-3"
                    >
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                            <Bot className="w-4 h-4 animate-pulse" />
                        </div>
                        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex gap-1">
                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-slate-200">
                <div className="flex gap-2 items-end bg-slate-50 border border-slate-200 rounded-lg p-2 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask AI to edit or format..."
                        className="flex-1 bg-transparent border-none text-sm resize-none outline-none max-h-32 text-slate-700 placeholder:text-slate-400"
                        rows={1}
                        style={{ minHeight: '40px' }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isProcessing}
                        className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIChatSidebar;
