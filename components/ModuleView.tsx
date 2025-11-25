import React, { useState } from 'react';
import { ELASTIC_MODULES, CORE_KNOWLEDGE_BASE } from '../constants';
import { ModuleDefinition } from '../types';
import { ChevronRight, ArrowLeft, BookOpen, CheckCircle, Sparkles, ExternalLink } from 'lucide-react';
import { generateTutorResponse } from '../services/geminiService';
import ElasticLoader from './ElasticLoader';

const ModuleView: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleDefinition | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleModuleSelect = async (module: ModuleDefinition) => {
    setActiveModule(module);
    setLoading(true);
    try {
      const content = await generateTutorResponse(
        [], 
        `Write a "Deep Dive" study guide for the module: "${module.title}". 
        Cover these topics: ${module.topics.join(', ')}. 
        
        CRITICAL INSTRUCTIONS:
        1. Use the provided CORE KNOWLEDGE BASE for analogies (e.g. Cluster=Airport, Beats=Microwave).
        2. STRUCTURE: Use clear Headings (#), Subheadings (##), and Bullet points.
        3. FORMATTING: Use **Bold** for important terms. Use \`code\` for tech terms.
        4. DEFINITIONS: Define all acronyms like ILM (Index Lifecycle Management) on first use.
        5. VISUALS: Create ASCII diagrams or use Box-drawing characters to explain flows (e.g. Data -> Ingest -> Index).
        6. RESOURCES: Add a "Resources" section with [Google Search Links](url) and [YouTube Links](url) for key concepts.
        7. PERSONA: Teach me like I'm a smart engineer preparing for a Solution Architect role. Switch between "Technical Details" and "Business Value".
        8. DAVID TIP: Include a random > "David's Tip" in a blockquote.
        
        Context Data:
        ${CORE_KNOWLEDGE_BASE}`
      );
      setGeneratedContent(content || "Failed to load content.");
    } catch (e) {
      setGeneratedContent("Error loading module content. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  // Robust Markdown Parser
  const renderMarkdownText = (text: string) => {
    // Split by Markdown patterns: **bold**, `code`, [link](url)
    // Regex explanation:
    // 1. (`[^`]+`) -> Inline code
    // 2. (\*\*.*?\*\*) -> Bold
    // 3. (\[.*?\]\(.*?\)) -> Link
    const regex = /(`[^`]+`|\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      // Inline Code
      if (part.startsWith('`') && part.endsWith('`')) {
         return <code key={index} className="bg-elastic-card px-1.5 py-0.5 rounded text-elastic-pink font-mono text-xs border border-elastic-hover">{part.slice(1, -1)}</code>;
      }
      // Bold
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="text-elastic-yellow font-bold text-shadow-sm">{part.slice(2, -2)}</strong>;
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
              className="text-elastic-blue hover:text-elastic-teal hover:underline underline-offset-4 transition-all inline-flex items-baseline gap-1 font-medium mx-1"
            >
              {match[1]} <ExternalLink size={10} className="inline" />
            </a>
          );
        }
      }
      return part;
    });
  };

  if (activeModule) {
    return (
      <div className="h-full overflow-y-auto p-4 md:p-8 bg-gradient-to-br from-elastic-dark to-black/50">
        <button 
          onClick={() => setActiveModule(null)}
          className="flex items-center text-gray-400 hover:text-white mb-6 transition-all hover:-translate-x-1 group"
        >
          <ArrowLeft size={18} className="mr-2 group-hover:text-elastic-teal" /> Back to Modules
        </button>

        <div className="max-w-4xl mx-auto">
          <header className="mb-8 relative overflow-hidden p-8 rounded-2xl bg-gradient-to-r from-elastic-blue/10 to-purple-900/10 border border-elastic-blue/20">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <Sparkles size={120} className="text-elastic-teal" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">{activeModule.title}</h1>
            <p className="text-xl text-elastic-teal font-light">{activeModule.description}</p>
          </header>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-96 glass-panel rounded-2xl">
              <ElasticLoader size="lg" />
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-8 md:p-12 shadow-2xl prose prose-invert max-w-none font-mono text-sm md:text-base leading-relaxed">
              {generatedContent.split('\n').map((line, i) => {
                // Headings
                if (line.startsWith('###')) return <h3 key={i} className="text-xl font-bold text-white mt-8 mb-4 font-sans border-l-4 border-elastic-pink pl-4">{line.replace('###', '')}</h3>;
                if (line.startsWith('##')) return <h2 key={i} className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-elastic-yellow to-orange-400 mt-10 mb-6 font-sans">{line.replace('##', '')}</h2>;
                if (line.startsWith('#')) return <h1 key={i} className="text-3xl md:text-4xl font-bold text-white mb-8 font-sans border-b border-gray-700 pb-4">{line.replace('#', '')}</h1>;
                
                // David Castillo Tip (Blockquote)
                if (line.trim().startsWith('>')) {
                  return (
                    <div key={i} className="my-6 p-6 border-l-4 border-elastic-yellow bg-gradient-to-r from-elastic-yellow/10 to-transparent rounded-r-xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-2 opacity-10">
                         <Sparkles size={60} className="text-elastic-yellow" />
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-elastic-yellow/20 p-1 rounded">
                           <Sparkles size={14} className="text-elastic-yellow" />
                        </div>
                        <span className="text-xs font-bold text-elastic-yellow uppercase tracking-widest">David's Tip</span>
                      </div>
                      <p className="text-gray-200 italic text-lg font-serif pl-2 border-l-2 border-elastic-yellow/30">{renderMarkdownText(line.replace('>', '').trim())}</p>
                    </div>
                  );
                }

                // Code Blocks
                if (line.includes('+--') || line.includes('|') || line.includes('-->') || line.trim().startsWith('```')) {
                   return (
                    <div key={i} className="my-6 relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-elastic-teal to-elastic-blue opacity-30 group-hover:opacity-50 blur rounded-lg transition duration-200"></div>
                      <pre className="relative bg-black/80 p-6 rounded-lg border border-gray-800 text-xs md:text-sm text-elastic-teal overflow-x-auto whitespace-pre font-mono shadow-inner">{line.replace(/`/g, '')}</pre>
                    </div>
                   );
                }

                // Lists
                if (line.trim().startsWith('- ')) return <li key={i} className="ml-4 text-gray-300 list-none relative pl-6 mb-2 font-sans group"><span className="absolute left-0 text-elastic-pink transform group-hover:scale-125 transition-transform">•</span>{renderMarkdownText(line.replace('- ', ''))}</li>;
                if (line.trim().startsWith('• ')) return <li key={i} className="ml-4 text-gray-300 list-none relative pl-6 mb-2 font-sans group"><span className="absolute left-0 text-elastic-teal transform group-hover:scale-125 transition-transform">▸</span>{renderMarkdownText(line.replace('• ', ''))}</li>;
                if (line.trim().match(/^\d+\./)) {
                    const cleanLine = line.replace(/^\d+\./, '').trim();
                    const number = line.match(/^\d+\./)![0];
                    return <li key={i} className="ml-4 text-gray-300 list-none relative pl-8 mb-2 font-sans"><span className="absolute left-0 text-elastic-blue font-bold">{number}</span>{renderMarkdownText(cleanLine)}</li>;
                }
                
                if (line.trim() === '') return <br key={i} />;
                
                return <p key={i} className="text-gray-300 leading-7 mb-4 font-sans tracking-wide">{renderMarkdownText(line)}</p>;
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto">
      <h2 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Learning Path</h2>
      <p className="text-gray-400 mb-8">Master the Elastic Stack, one module at a time.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {ELASTIC_MODULES.map((module, idx) => (
          <div 
            key={module.id}
            onClick={() => handleModuleSelect(module)}
            className="group glass-panel rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,119,204,0.3)] hover:-translate-y-2 relative overflow-hidden border border-gray-800 hover:border-elastic-blue/50"
          >
            {/* Hover Gradient Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-elastic-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className={`p-4 rounded-xl bg-gradient-to-br ${idx % 2 === 0 ? 'from-elastic-blue/20 to-teal-500/20' : 'from-elastic-pink/20 to-purple-500/20'} group-hover:scale-110 transition-transform duration-300`}>
                  <BookOpen className={`${idx % 2 === 0 ? 'text-elastic-teal' : 'text-elastic-pink'} drop-shadow-md`} size={28} />
                </div>
                <div className="bg-black/40 rounded-full p-1">
                   <CheckCircle className="text-gray-700" size={20} />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-elastic-yellow transition-colors">{module.title}</h3>
              <p className="text-sm text-gray-400 mb-6 h-12 overflow-hidden leading-relaxed">{module.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {module.topics.slice(0, 2).map((t, i) => (
                  <span key={i} className="text-[10px] uppercase tracking-wider font-bold bg-elastic-dark/50 border border-gray-700 text-gray-400 px-2 py-1 rounded-md">
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex items-center text-elastic-blue text-sm font-bold tracking-wide group-hover:translate-x-2 transition-transform">
                START MODULE <ChevronRight size={16} className="ml-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModuleView;