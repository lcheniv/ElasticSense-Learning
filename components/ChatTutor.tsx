import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { generateTutorResponse, startMockInterviewSession } from '../services/geminiService';
import { Send, User, Bot, Briefcase, Zap, AlertTriangle, Play, Sparkles, ExternalLink } from 'lucide-react';
import ElasticLoader from './ElasticLoader';

interface ChatTutorProps {
  mode: 'tutor' | 'interview';
}

const ChatTutor: React.FC<ChatTutorProps> = ({ mode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [interviewConfig, setInterviewConfig] = useState<{ type: string; level: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<{ role: 'user' | 'model'; parts: { text: string }[] }[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    setMessages([]);
    historyRef.current = [];
    setInterviewConfig(null);
  }, [mode]);

  const startInterview = async (type: string, level: string) => {
    setInterviewConfig({ type, level });
    setIsLoading(true);
    try {
      const { initialMessage } = await startMockInterviewSession(type, level);
      const msg: Message = {
        id: Date.now().toString(),
        role: 'model',
        text: initialMessage,
        timestamp: Date.now()
      };
      setMessages([msg]);
      historyRef.current = [{ role: 'model', parts: [{ text: initialMessage }] }];
    } catch (e) {
      alert("Error starting interview");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const responseText = await generateTutorResponse(historyRef.current, userMsg.text);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botMsg]);
      
      historyRef.current.push(
        { role: 'user', parts: [{ text: userMsg.text }] },
        { role: 'model', parts: [{ text: responseText }] }
      );

    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Connection lost. The cluster might be red. Please try again.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Robust Markdown Parser for Chat
  const renderMarkdownText = (text: string) => {
    const regex = /(`[^`]+`|\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      // Inline Code
      if (part.startsWith('`') && part.endsWith('`')) {
         return <code key={index} className="bg-black/30 px-1.5 py-0.5 rounded text-elastic-pink font-mono text-xs border border-white/10">{part.slice(1, -1)}</code>;
      }
      // Bold
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="text-elastic-yellow font-bold">{part.slice(2, -2)}</strong>;
      }
      // Link
      if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
        const match = part.match(/\[(.*?)\]\((.*?)\)/);
        if (match) {
          return (
            <a 
              key={index} 
              href={match[2]} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-elastic-blue hover:text-white underline underline-offset-2 transition-colors font-medium inline-flex items-center gap-1"
            >
              {match[1]} <ExternalLink size={10} />
            </a>
          );
        }
      }
      return part;
    });
  };

  if (mode === 'interview' && !interviewConfig) {
    return (
      <div className="h-full flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-elastic-dark to-black">
        <div className="max-w-3xl w-full">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-elastic-pink via-white to-elastic-teal mb-4">Choose Your Challenge</h2>
            <p className="text-gray-400">Select an interview simulation mode to begin.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button 
              onClick={() => startInterview('Technical Deep Dive', 'Senior')}
              className="group relative bg-elastic-card/40 backdrop-blur-md border border-elastic-hover p-8 rounded-2xl text-left transition-all hover:scale-105 hover:border-elastic-pink hover:bg-elastic-pink/10 hover:shadow-[0_0_30px_rgba(255,90,146,0.2)] overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                <Zap size={100} />
              </div>
              <div className="bg-elastic-pink/20 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-elastic-pink group-hover:text-white transition-colors">
                 <Zap className="text-elastic-pink group-hover:text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-elastic-pink transition-colors">Technical Deep Dive</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Brutal questions on sharding strategies, ILM (Index Lifecycle Management) policies, heap sizing, and performance bottlenecks.
              </p>
              <div className="mt-6 flex items-center text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-white">
                Start Simulation <Play size={12} className="ml-2" />
              </div>
            </button>

            <button 
              onClick={() => startInterview('Sales Discovery', 'Manager')}
              className="group relative bg-elastic-card/40 backdrop-blur-md border border-elastic-hover p-8 rounded-2xl text-left transition-all hover:scale-105 hover:border-elastic-teal hover:bg-elastic-teal/10 hover:shadow-[0_0_30px_rgba(0,191,179,0.2)] overflow-hidden"
            >
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                <Briefcase size={100} />
              </div>
              <div className="bg-elastic-teal/20 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-elastic-teal group-hover:text-white transition-colors">
                 <Briefcase className="text-elastic-teal group-hover:text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-elastic-teal transition-colors">Sales Discovery</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Focus on business value, ROI, displacing competitors, and handling objections from CTOs.
              </p>
              <div className="mt-6 flex items-center text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-white">
                Start Simulation <Play size={12} className="ml-2" />
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-transparent relative">
      <div className="p-4 border-b border-gray-800 bg-elastic-dark/80 backdrop-blur-lg flex justify-between items-center z-10 sticky top-0 shadow-lg">
        <div>
           <h2 className="text-lg font-bold text-white flex items-center gap-2">
             {mode === 'tutor' ? <Bot size={20} className="text-elastic-blue" /> : <AlertTriangle size={20} className="text-elastic-pink animate-pulse" />}
             {mode === 'tutor' ? 'AI Tutor' : `${interviewConfig?.type} Interview`}
           </h2>
           {mode === 'interview' && <span className="text-[10px] text-elastic-yellow uppercase tracking-widest font-bold pl-7">Live Session Active</span>}
        </div>
        {mode === 'interview' && (
             <button 
               onClick={() => setInterviewConfig(null)}
               className="text-xs bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-3 py-1 rounded-full transition-colors border border-red-500/50"
             >
               End Session
             </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && mode === 'tutor' && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                <div className="relative mb-6">
                   <div className="absolute inset-0 bg-elastic-blue blur-2xl opacity-20 rounded-full animate-pulse"></div>
                   <Bot size={80} className="text-white relative z-10" />
                </div>
                <p className="text-2xl font-bold text-white mb-2">ElasticSense Tutor</p>
                <p className="text-gray-400 mb-8 max-w-md">Your personal AI mentor for mastering the Elastic Stack.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
                  {["Explain Sharding vs Replication", "Draw a Cluster Diagram", "How does BM25 work?", "Why use Logstash over Beats?"].map((q, i) => (
                    <button key={i} onClick={() => setInputValue(q)} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-sm text-gray-300 transition-colors text-left">
                      "{q}"
                    </button>
                  ))}
                </div>
            </div>
        )}

        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg border border-white/10
              ${msg.role === 'user' ? 'bg-gradient-to-br from-blue-600 to-blue-800' : 'bg-gradient-to-br from-elastic-dark to-gray-800'}
            `}>
              {msg.role === 'user' ? <User size={18} className="text-white" /> : <Bot size={18} className="text-elastic-teal" />}
            </div>
            
            <div className={`
              max-w-[85%] rounded-2xl p-5 text-sm leading-relaxed shadow-xl backdrop-blur-sm
              ${msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none font-sans' 
                : 'bg-gray-800/80 text-gray-200 border border-gray-700 rounded-tl-none'
              }
            `}>
              {msg.text.split('\n').map((line, i) => {
                 // Code Blocks
                 if (line.includes('+--') || line.includes('|') || line.includes('-->') || line.startsWith('   ')) {
                    return <pre key={i} className="text-xs text-elastic-teal overflow-x-auto whitespace-pre font-mono my-3 p-3 bg-black/50 rounded-lg border border-gray-700/50 shadow-inner">{line}</pre>;
                 }
                 // David Tip
                 if (line.trim().startsWith('>')) {
                    return (
                        <div key={i} className="my-3 p-3 border-l-2 border-elastic-yellow bg-elastic-yellow/5 rounded-r text-gray-300 italic text-xs">
                             <div className="flex items-center gap-1 mb-1 text-elastic-yellow font-bold text-[10px] uppercase tracking-wider">
                                <Sparkles size={10} /> David's Tip
                             </div>
                             {renderMarkdownText(line.replace('>', '').trim())}
                        </div>
                    );
                 }

                 return <p key={i} className={i > 0 ? "mt-2" : ""}>{renderMarkdownText(line)}</p>;
              })}
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-elastic-dark to-gray-800 flex items-center justify-center shrink-0 border border-white/10">
                  <Bot size={18} className="text-elastic-teal" />
              </div>
              <div className="bg-gray-800/50 px-6 py-4 rounded-2xl rounded-tl-none border border-gray-700">
                  <ElasticLoader size="sm" text="" />
              </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-800 bg-elastic-dark/90 backdrop-blur-xl">
        <div className="relative max-w-4xl mx-auto">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={mode === 'tutor' ? "Ask about Clusters, Nodes, or Vectors..." : "Type your answer..."}
            className="w-full bg-black/40 border border-gray-700 text-white rounded-full py-4 px-6 pr-14 focus:outline-none focus:border-elastic-blue focus:ring-1 focus:ring-elastic-blue shadow-inner transition-all placeholder-gray-600"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-elastic-blue text-white rounded-full hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-elastic-blue transition-all flex items-center justify-center shadow-lg hover:shadow-blue-500/30"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatTutor;