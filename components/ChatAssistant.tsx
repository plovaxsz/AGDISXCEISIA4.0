import React, { useState, useRef, useEffect } from 'react';
import { ProjectData, ChatMessage } from '../types';
import { sendChatToAI } from '../services/aiService';
import { Send, Bot, User, Paperclip, X, Image as ImageIcon, FileText, Trash2, MessageSquare, Sparkles, ChevronRight, ChevronDown } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

const PDFJS_VERSION = '5.4.624';
if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`;
}

interface ChatAssistantProps {
    data: ProjectData;
}

// ===== TEXT FORMATTING & MARKDOWN PARSER =====

/**
 * Format teks panjang dengan line breaks dan markdown sederhana
 * - Batas 500 karakter per line
 * - Parse bullet points (baris mulai dengan "-")
 * - Parse bold (**text**)
 * - Parse paragraf (baris kosong)
 */
const formatAIResponse = (text: string): { formatted: React.ReactNode; isTruncated: boolean; fullText: string } => {
    const MAX_DISPLAY_LENGTH = 2000;
    const isTruncated = text.length > MAX_DISPLAY_LENGTH;
    const displayText = isTruncated ? text.substring(0, MAX_DISPLAY_LENGTH) : text;
    
    // Split by paragraphs (double newline)
    const paragraphs = displayText.split('\n\n');
    
    const formatted = paragraphs.map((paragraph, pIdx) => {
        // Split by single newline
        const lines = paragraph.split('\n').filter(line => line.trim());
        
        const elements = lines.map((line, lineIdx) => {
            // Check if line is a bullet point
            const isBullet = line.trim().startsWith('-');
            const content = isBullet ? line.trim().substring(1).trim() : line.trim();
            
            // Parse bold text (**text**)
            const parts = content.split(/(\*\*[^*]+\*\*)/g).map((part, idx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={idx} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
                }
                // Add line break for long text (>500 chars)
                if (part.length > 500) {
                    const chunks = part.match(/(.{1,500})/g) || [];
                    return chunks.map((chunk, cIdx) => <React.Fragment key={`${idx}-${cIdx}`}>{chunk}<br /></React.Fragment>);
                }
                return part;
            });
            
            // Check line length and add breaks if needed
            let lineWithBreaks = parts;
            
            if (isBullet) {
                return (
                    <div key={lineIdx} className="flex gap-2 items-start">
                        <span className="text-blue-600 dark:text-blue-400 font-bold min-w-fit">•</span>
                        <span className="flex-1">{lineWithBreaks}</span>
                    </div>
                );
            } else {
                return <p key={lineIdx} className="text-slate-700 dark:text-slate-200">{lineWithBreaks}</p>;
            }
        });
        
        return (
            <div key={pIdx} className="mb-4">
                {elements}
            </div>
        );
    });
    
    return {
        formatted,
        isTruncated,
        fullText: text
    };
};

/**
 * Komponen untuk render formatted message dengan expand button
 */
interface FormattedMessageProps {
    text: string;
    isUserMessage: boolean;
}

const FormattedMessage: React.FC<FormattedMessageProps> = ({ text, isUserMessage }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { formatted, isTruncated, fullText } = formatAIResponse(text);
    
    if (isUserMessage) {
        // User messages always render as plain text
        return <p className="whitespace-pre-wrap">{text}</p>;
    }
    
    return (
        <div className="space-y-3">
            <div className="text-sm leading-7 space-y-2">
                {isExpanded ? formatAIResponse(fullText).formatted : formatted}
            </div>
            {isTruncated && !isExpanded && (
                <button
                    onClick={() => setIsExpanded(true)}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all text-xs font-semibold"
                >
                    <ChevronDown className="w-4 h-4" />
                    Lihat selengkapnya
                </button>
            )}
            {isExpanded && isTruncated && (
                <button
                    onClick={() => setIsExpanded(false)}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-xs font-semibold"
                >
                    <ChevronUp className="w-4 h-4" />
                    Sembunyikan
                </button>
            )}
        </div>
    );
};

// Add ChevronUp icon
const ChevronUp = ({ className }: { className: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
);

const ChatAssistant: React.FC<ChatAssistantProps> = ({ data }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { 
            id: '1', 
            role: 'model', 
            text: `Selamat datang di AGDIP Workspace — GovDoc Intelligence. Saya adalah **CEISIA 4.0 X AGDIP X AI Agents**, konsultan cerdas Anda untuk inisiatif "${data.meta.theme}". \n\nAda yang bisa saya bantu terkait penyusunan dokumen, perhitungan UCP, atau analisis risiko hari ini?`, 
            timestamp: new Date() 
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [attachments, setAttachments] = useState<{ type: 'image' | 'file', content: string, name: string }[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => { scrollToBottom() }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim() && attachments.length === 0) return;

        const newUserMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
            timestamp: new Date(),
            attachments: [...attachments]
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInput('');
        setAttachments([]);
        setIsTyping(true);

        try {
            // Prepare chat history for context
            const history = messages.slice(-10).map(m => ({ 
                role: m.role === 'model' ? 'model' : 'user', 
                text: m.text 
            }));
            
            // Call AI Service with proper error handling
            let responseText: string;
            try {
                responseText = await sendChatToAI(history, newUserMsg.text, data, newUserMsg.attachments);
            } catch (aiError) {
                console.error("AI Service Error:", aiError);
                // Provide user-friendly error message
                const errorMsg = aiError instanceof Error ? aiError.message : "Kesalahan koneksi dengan AI service";
                throw new Error(errorMsg);
            }

            // Validate response
            if (!responseText || responseText.trim() === '') {
                throw new Error("Respons kosong dari AI service");
            }
            
            const newBotMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: responseText.trim(),
                timestamp: new Date()
            };
            setMessages(prev => [...prev, newBotMsg]);
        } catch (error) {
            // Display error message in chat
            const errorMessage = error instanceof Error 
                ? error.message 
                : "Terjadi kesalahan saat memproses permintaan Anda";
            
            console.error("Chat Error:", error);
            
            const errorBotMsg: ChatMessage = {
                id: (Date.now() + 2).toString(),
                role: 'model',
                text: `⚠️ **Gagal memproses pesan**\n\n${errorMessage}\n\nMohon coba lagi atau hubungi administrator jika masalah berlanjut.`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorBotMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleClearChat = () => {
        if (window.confirm("Apakah Anda yakin ingin menghapus riwayat chat?")) {
            setMessages([{ 
                id: Date.now().toString(), 
                role: 'model', 
                text: `Sesi telah direset. Saya siap membantu Anda kembali terkait proyek "${data.meta.theme}".`, 
                timestamp: new Date() 
            }]);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                alert("Ukuran file melebihi batas 5MB.");
                return;
            }
            const isImage = file.type.startsWith('image/');
            const isPDF = file.type === 'application/pdf';
            const isText = file.type === 'text/plain' || file.name.endsWith('.txt');

            if (!isImage && !isPDF && !isText) {
                alert("Format tidak didukung. Silakan upload gambar, PDF, atau file teks.");
                return;
            }

            const reader = new FileReader();
            reader.onload = async (event) => {
                if (event.target?.result) {
                    let content = event.target.result as string;
                    setAttachments(prev => [...prev, {
                        type: isImage ? 'image' : 'file',
                        content: content,
                        name: file.name
                    }]);
                }
            };
            reader.readAsDataURL(file);
        }
        if(fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-50 dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-fade-in font-sans">
            <div className="px-8 py-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E293B] flex items-center justify-between z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                            <Bot className="w-6 h-6" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">AGDIP Agents</h3>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Online • Secure Channel</p>
                    </div>
                </div>
                <button onClick={handleClearChat} className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all duration-200"><Trash2 className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#F8FAFC] dark:bg-[#0F172A]">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-5 ${msg.role === 'user' ? 'flex-row-reverse' : ''} group animate-slide-up`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-100 text-blue-600'}`}>
                            {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-6 h-6" />}
                        </div>
                        <div className={`max-w-[70%] space-y-3`}>
                            {msg.attachments && msg.attachments.length > 0 && (
                                <div className={`flex gap-2 flex-wrap ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.attachments.map((att, idx) => (
                                        <div key={idx} className="bg-white p-2 rounded-xl text-xs flex items-center gap-2 border border-slate-200 shadow-sm transition-transform hover:scale-105">
                                            {att.type === 'image' ? <img src={att.content} className="w-12 h-12 object-cover rounded-lg" alt="preview" /> : <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center"><FileText className="w-6 h-6 text-slate-500"/></div>}
                                            <span className="truncate max-w-[140px] font-medium text-slate-700">{att.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className={`p-6 rounded-2xl text-sm leading-7 shadow-sm ${msg.role === 'user' ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-tr-none' : 'bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none'}`}><FormattedMessage text={msg.text} isUserMessage={msg.role === 'user'} /></div>
                            <span className={`text-[10px] text-slate-400 block px-2 font-medium tracking-wide ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>{msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex gap-5 animate-pulse">
                        <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-blue-600 shadow-sm"><Bot className="w-6 h-6" /></div>
                        <div className="p-6 bg-white dark:bg-[#1E293B] rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 flex gap-2 items-center shadow-sm w-fit"><span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span><span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></span><span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></span></div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-6 bg-white dark:bg-[#1E293B] border-t border-slate-200 dark:border-slate-800">
                {attachments.length > 0 && (
                    <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
                        {attachments.map((att, i) => (
                            <div key={i} className="relative group shrink-0">
                                {att.type === 'image' ? <img src={att.content} alt="preview" className="h-16 w-16 object-cover rounded-xl border border-slate-200 shadow-sm" /> : <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"><FileText className="w-8 h-8 text-slate-400"/></div>}
                                <button onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-md hover:scale-110"><X className="w-3 h-3" /></button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex gap-4 items-end bg-slate-50 dark:bg-[#0F172A] p-2 rounded-2xl border border-slate-200 dark:border-slate-700 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                    <button onClick={() => fileInputRef.current?.click()} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all"><Paperclip className="w-5 h-5" /><input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept="image/*,.pdf,.txt" /></button>
                    <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Tulis pesan Anda di sini..." className="flex-1 bg-transparent border-none outline-none resize-none max-h-32 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 font-medium" rows={1} />
                    <button onClick={handleSend} disabled={!input.trim() && attachments.length === 0} className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95"><Send className="w-5 h-5" /></button>
                </div>
            </div>
        </div>
    );
};

export default ChatAssistant;